"""
NLP Parser module for farmer feedback using Google Gemini API with fallback heuristic parsing.
"""

import os
import json
import re
from typing import Dict, Any, Optional

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


SYSTEM_PROMPT = """
You are an expert Agricultural AI assistant. Your job is to parse a farmer's natural language update or weather report, and extract structured adjustments to soil and environmental variables.

Inputs:
- Current baseline conditions: N, P, K, pH, Temperature (deg C), Humidity (%), Rainfall (mm)
- Crop name and current growth stage (e.g. Sowing, Vegetative, Flowering, Maturity)
- Days since sowing
- Farmer's text update (e.g., "Tmr news said heavy rain 40mm", "Heatwave 36C expected for next 4 days", "Applied 20kg nitrogen fertilizer", "Soil is drying out fast")

Output MUST be a valid JSON object strictly matching this schema:
{
  "affected_feature": "rainfall" | "temperature" | "humidity" | "soil_moisture" | "unknown",
  "adjustment_direction": "increase" | "decrease" | "unknown",
  "adjustment_magnitude": float (e.g. 0.3 for 30% increase or absolute shift fraction),
  "tweaked_N": float,
  "tweaked_P": float,
  "tweaked_K": float,
  "tweaked_pH": float,
  "tweaked_temperature": float,
  "tweaked_humidity": float,
  "tweaked_rainfall": float,
  "weather_event": "rain" | "heatwave" | "cold_wave" | "dry_spell" | "fertilizer_applied" | "pest_disease" | "normal",
  "farmer_explanation": "Clear, concise 1-2 sentence explanation of what changed and its farming impact.",
  "actionable_advisory": "Actionable agronomic advice (e.g. pause irrigation, clear drainage channels, apply foliar spray)."
}
Do NOT return markdown fences (```json ... ```), return ONLY the raw JSON string.
"""

def _load_env_if_needed():
    if not os.environ.get("GEMINI_API_KEY"):
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY=") and not line.startswith("#"):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        os.environ["GEMINI_API_KEY"] = val
                        break

_load_env_if_needed()

def parse_feedback_with_gemini(
    feedback_text: str,
    baseline: Dict[str, float],
    crop_name: str,
    stage_name: str,
    days_since_sowing: int,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Parses feedback using Gemini. If API key is missing or call fails, falls back to heuristic parser.
    """
    _load_env_if_needed()
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key or not GENAI_AVAILABLE:
        return parse_feedback_heuristic(feedback_text, baseline, crop_name, stage_name, days_since_sowing)

    try:
        genai.configure(api_key=key)
        
        # Try latest active models
        candidate_models = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-lite-latest"]
        response = None
        
        user_prompt = f"""
Current Baseline Soil & Weather:
- Nitrogen (N): {baseline.get('n', 80)}
- Phosphorus (P): {baseline.get('p', 50)}
- Potassium (K): {baseline.get('k', 40)}
- pH: {baseline.get('ph', 6.5)}
- Temperature: {baseline.get('temperature', 26.0)} deg C
- Humidity: {baseline.get('humidity', 65.0)}%
- Rainfall: {baseline.get('rainfall', 120.0)} mm

Crop Details:
- Crop: {crop_name}
- Current Stage: {stage_name}
- Days Since Sowing: {days_since_sowing}

Farmer's Message / Update:
"{feedback_text}"
"""
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(
                    f"{SYSTEM_PROMPT}\n\n{user_prompt}",
                    generation_config={"temperature": 0.2, "response_mime_type": "application/json"}
                )
                if response and response.text:
                    break
            except Exception as me:
                print(f"Model {model_name} attempt failed: {me}")
                continue

        if not response or not response.text:
            raise RuntimeError("All Gemini model attempts failed")
        
        text = response.text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\n|\n```$", "", text, flags=re.MULTILINE)
        
        parsed = json.loads(text)
        return parsed
    except Exception as e:
        print(f"Gemini API call failed ({e}), falling back to heuristic parser.")
        return parse_feedback_heuristic(feedback_text, baseline, crop_name, stage_name, days_since_sowing)


def parse_feedback_heuristic(
    feedback_text: str,
    baseline: Dict[str, float],
    crop_name: str,
    stage_name: str,
    days_since_sowing: int
) -> Dict[str, Any]:
    """
    Rule-based NLP parser that handles common farmer reports reliably without external API.
    """
    text_lower = feedback_text.lower()
    
    n = float(baseline.get('n', 80.0))
    p = float(baseline.get('p', 50.0))
    k = float(baseline.get('k', 40.0))
    ph = float(baseline.get('ph', 6.5))
    temp = float(baseline.get('temperature', 26.0))
    humid = float(baseline.get('humidity', 65.0))
    rain = float(baseline.get('rainfall', 120.0))

    affected_feature = "unknown"
    direction = "unknown"
    magnitude = 0.2
    event = "normal"
    explanation = f"Adaptive schedule updated for {crop_name} based on reported field conditions."
    advisory = "Monitor soil moisture regularly and follow updated irrigation timeline."

    # 1. Rain / Storm / Waterlogging
    if any(w in text_lower for w in ["rain", "raining", "storm", "downpour", "flood", "wet", "waterlog", "shower", "cloudburst"]):
        affected_feature = "rainfall"
        direction = "increase"
        event = "rain"
        rain_add = 50.0
        # Check if numbers mentioned (e.g., "30mm", "40 mm")
        num_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:mm|cm|inch)", text_lower)
        if num_match:
            rain_add = float(num_match.group(1)) * (10 if "cm" in text_lower else (25.4 if "inch" in text_lower else 1))
        
        rain = rain + rain_add
        humid = min(100.0, humid + 15.0)
        temp = max(15.0, temp - 2.5)
        magnitude = round(rain_add / max(rain, 1), 2)
        explanation = f"Heavy rainfall ({rain_add:.1f}mm) reported. Soil moisture increased and evaporation decreased."
        advisory = "Pause active irrigation immediately. Ensure field drainage channels are clear to prevent waterlogging."

    # 2. Heatwave / Hot / High Temp / Dry
    elif any(w in text_lower for w in ["heat", "hot", "sun", "sunny", "heatwave", "dry", "drought", "parched"]):
        affected_feature = "temperature"
        direction = "increase"
        event = "heatwave"
        temp_add = 4.0
        num_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:c|deg|degree)", text_lower)
        if num_match:
            temp = float(num_match.group(1))
        else:
            temp = temp + temp_add
        
        humid = max(20.0, humid - 15.0)
        rain = max(0.0, rain - 15.0)
        magnitude = 0.25
        explanation = f"High temperature / heat condition detected ({temp:.1f}°C). Evapotranspiration will accelerate."
        advisory = "Increase irrigation frequency or depth during cooler early morning or evening hours to avoid thermal shock."

    # 3. Cold Wave / Frost / Winter Chill
    elif any(w in text_lower for w in ["cold", "frost", "chill", "winter", "cool", "low temp"]):
        affected_feature = "temperature"
        direction = "decrease"
        event = "cold_wave"
        temp = max(10.0, temp - 5.0)
        humid = min(95.0, humid + 10.0)
        magnitude = 0.20
        explanation = f"Cold temperatures detected ({temp:.1f}°C). Crop metabolic growth rate and water consumption slow down."
        advisory = "Reduce water application to avoid cold-induced root suffocation; protect delicate blossoms if in flowering stage."

    # 4. Fertilizer applied / Nutrients
    elif any(w in text_lower for w in ["fertilizer", "urea", "dap", "potash", "npk", "manure", "nitrogen"]):
        affected_feature = "soil_moisture"
        direction = "increase"
        event = "fertilizer_applied"
        n = min(140.0, n + 25.0)
        p = min(100.0, p + 15.0)
        k = min(80.0, k + 10.0)
        magnitude = 0.30
        explanation = "Nutrient application registered. Crop vegetative growth potential boosted."
        advisory = "Provide light irrigation (15-20mm) to dissolve nutrients into the root zone without leaching."

    # 5. Pest / Disease
    elif any(w in text_lower for w in ["pest", "disease", "worm", "fungus", "blight", "rot", "insects", "locust"]):
        affected_feature = "unknown"
        direction = "decrease"
        event = "pest_disease"
        magnitude = 0.15
        explanation = "Crop health stress / pest attack reported. Plant vegetative progression may experience mild delay."
        advisory = "Apply targeted biopesticide or recommended spray. Avoid excess moisture on canopy."

    return {
        "affected_feature": affected_feature,
        "adjustment_direction": direction,
        "adjustment_magnitude": magnitude,
        "tweaked_N": round(n, 2),
        "tweaked_P": round(p, 2),
        "tweaked_K": round(k, 2),
        "tweaked_pH": round(ph, 2),
        "tweaked_temperature": round(temp, 2),
        "tweaked_humidity": round(humid, 2),
        "tweaked_rainfall": round(rain, 2),
        "weather_event": event,
        "farmer_explanation": explanation,
        "actionable_advisory": advisory
    }
