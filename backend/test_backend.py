"""
Test script to verify adaptive rescheduling pipeline.
"""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    print("Health check response:", response.status_code, response.json())
    assert response.status_code == 200

def test_rain_feedback():
    payload = {
        "crop_name": "rice",
        "days_since_sowing": 30,
        "feedback_text": "Tmr news said heavy rain 45mm expected in our region",
        "baseline": {
            "n": 80.0,
            "p": 50.0,
            "k": 40.0,
            "ph": 6.5,
            "temperature": 26.0,
            "humidity": 65.0,
            "rainfall": 120.0
        },
        "stages": [
            {"name": "Nursery / Germination", "days": 20, "kc": 0.9},
            {"name": "Tillering / Vegetative", "days": 40, "kc": 1.1},
            {"name": "Flowering / Reproductive", "days": 30, "kc": 1.2},
            {"name": "Ripening / Maturity", "days": 30, "kc": 0.9}
        ],
        "region_id": "R1",
        "prev_harvest_success": "success"
    }
    
    response = client.post("/api/adaptive-reschedule", json=payload)
    print("\nRain Feedback Test Status:", response.status_code)
    data = response.json()
    print("NLP Extraction:", data["nlp_extraction"])
    print("ML Shift Prediction:", data["ml_prediction"])
    print("Farmer Advisory:", data["actionable_advisory"])
    print("Rescheduled Stages:", data["timeline_reschedule"]["adapted_stages"])
    assert response.status_code == 200

if __name__ == "__main__":
    test_health()
    test_rain_feedback()
