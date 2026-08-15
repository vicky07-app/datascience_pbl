"""
FastAPI Server for Smart Crop Advisory System - Adaptive Timeline Module
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from nlp_parser import parse_feedback_with_gemini
from engine import TimelineEngine

app = FastAPI(
    title="Smart Crop Adaptive Timeline API",
    description="Backend API for real-time natural language farmer feedback parsing and dynamic timeline rescheduling.",
    version="1.0.0"
)

# CORS middleware for React / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = TimelineEngine()

# -------------------------------------------------------------
# Request & Response Models
# -------------------------------------------------------------

class SoilWeatherBaseline(BaseModel):
    n: float = Field(default=80.0, description="Nitrogen (kg/ha)")
    p: float = Field(default=50.0, description="Phosphorus (kg/ha)")
    k: float = Field(default=40.0, description="Potassium (kg/ha)")
    ph: float = Field(default=6.5, description="Soil pH")
    temperature: float = Field(default=26.0, description="Temperature (°C)")
    humidity: float = Field(default=65.0, description="Relative Humidity (%)")
    rainfall: float = Field(default=120.0, description="Seasonal Rainfall (mm)")

class CropStage(BaseModel):
    name: str
    days: int
    kc: float

class AdaptiveFeedbackRequest(BaseModel):
    crop_name: str = Field(default="rice", description="Crop identifier (e.g. rice, wheat, maize)")
    days_since_sowing: int = Field(default=35, description="Days elapsed since sowing")
    feedback_text: str = Field(..., description="Farmer's observation, weather news, or voice feedback")
    baseline: SoilWeatherBaseline = Field(default_factory=SoilWeatherBaseline)
    stages: List[CropStage] = Field(default_factory=list, description="Original growth stages")
    region_id: str = Field(default="R1", description="Region code (R1-R6)")
    prev_harvest_success: str = Field(default="success", description="Past harvest outcome: success/failure/partial")
    gemini_api_key: Optional[str] = Field(default=None, description="Optional custom Gemini API key")


class AdaptiveFeedbackResponse(BaseModel):
    status: str
    feedback_text: str
    nlp_extraction: Dict[str, Any]
    ml_prediction: Dict[str, Any]
    timeline_reschedule: Dict[str, Any]
    farmer_explanation: str
    actionable_advisory: str


class CropRecommendationRequest(BaseModel):
    features: SoilWeatherBaseline


class CropRecommendationResponse(BaseModel):
    status: str
    recommended_crop: str
    top_candidates: List[Dict[str, Any]]
    shap_values: List[Dict[str, Any]]
    explanation: str


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "regressor_loaded": engine.regressor is not None,
        "classifier_loaded": engine.classifier is not None,
        "supported_crops": list(engine.artifacts.get("encoders", {}).get("crop_names", {}).values()) if engine.artifacts else []
    }


@app.post("/api/adaptive-reschedule", response_model=AdaptiveFeedbackResponse)
def adaptive_reschedule(req: AdaptiveFeedbackRequest, x_gemini_key: Optional[str] = Header(None)):
    try:
        api_key = req.gemini_api_key or x_gemini_key or os.environ.get("GEMINI_API_KEY")
        
        # 1. Determine active stage name
        active_stage_name = "Vegetative"
        if req.stages:
            acc = 0
            for s in req.stages:
                acc += s.days
                if req.days_since_sowing <= acc:
                    active_stage_name = s.name
                    break

        baseline_dict = req.baseline.model_dump()

        # 2. Extract structured parameters via Gemini / Heuristic Parser
        nlp_res = parse_feedback_with_gemini(
            feedback_text=req.feedback_text,
            baseline=baseline_dict,
            crop_name=req.crop_name,
            stage_name=active_stage_name,
            days_since_sowing=req.days_since_sowing,
            api_key=api_key
        )

        # 3. Predict timeline shift via Scikit-Learn Random Forest Regressor & Classifier
        ml_res = engine.predict_shift(
            baseline=baseline_dict,
            tweaked=nlp_res,
            days_since_sowing=req.days_since_sowing,
            affected_feature=nlp_res.get("affected_feature", "unknown"),
            adjustment_direction=nlp_res.get("adjustment_direction", "unknown"),
            adjustment_magnitude=nlp_res.get("adjustment_magnitude", 0.2),
            region_id=req.region_id,
            prev_harvest_success=req.prev_harvest_success,
            crop_name=req.crop_name
        )

        # 4. Recalibrate growth stages & dates
        stages_dicts = [s.model_dump() for s in req.stages] if req.stages else [
            {"name": "Germination", "days": 15, "kc": 0.35},
            {"name": "Vegetative", "days": 35, "kc": 0.75},
            {"name": "Flowering", "days": 40, "kc": 1.15},
            {"name": "Maturity", "days": 30, "kc": 0.4}
        ]

        reschedule_res = engine.reschedule_stages(
            stages=stages_dicts,
            days_since_sowing=req.days_since_sowing,
            shift_days=ml_res.get("timeline_shift_days", 0.0),
            weather_event=nlp_res.get("weather_event", "normal")
        )

        return AdaptiveFeedbackResponse(
            status="success",
            feedback_text=req.feedback_text,
            nlp_extraction=nlp_res,
            ml_prediction=ml_res,
            timeline_reschedule=reschedule_res,
            farmer_explanation=nlp_res.get("farmer_explanation", "Schedule dynamically adjusted."),
            actionable_advisory=nlp_res.get("actionable_advisory", "Follow updated timeline.")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Adaptive rescheduling failed: {str(e)}")


@app.post("/api/recommend-crop", response_model=CropRecommendationResponse)
def recommend_crop(req: CropRecommendationRequest):
    try:
        features_dict = req.features.model_dump()
        result = engine.recommend_crop(features_dict)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return CropRecommendationResponse(
            status="success",
            recommended_crop=result["recommended_crop"],
            top_candidates=result["top_candidates"],
            shap_values=result["shap_values"],
            explanation=result["explanation"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
