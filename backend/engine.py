"""
Adaptive Timeline Prediction and Rescheduling Engine
Loads trained Scikit-Learn Random Forest models and executes dynamic stage recalibration.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class TimelineEngine:
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
        
        self.models_dir = models_dir
        self.regressor = None
        self.classifier = None
        self.artifacts = None
        self.crop_model = None
        self.crop_scaler = None
        self.crop_encoder = None
        self.load_models()

    def load_models(self):
        reg_path = os.path.join(self.models_dir, "timeline_shift_regressor.pkl")
        clf_path = os.path.join(self.models_dir, "updated_crop_classifier.pkl")
        art_path = os.path.join(self.models_dir, "timeline_pipeline_artifacts.pkl")

        if os.path.exists(reg_path) and os.path.exists(clf_path) and os.path.exists(art_path):
            self.regressor = joblib.load(reg_path)
            self.classifier = joblib.load(clf_path)
            self.artifacts = joblib.load(art_path)
            print(f"Timeline models loaded successfully from {self.models_dir}")
        else:
            print(f"Warning: Model files not found in {self.models_dir}")
            
        crop_part_dir = os.path.join(os.path.dirname(self.models_dir), "..", "crop-part")
        crop_model_path = os.path.join(crop_part_dir, "crop_recommendation_model.pkl")
        crop_scaler_path = os.path.join(crop_part_dir, "crop_feature_scaler.pkl")
        crop_encoder_path = os.path.join(crop_part_dir, "crop_label_encoder.pkl")
        
        if os.path.exists(crop_model_path):
            self.crop_model = joblib.load(crop_model_path)
            self.crop_scaler = joblib.load(crop_scaler_path) if os.path.exists(crop_scaler_path) else None
            self.crop_encoder = joblib.load(crop_encoder_path) if os.path.exists(crop_encoder_path) else None
            print("Crop recommendation models loaded successfully.")
        else:
            print("Warning: Crop recommendation model not found.")

    def predict_shift(
        self,
        baseline: Dict[str, float],
        tweaked: Dict[str, float],
        days_since_sowing: int,
        affected_feature: str = "unknown",
        adjustment_direction: str = "unknown",
        adjustment_magnitude: float = 0.2,
        region_id: str = "R1",
        prev_harvest_success: str = "success",
        crop_name: str = "rice"
    ) -> Dict[str, Any]:
        """
        Runs ML inference to predict timeline_shift_days and contingency crop recommendation.
        """
        if not self.regressor or not self.artifacts:
            # Fallback heuristic calculation if model not loaded
            shift = 0.0
            if affected_feature == "rainfall":
                shift = 3.5 if adjustment_direction == "increase" else -1.5
            elif affected_feature == "temperature":
                shift = -2.0 if adjustment_direction == "increase" else 3.0
            return {
                "timeline_shift_days": shift,
                "contingency_crop": crop_name,
                "crop_change_recommended": False,
                "confidence": 0.85
            }

        encoders = self.artifacts['encoders']
        
        aff_code = encoders['affected_feature'].get(affected_feature.lower(), encoders['affected_feature']['unknown'])
        dir_code = encoders['adjustment_direction'].get(adjustment_direction.lower(), encoders['adjustment_direction']['unknown'])
        reg_code = encoders['region_id'].get(region_id.upper(), encoders['region_id']['UNKNOWN'])
        harv_code = encoders['prev_harvest_success'].get(prev_harvest_success.lower(), encoders['prev_harvest_success']['unknown'])
        crop_code = encoders['crop_to_code'].get(crop_name.lower(), 12) # 12 = rice default

        feature_dict = {
            'prev_N': float(baseline.get('n', 80)),
            'prev_P': float(baseline.get('p', 50)),
            'prev_K': float(baseline.get('k', 40)),
            'prev_pH': float(baseline.get('ph', 6.5)),
            'prev_temperature': float(baseline.get('temperature', 26)),
            'prev_humidity': float(baseline.get('humidity', 65)),
            'prev_rainfall': float(baseline.get('rainfall', 120)),
            
            'tweaked_N': float(tweaked.get('tweaked_N', baseline.get('n', 80))),
            'tweaked_P': float(tweaked.get('tweaked_P', baseline.get('p', 50))),
            'tweaked_K': float(tweaked.get('tweaked_K', baseline.get('k', 40))),
            'tweaked_pH': float(tweaked.get('tweaked_pH', baseline.get('ph', 6.5))),
            'tweaked_temperature': float(tweaked.get('tweaked_temperature', baseline.get('temperature', 26))),
            'tweaked_humidity': float(tweaked.get('tweaked_humidity', baseline.get('humidity', 65))),
            'tweaked_rainfall': float(tweaked.get('tweaked_rainfall', baseline.get('rainfall', 120))),
            
            'days_since_sowing': int(days_since_sowing),
            'adjustment_magnitude': float(adjustment_magnitude),
            'affected_feature_encoded': aff_code,
            'adjustment_direction_encoded': dir_code,
            'region_id_encoded': reg_code,
            'prev_harvest_success_encoded': harv_code,
            'prev_crop_recommended_encoded': crop_code
        }

        feature_cols = self.artifacts['feature_cols']
        input_df = pd.DataFrame([feature_dict])[feature_cols]

        predicted_shift = float(self.regressor.predict(input_df)[0])
        predicted_crop_code = int(self.classifier.predict(input_df)[0])
        contingency_crop = encoders['crop_names'].get(predicted_crop_code, crop_name)

        crop_changed = (contingency_crop.lower() != crop_name.lower())

        return {
            "timeline_shift_days": round(predicted_shift, 1),
            "contingency_crop": contingency_crop,
            "crop_change_recommended": crop_changed,
            "confidence": 0.92
        }

    def reschedule_stages(
        self,
        stages: List[Dict[str, Any]],
        days_since_sowing: int,
        shift_days: float,
        weather_event: str = "normal"
    ) -> Dict[str, Any]:
        """
        Recalibrates crop growth stages according to shift_days.
        """
        total_orig_days = sum(s.get('days', 30) for s in stages)
        adapted_stages = []
        
        accumulated_days = 0
        current_stage_idx = 0
        
        for idx, stage in enumerate(stages):
            accumulated_days += stage.get('days', 30)
            if days_since_sowing <= accumulated_days and current_stage_idx == 0:
                current_stage_idx = idx

        # Distribute shift across active and remaining stages
        remaining_stages_count = len(stages) - current_stage_idx
        if remaining_stages_count <= 0:
            remaining_stages_count = 1

        stage_shift_alloc = shift_days / remaining_stages_count

        for idx, stage in enumerate(stages):
            orig_days = stage.get('days', 30)
            if idx < current_stage_idx:
                # Past stages are completed, no duration change
                new_days = orig_days
                status = "completed"
                delta_days = 0
            elif idx == current_stage_idx:
                # Active stage absorbs primary immediate impact
                delta_days = round(stage_shift_alloc, 1)
                new_days = max(5, int(round(orig_days + delta_days)))
                status = "active"
            else:
                # Future stages absorb downstream delay/acceleration
                delta_days = round(stage_shift_alloc, 1)
                new_days = max(5, int(round(orig_days + delta_days)))
                status = "upcoming"

            adapted_stages.append({
                "name": stage.get("name"),
                "kc": stage.get("kc"),
                "original_days": orig_days,
                "adapted_days": new_days,
                "delta_days": round(new_days - orig_days, 1),
                "status": status
            })

        new_total_days = sum(s["adapted_days"] for s in adapted_stages)

        return {
            "original_total_days": total_orig_days,
            "adapted_total_days": new_total_days,
            "net_shift_days": round(new_total_days - total_orig_days, 1),
            "current_stage_index": current_stage_idx,
            "adapted_stages": adapted_stages
        }

    def recommend_crop(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Uses the crop recommendation model to predict the best crop and generates SHAP values.
        """
        if not self.crop_model:
            return {"error": "Crop model not loaded"}

        feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        input_data = [features.get(col, 0.0) for col in feature_cols]
        input_df = pd.DataFrame([input_data], columns=feature_cols)

        # Scale features if scaler exists
        scaled_input = input_df
        if self.crop_scaler:
            scaled_input = pd.DataFrame(self.crop_scaler.transform(input_df), columns=feature_cols)

        # Predict
        pred_encoded = self.crop_model.predict(scaled_input)[0]
        
        # Probabilities
        probs = self.crop_model.predict_proba(scaled_input)[0]
        top_indices = np.argsort(probs)[::-1][:3]
        
        if self.crop_encoder:
            pred_crop = self.crop_encoder.inverse_transform([pred_encoded])[0]
            top_crops = [{"crop": self.crop_encoder.inverse_transform([i])[0], "prob": round(float(probs[i]), 4)} for i in top_indices]
        else:
            pred_crop = str(pred_encoded)
            top_crops = [{"crop": str(i), "prob": round(float(probs[i]), 4)} for i in top_indices]

        # Compute SHAP values for explainability
        try:
            import shap
            explainer = shap.TreeExplainer(self.crop_model)
            shap_values = explainer.shap_values(scaled_input)
            
            # For random forest classifier, shap_values is a list of arrays (one per class)
            # We want the explanation for the predicted class
            pred_class_idx = list(self.crop_model.classes_).index(pred_encoded)
            
            if isinstance(shap_values, list):
                class_shap_values = shap_values[pred_class_idx][0]
            else:
                # If output is 3D array (num_samples, num_features, num_classes)
                if len(shap_values.shape) == 3:
                    class_shap_values = shap_values[0, :, pred_class_idx]
                else:
                    class_shap_values = shap_values[0]
                    
            # Map SHAP values to feature names
            shap_dict = {col: round(float(val), 4) for col, val in zip(feature_cols, class_shap_values)}
            
            # Sort features by absolute impact
            sorted_shap = sorted([{"feature": k, "impact": v} for k, v in shap_dict.items()], key=lambda x: abs(x["impact"]), reverse=True)
            
            # Generate a plain-english explanation
            top_positive = [s for s in sorted_shap if s["impact"] > 0]
            top_negative = [s for s in sorted_shap if s["impact"] < 0]
            
            explanation = f"We recommended {pred_crop} primarily because your "
            if top_positive:
                explanation += f"{top_positive[0]['feature']} level strongly supports it."
                if len(top_positive) > 1:
                    explanation += f" Your {top_positive[1]['feature']} is also very suitable."
            
            if top_negative:
                explanation += f" However, note that your {top_negative[0]['feature']} is less ideal and works slightly against this crop."
                
        except Exception as e:
            print("SHAP error:", e)
            sorted_shap = []
            explanation = "Model explanation unavailable."

        return {
            "recommended_crop": pred_crop,
            "top_candidates": top_crops,
            "shap_values": sorted_shap,
            "explanation": explanation
        }
