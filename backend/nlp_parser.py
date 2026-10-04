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
You are an expert Agricultural AI Agronomist and Crop Copilot.
Your job is to analyze a farmer's real-time field report, voice note, or weather observation in the context of their specific crop, current growth stage, and current timeline, and provide actionable farming suggestions as well as structured micro-climate shifts.

Inputs:
- Current baseline conditions: N, P, K, pH, Temperature (deg C), Humidity (%), Rainfall (mm)
- Crop name, Season, and full timeline stages
- Current active growth stage and exact days since sowing
- Farmer's observation / update

Output MUST be a valid JSON object strictly matching this schema:
{
  "affected_feature": "rainfall" | "temperature" | "humidity" | "soil_moisture" | "unknown",
  "adjustment_direction": "increase" | "decrease" | "unknown",
  "adjustment_magnitude": float (e.g. 0.3 for 30% shift),
  "tweaked_N": float,
  "tweaked_P": float,
  "tweaked_K": float,
  "tweaked_pH": float,
  "tweaked_temperature": float,
  "tweaked_humidity": float,
  "tweaked_rainfall": float,
  "weather_event": "rain" | "heatwave" | "cold_wave" | "dry_spell" | "fertilizer_applied" | "pest_disease" | "normal",
  "farmer_explanation": "Clear, concise 1-2 sentence explanation of the field shift.",
  "actionable_advisory": "Clear agronomic guidance.",
  "llm_stage_suggestion": "Direct, personalized recommendation tailored to what the farmer should do during their current growth stage based on their feedback.",
  "suggested_actions": ["Specific step 1", "Specific step 2", "Specific step 3"],
  "spoken_farmer_script": "A warm, encouraging, conversational voice script to be read out loud to the farmer. Start with a friendly greeting like 'Hello farmer friend!' or 'Namaste!'. Keep it clear, spoken, empathetic, and actionable."
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
    stages: Optional[list] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Parses feedback using Gemini with full timeline & stage context. If call fails, falls back to heuristic parser.
    """
    _load_env_if_needed()
    key = api_key or os.environ.get("GEMINI_API_KEY")
    if not key or not GENAI_AVAILABLE:
        return parse_feedback_heuristic(feedback_text, baseline, crop_name, stage_name, days_since_sowing, stages)

    try:
        genai.configure(api_key=key)
        
        candidate_models = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-lite-latest"]
        response = None
        
        stages_str = ", ".join([f"{s.get('name', 'Stage')} ({s.get('days', 30)}d)" for s in stages]) if stages else "Standard growth cycle"

        user_prompt = f"""
Current Baseline Soil & Weather:
- Nitrogen (N): {baseline.get('n', 80)} kg/ha
- Phosphorus (P): {baseline.get('p', 50)} kg/ha
- Potassium (K): {baseline.get('k', 40)} kg/ha
- Soil pH: {baseline.get('ph', 6.5)}
- Temperature: {baseline.get('temperature', 26.0)} °C
- Humidity: {baseline.get('humidity', 65.0)}%
- Rainfall: {baseline.get('rainfall', 120.0)} mm

Crop & Timeline Context:
- Crop: {crop_name}
- Full Timeline Stages: {stages_str}
- Current Active Stage: {stage_name}
- Days Since Sowing: Day {days_since_sowing}

Farmer's Observation / Report:
"{feedback_text}"

Please provide comprehensive stage-specific advice, structured shift parameters, and a warm spoken farmer script.
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
        if "suggested_actions" not in parsed or not isinstance(parsed["suggested_actions"], list):
            parsed["suggested_actions"] = [
                f"Adjust active watering schedule for {stage_name} stage",
                "Monitor soil moisture at 15cm depth",
                "Follow updated crop calendar"
            ]
        if "llm_stage_suggestion" not in parsed:
            parsed["llm_stage_suggestion"] = parsed.get("actionable_advisory", f"Recommendation for {crop_name} during {stage_name} stage.")
        if "spoken_farmer_script" not in parsed:
            parsed["spoken_farmer_script"] = f"Hello farmer friend! For your {crop_name} in the {stage_name} stage, {parsed.get('llm_stage_suggestion', parsed.get('farmer_explanation'))} Have a productive farming day!"
        return parsed
    except Exception as e:
        print(f"Gemini API call failed ({e}), falling back to heuristic parser.")
        return parse_feedback_heuristic(feedback_text, baseline, crop_name, stage_name, days_since_sowing, stages)


def parse_feedback_heuristic(
    feedback_text: str,
    baseline: Dict[str, float],
    crop_name: str,
    stage_name: str,
    days_since_sowing: int,
    stages: Optional[list] = None
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
    suggestion = f"For your {crop_name} in the {stage_name} stage (Day {days_since_sowing}), maintain recommended soil moisture and check for timely nutrient uptake."
    actions = [
        f"Continue tracking {stage_name} stage growth parameters",
        "Inspect soil moisture at root zone before next watering",
        "Maintain clean field borders"
    ]

    spoken_script = f"Hello farmer friend! For your {crop_name} in the {stage_name} stage today, your field conditions are steady. Keep monitoring moisture and have a great farming day."

    # 1. Rain / Storm / Waterlogging
    if any(w in text_lower for w in ["rain", "raining", "storm", "downpour", "flood", "wet", "waterlog", "shower", "cloudburst"]):
        affected_feature = "rainfall"
        direction = "increase"
        event = "rain"
        rain_add = 50.0
        num_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:mm|cm|inch)", text_lower)
        if num_match:
            rain_add = float(num_match.group(1)) * (10 if "cm" in text_lower else (25.4 if "inch" in text_lower else 1))
        
        rain = rain + rain_add
        humid = min(100.0, humid + 15.0)
        temp = max(15.0, temp - 2.5)
        magnitude = round(rain_add / max(rain, 1), 2)
        explanation = f"Heavy rainfall ({rain_add:.1f}mm) registered. Soil moisture is saturated and evaporation has decreased."
        advisory = "Pause active irrigation immediately. Ensure field drainage channels are clear to prevent waterlogging and root suffocation."
        suggestion = f"Since your {crop_name} is currently in the {stage_name} stage (Day {days_since_sowing}), hold off on all irrigation for at least 4-5 days. Avoid heavy fertilizer application right now to prevent nutrient leaching from soil runoff."
        actions = [
            f"Pause scheduled irrigation events for the active {stage_name} stage",
            "Inspect field drainage ditches to prevent pooling around roots",
            "Postpone nitrogen fertilizer top-dressing until topsoil dries",
            "Check for signs of waterborne fungal pathogens after rain clears"
        ]
        spoken_script = f"Hello farmer friend! Heavy rain is reported in your area. For your {crop_name} in the {stage_name} stage, please pause all watering for the next 4 to 5 days and make sure your drainage channels are clear so the roots stay healthy and strong!"

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
        suggestion = f"High temperatures accelerate crop transpiration in the {stage_name} stage. Water during early dawn (5-8 AM) or late evening to minimize evaporation loss and preserve flower/leaf turgor."
        actions = [
            f"Switch {stage_name} stage watering to early morning or late evening",
            "Apply mulch or straw cover over exposed soil to retain moisture",
            "Shorten irrigation intervals to prevent moisture depletion beyond MAD",
            "Monitor canopy for leaf rolling or heat stress wilt"
        ]
        spoken_script = f"Attention farmer friend! High heat is detected. To protect your {crop_name} during this {stage_name} stage, please water your fields early in the morning between 5 and 8 AM, or in the evening. This prevents heat shock and saves precious water!"

    # 3. Cold Wave / Frost / Winter Chill
    elif any(w in text_lower for w in ["cold", "frost", "chill", "winter", "cool", "low temp"]):
        affected_feature = "temperature"
        direction = "decrease"
        event = "cold_wave"
        temp = max(10.0, temp - 5.0)
        num_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:c|deg|degree)", text_lower)
        if num_match:
            temp = float(num_match.group(1))
        humid = min(95.0, humid + 10.0)
        magnitude = 0.20
        explanation = f"Cold temperatures detected ({temp:.1f}°C). Crop metabolic growth rate and water consumption slow down."
        advisory = "Reduce water application to avoid cold-induced root suffocation; protect delicate blossoms if in flowering stage."
        suggestion = f"Cold shock slows down cell division during {stage_name} stage. Reduce watering depth by 20% to keep soil temperature warmer around the root system."
        actions = [
            f"Reduce water depth by 20% during the cold spell for {stage_name} stage",
            "Avoid night-time flood watering which drops soil temperatures",
            "Apply light potassium foliar spray to boost plant frost resistance"
        ]
        spoken_script = f"Namaste farmer friend! Cold weather is slowing crop growth for your {crop_name}. Reduce watering depth by 20 percent and avoid night-time watering to keep the root zone warm and protected!"

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
        suggestion = f"Now that nutrients are applied in {stage_name} stage, provide a light irrigation (15-20mm) within 24 hours to dissolve fertilizers directly into the active root feeding zone."
        actions = [
            "Provide immediate light irrigation (15-20mm) to dissolve fertilizer",
            "Ensure water does not overflow field bunds to retain nutrients",
            "Observe leaf color and vigor improvement over next 4-6 days"
        ]
        spoken_script = f"Great work applying fertilizers! For your {crop_name} in the {stage_name} stage, give a light irrigation of about 15 to 20 millimeters within 24 hours so your crops absorb all those nutrients without washing them away!"

    # 5. Pest / Disease
    elif any(w in text_lower for w in ["pest", "disease", "worm", "fungus", "blight", "rot", "insects", "locust"]):
        affected_feature = "unknown"
        direction = "decrease"
        event = "pest_disease"
        magnitude = 0.15
        explanation = "Crop health stress / pest attack reported. Plant vegetative progression may experience mild delay."
        advisory = "Apply targeted biopesticide or recommended spray. Avoid excess moisture on canopy."
        suggestion = f"Address pest pressure immediately during the {stage_name} stage. Avoid overhead sprinkler watering which creates moist canopy conditions favored by fungal spores."
        actions = [
            "Apply recommended eco-friendly biopesticide or neem oil spray",
            "Avoid wet canopy foliage in late evening",
            "Prune and safely discard heavily infested leaves"
        ]
        spoken_script = f"Take caution farmer friend! Pest or fungus symptoms were detected on your {crop_name}. Please apply recommended neem oil or organic biopesticide, and avoid leaving leaves wet in the evening to protect your crop yield!"

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
        "actionable_advisory": advisory,
        "llm_stage_suggestion": suggestion,
        "suggested_actions": actions,
        "spoken_farmer_script": spoken_script
    }
