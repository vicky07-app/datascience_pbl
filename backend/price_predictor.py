import os
import shutil
import pandas as pd
import numpy as np
import pickle
import math
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import List, Dict, Any, Tuple
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class CropPricePredictor:
    def __init__(self, data_path=None):
        self.model_dir = r"C:\FDS\crop-project\backend\models"
        self.model_path = os.path.join(self.model_dir, "price_model.pkl")
        self.data_dir = r"C:\FDS\crop-project\backend\data"
        self.data_path = data_path or os.path.join(self.data_dir, "tn_crop_market_prices_clean.csv")
        
        # Ensure directories exist
        os.makedirs(self.model_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Copy data if not exists
        if not os.path.exists(self.data_path):
            source_path = r"C:\FDS\comodity_fore\data\tn_crop_market_prices_clean.csv"
            if os.path.exists(source_path):
                shutil.copy(source_path, self.data_path)
            else:
                raise FileNotFoundError(f"Source data file not found: {source_path}")
        
        self.model = None
        self.crop_le = LabelEncoder()
        self.market_le = LabelEncoder()
        
        # Will store final processed data for inference
        self.df = None
        self.latest_data = None
        self.market_info = None
        
        self._load_or_train()

    def _prepare_data(self):
        df = pd.read_csv(self.data_path)
        
        self.market_info = df[['market', 'district', 'latitude', 'longitude']].drop_duplicates().set_index('market')
        df['date_parsed'] = pd.to_datetime(df['date'])
        
        # Aggregate by crop, market, year, month
        monthly = df.groupby(['crop', 'market', 'year', 'month']).agg({
            'price': 'mean',
            'category': 'first',
            'unit': 'first'
        }).reset_index()
        
        monthly = monthly.sort_values(by=['crop', 'market', 'year', 'month'])
        
        # Add lag and rolling features
        monthly['lag_1'] = monthly.groupby(['crop', 'market'])['price'].shift(1)
        monthly['lag_2'] = monthly.groupby(['crop', 'market'])['price'].shift(2)
        monthly['lag_3'] = monthly.groupby(['crop', 'market'])['price'].shift(3)
        monthly['rolling_mean_3'] = monthly.groupby(['crop', 'market'])['price'].shift(1).rolling(window=3, min_periods=1).mean()
        monthly['rolling_mean_6'] = monthly.groupby(['crop', 'market'])['price'].shift(1).rolling(window=6, min_periods=1).mean()
        
        # Cyclical encoding for month
        monthly['month_sin'] = np.sin(2 * np.pi * monthly['month'] / 12)
        monthly['month_cos'] = np.cos(2 * np.pi * monthly['month'] / 12)
        
        monthly = monthly.dropna()
        self.df = monthly.copy()
        
        self.latest_data = self.df.sort_values(['year', 'month']).groupby(['crop', 'market']).last().reset_index()
        return monthly

    def _load_or_train(self):
        monthly = self._prepare_data()
        
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                saved_data = pickle.load(f)
                self.model = saved_data['model']
                self.crop_le = saved_data['crop_le']
                self.market_le = saved_data['market_le']
                print("Loaded trained model from disk.")
        else:
            self._train(monthly)

    def _train(self, df):
        print("Training model...")
        df['crop_encoded'] = self.crop_le.fit_transform(df['crop'])
        df['market_encoded'] = self.market_le.fit_transform(df['market'])
        
        features = ['crop_encoded', 'market_encoded', 'month', 'year', 'lag_1', 'lag_2', 'lag_3', 'rolling_mean_3', 'rolling_mean_6', 'month_sin', 'month_cos']
        target = 'price'
        
        X = df[features]
        y = df[target]
        
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        self.model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        self.model.fit(X_train, y_train)
        
        preds = self.model.predict(X_test)
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2 = r2_score(y_test, preds)
        
        print(f"Model trained. RMSE: {rmse:.2f}, R2: {r2:.4f}")
        
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'crop_le': self.crop_le,
                'market_le': self.market_le
            }, f)

    def get_all_crops(self):
        return sorted(self.df['crop'].unique().tolist())

    def get_crop_categories(self):
        categories = self.df[['category', 'crop']].drop_duplicates()
        cat_dict = {}
        for _, row in categories.iterrows():
            if row['category'] not in cat_dict:
                cat_dict[row['category']] = []
            if row['crop'] not in cat_dict[row['category']]:
                cat_dict[row['category']].append(row['crop'])
        return cat_dict

    def get_markets_for_crop(self, crop_name, user_lat, user_lon, radius_km=100):
        matches = [c for c in self.get_all_crops() if c.lower() == crop_name.lower()]
        if not matches:
            return []
        
        c_name = matches[0]
        crop_data = self.latest_data[self.latest_data['crop'] == c_name]
        
        nearby = []
        for _, row in crop_data.iterrows():
            mkt = row['market']
            if mkt in self.market_info.index:
                m_info = self.market_info.loc[mkt]
                dist = haversine(user_lat, user_lon, m_info['latitude'], m_info['longitude'])
                if dist <= radius_km:
                    nearby.append({
                        "name": mkt,
                        "district": m_info['district'],
                        "latitude": float(m_info['latitude']),
                        "longitude": float(m_info['longitude']),
                        "current_price": float(round(row['price'], 2)),
                        "unit": row['unit'],
                        "distance_km": float(round(dist, 1)),
                        "category": row['category']
                    })
        
        nearby.sort(key=lambda x: x['distance_km'])
        return nearby

    def get_historical_prices(self, crop_name, market_name):
        matches = [c for c in self.get_all_crops() if c.lower() == crop_name.lower()]
        if not matches:
            return []
        c_name = matches[0]
        
        m_matches = [m for m in self.df['market'].unique() if m.lower() == market_name.lower()]
        if not m_matches:
            return []
        m_name = m_matches[0]
        
        hist = self.df[(self.df['crop'] == c_name) & (self.df['market'] == m_name)]
        
        res = []
        for _, row in hist.iterrows():
            date_str = f"{int(row['year'])}-{int(row['month']):02d}"
            res.append({
                "date": date_str,
                "price": float(round(row['price'], 2)),
                "type": "historical"
            })
        return res

    def predict_prices(self, crop_name, market_name, months_ahead=3):
        hist = self.get_historical_prices(crop_name, market_name)
        if not hist:
            return None
        
        c_name = [c for c in self.get_all_crops() if c.lower() == crop_name.lower()][0]
        m_name = [m for m in self.df['market'].unique() if m.lower() == market_name.lower()][0]
        
        last_record = self.df[(self.df['crop'] == c_name) & (self.df['market'] == m_name)].iloc[-1]
        
        curr_year = int(last_record['year'])
        curr_month = int(last_record['month'])
        
        hist_prices = self.df[(self.df['crop'] == c_name) & (self.df['market'] == m_name)]['price'].tolist()
        
        crop_enc = self.crop_le.transform([c_name])[0]
        mkt_enc = self.market_le.transform([m_name])[0]
        
        predictions = []
        
        for _ in range(months_ahead):
            curr_month += 1
            if curr_month > 12:
                curr_month = 1
                curr_year += 1
            
            lag_1 = hist_prices[-1] if len(hist_prices) >= 1 else 0
            lag_2 = hist_prices[-2] if len(hist_prices) >= 2 else 0
            lag_3 = hist_prices[-3] if len(hist_prices) >= 3 else 0
            
            rm_3 = np.mean(hist_prices[-3:]) if len(hist_prices) >= 3 else np.mean(hist_prices)
            rm_6 = np.mean(hist_prices[-6:]) if len(hist_prices) >= 6 else np.mean(hist_prices)
            
            month_sin = np.sin(2 * np.pi * curr_month / 12)
            month_cos = np.cos(2 * np.pi * curr_month / 12)
            
            features = pd.DataFrame([{
                'crop_encoded': crop_enc,
                'market_encoded': mkt_enc,
                'month': curr_month,
                'year': curr_year,
                'lag_1': lag_1,
                'lag_2': lag_2,
                'lag_3': lag_3,
                'rolling_mean_3': rm_3,
                'rolling_mean_6': rm_6,
                'month_sin': month_sin,
                'month_cos': month_cos
            }])
            
            pred = float(self.model.predict(features)[0])
            hist_prices.append(pred)
            
            date_str = f"{curr_year}-{curr_month:02d}"
            predictions.append({
                "date": date_str,
                "price": round(pred, 2),
                "type": "predicted"
            })
            
        avg_hist = sum([h['price'] for h in hist]) / len(hist)
        last_hist_price = hist[-1]['price']
        last_pred_price = predictions[-1]['price']
        
        pct_change = ((last_pred_price - last_hist_price) / last_hist_price) * 100
        trend = "rising" if pct_change > 1 else "falling" if pct_change < -1 else "stable"
        
        return {
            "crop": c_name,
            "market": m_name,
            "unit": last_record['unit'],
            "historical": hist,
            "predicted": predictions,
            "price_trend": trend,
            "avg_historical_price": round(avg_hist, 2),
            "predicted_change_pct": round(pct_change, 1)
        }
