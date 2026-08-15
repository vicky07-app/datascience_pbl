"""
Train and evaluate Adaptive Timeline ML models.
Outputs:
  - timeline_shift_regressor.pkl
  - updated_crop_classifier.pkl
  - timeline_pipeline_artifacts.pkl (includes feature lists, scaler, encoders, metadata)
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, accuracy_score, f1_score, classification_report
from sklearn.preprocessing import StandardScaler

def train_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))
    dataset_path = os.path.join(project_root, "dataset", "timeline_feedback_dataset_cleaned.csv")
    
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    feature_cols = [
        'prev_N', 'prev_P', 'prev_K', 'prev_pH', 'prev_temperature', 'prev_humidity', 'prev_rainfall',
        'tweaked_N', 'tweaked_P', 'tweaked_K', 'tweaked_pH', 'tweaked_temperature', 'tweaked_humidity', 'tweaked_rainfall',
        'days_since_sowing', 'adjustment_magnitude',
        'affected_feature_encoded', 'adjustment_direction_encoded',
        'region_id_encoded', 'prev_harvest_success_encoded', 'prev_crop_recommended_encoded'
    ]

    target_reg = 'timeline_shift_days'
    target_clf = 'updated_crop_recommendation_encoded'

    X = df[feature_cols].copy()
    y_reg = df[target_reg].copy()
    y_clf = df[target_clf].copy()

    # Train-test split (80-20)
    X_train, X_test, y_train_reg, y_test_reg, y_train_clf, y_test_clf = train_test_split(
        X, y_reg, y_clf, test_size=0.20, random_state=42, stratify=y_clf
    )

    print("\n--- Training Timeline Shift Regressor ---")
    reg_rf = RandomForestRegressor(n_estimators=150, max_depth=12, min_samples_split=4, random_state=42)
    reg_rf.fit(X_train, y_train_reg)

    y_pred_reg = reg_rf.predict(X_test)
    mae = mean_absolute_error(y_test_reg, y_pred_reg)
    rmse = root_mean_squared_error(y_test_reg, y_pred_reg)
    r2 = r2_score(y_test_reg, y_pred_reg)

    print(f"Random Forest Regressor Performance:")
    print(f"  MAE : {mae:.4f} days")
    print(f"  RMSE: {rmse:.4f} days")
    print(f"  R^2 : {r2:.4f}")

    print("\n--- Training Crop Contingency Classifier ---")
    clf_rf = RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=4, random_state=42)
    clf_rf.fit(X_train, y_train_clf)

    y_pred_clf = clf_rf.predict(X_test)
    acc = accuracy_score(y_test_clf, y_pred_clf)
    f1 = f1_score(y_test_clf, y_pred_clf, average='weighted')

    print(f"Random Forest Classifier Performance:")
    print(f"  Accuracy: {acc * 100:.2f}%")
    print(f"  F1 Score: {f1:.4f}")

    # Feature Importance
    importances = pd.Series(reg_rf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\nTop 7 Most Important Features for Timeline Shift:")
    print(importances.head(7))

    # Build Mappings & Artifacts
    encoders = {
        'affected_feature': {'humidity': 0, 'rainfall': 1, 'soil_moisture': 2, 'temperature': 3, 'unknown': 4},
        'adjustment_direction': {'decrease': 0, 'increase': 1, 'unknown': 2},
        'region_id': {'R1': 0, 'R2': 1, 'R3': 2, 'R4': 3, 'R5': 4, 'R6': 5, 'UNKNOWN': 6},
        'prev_harvest_success': {'failure': 0, 'partial': 1, 'success': 2, 'unknown': 3},
        'crop_names': {
            0: 'banana', 1: 'blackgram', 2: 'chickpea', 3: 'coconut', 4: 'coffee',
            5: 'cotton', 6: 'groundnut', 7: 'jute', 8: 'lentil', 9: 'maize',
            10: 'mango', 11: 'mungbean', 12: 'rice', 13: 'sugarcane', 14: 'watermelon', 15: 'wheat'
        },
        'crop_to_code': {
            'banana': 0, 'blackgram': 1, 'chickpea': 2, 'coconut': 3, 'coffee': 4,
            'cotton': 5, 'groundnut': 6, 'jute': 7, 'lentil': 8, 'maize': 9,
            'mango': 10, 'mungbean': 11, 'rice': 12, 'sugarcane': 13, 'watermelon': 14, 'wheat': 15
        }
    }

    artifacts = {
        'feature_cols': feature_cols,
        'encoders': encoders,
        'metrics': {
            'regressor_mae': mae,
            'regressor_r2': r2,
            'classifier_accuracy': acc,
            'classifier_f1': f1
        }
    }

    # Save artifacts into _time-line-part/models and backend/models
    save_dirs = [
        os.path.join(base_dir, "models"),
        os.path.join(project_root, "backend", "models")
    ]

    for d in save_dirs:
        os.makedirs(d, exist_ok=True)
        joblib.dump(reg_rf, os.path.join(d, "timeline_shift_regressor.pkl"))
        joblib.dump(clf_rf, os.path.join(d, "updated_crop_classifier.pkl"))
        joblib.dump(artifacts, os.path.join(d, "timeline_pipeline_artifacts.pkl"))
        print(f"Artifacts successfully saved to: {d}")

if __name__ == "__main__":
    train_models()
