# 🌾 Adaptive / Dynamic Timeline & Smart Irrigation System

An intelligent closed-loop agricultural advisory system that recalculates crop growth timelines and smart irrigation schedules based on real-time farmer observations (e.g. *"Tomorrow news said heavy rain 45mm"*, *"Heatwave expected for next 5 days"*).

---

## 🏗️ Architecture Overview

```
Farmer Feedback ("Heavy rain tomorrow 45mm")
     │
     ▼
[ 1. NLP Extraction (Gemini API / Heuristic Parser) ]
     │ ➔ Extracts: affected_feature='rainfall', delta=+45mm, temperature=-2.5°C
     ▼
[ 2. ML Prediction (Scikit-Learn Random Forest) ]
     │ ➔ Model: timeline_shift_regressor.pkl (trained on timeline_feedback_dataset)
     │ ➔ Predicts: timeline_shift_days (+/- days) & crop contingency recommendation
     ▼
[ 3. Dynamic Stage & Irrigation Engine ]
     │ ➔ Recalibrates active & future stage durations
     │ ➔ Updates ETc water requirements and pauses/reschedules watering intervals
     ▼
[ 4. Interactive React Frontend (Vite) + Farm Memory ]
     │ ➔ Dual-timeline before/after visual diff
     │ ➔ LocalStorage persistent feedback history
```

---

## 🚀 How to Run

### 1. Start the FastAPI Backend (Port 8000)
```bash
cd backend
python main.py
```
* Backend runs on: `http://127.0.0.1:8000`
* Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 2. Start the React Frontend (Port 5173)
```bash
cd Dsproject/Dsproject/irrigation-app
npm run dev
```
* Open your browser at: `http://localhost:5173`

---

## 🧪 Testing the Adaptive Timeline Feature

1. Open the web app and click on the **`⚡ Adaptive Timeline Copilot`** tab.
2. Choose one of the quick scenario chips (or type your own report):
   - 🌧️ **Heavy Rain (45mm)**: Pauses irrigation and extends stage by predicted shift.
   - ☀️ **Heatwave (+5°C)**: Increases water demand ($ET_c$) and accelerates stage maturity.
   - 🧪 **Urea Applied (25kg)**: Adds light irrigation dissolving advisory.
   - ❄️ **Cold Snap / Frost**: Delays upcoming vegetative/flowering dates.
3. Observe:
   - **Net Shift Badge**: e.g., `+3.5 Days` or `-2.0 Days`.
   - **Agronomic Advisory**: Specific action steps for the farmer.
   - **Visual Stage Comparison**: The active stage tag and duration updates.
   - **Feedback Memory Log**: Automatically saved to browser LocalStorage.

---

## 📊 Models & Datasets
- **Dataset**: `dataset/timeline_feedback_dataset_cleaned.csv`
- **Training Script**: `_time-line-part/train_timeline_models.py`
- **Trained Artifacts**: `backend/models/timeline_shift_regressor.pkl`, `backend/models/updated_crop_classifier.pkl`
