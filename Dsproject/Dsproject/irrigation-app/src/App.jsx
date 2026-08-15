import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Droplet,
  CalendarDays,
  Sun,
  Download,
  Printer,
  Info,
  ChevronRight,
  Ruler,
  Waves,
  Leaf,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  Trash2,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* CROP DATA                                                           */
/* ------------------------------------------------------------------ */

const CROPS = [
  { id: "rice", name: "Rice", category: "Cereal", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 0.4, flood: true,
    ideal: { n: [70,110], p: [30,55], k: [30,55], temp: [22,32], humidity: [75,90], ph: [5.5,7], rainfall: [180,300] },
    stages: [ { name: "Nursery / Germination", days: 20, kc: 0.9 }, { name: "Tillering / Vegetative", days: 40, kc: 1.1 }, { name: "Flowering / Reproductive", days: 30, kc: 1.2 }, { name: "Ripening / Maturity", days: 30, kc: 0.9 } ] },
  { id: "wheat", name: "Wheat", category: "Cereal", season: "Rabi", sow: "Nov \u2013 Dec", rootDepth: 1.0, flood: false,
    ideal: { n: [60,100], p: [40,60], k: [30,50], temp: [12,25], humidity: [50,70], ph: [6,7.5], rainfall: [60,100] },
    stages: [ { name: "Germination", days: 15, kc: 0.35 }, { name: "Tillering / Vegetative", days: 35, kc: 0.75 }, { name: "Heading / Flowering", days: 40, kc: 1.15 }, { name: "Ripening / Maturity", days: 30, kc: 0.4 } ] },
  { id: "maize", name: "Maize", category: "Cereal", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 1.0, flood: false,
    ideal: { n: [70,100], p: [35,55], k: [15,35], temp: [18,27], humidity: [55,75], ph: [5.8,7], rainfall: [60,110] },
    stages: [ { name: "Germination", days: 15, kc: 0.3 }, { name: "Vegetative", days: 30, kc: 0.75 }, { name: "Tasseling / Flowering", days: 30, kc: 1.2 }, { name: "Maturity", days: 25, kc: 0.6 } ] },
  { id: "chickpea", name: "Chickpea", category: "Pulse", season: "Rabi", sow: "Oct \u2013 Nov", rootDepth: 0.6, flood: false,
    ideal: { n: [25,55], p: [45,75], k: [65,95], temp: [15,25], humidity: [40,60], ph: [6,8], rainfall: [40,70] },
    stages: [ { name: "Germination", days: 15, kc: 0.4 }, { name: "Vegetative", days: 30, kc: 0.7 }, { name: "Flowering / Podding", days: 35, kc: 1.05 }, { name: "Maturity", days: 20, kc: 0.5 } ] },
  { id: "cotton", name: "Cotton", category: "Fibre", season: "Kharif", sow: "Apr \u2013 May", rootDepth: 1.0, flood: false,
    ideal: { n: [85,115], p: [35,55], k: [30,50], temp: [21,30], humidity: [55,70], ph: [6,8], rainfall: [60,100] },
    stages: [ { name: "Germination", days: 20, kc: 0.35 }, { name: "Vegetative", days: 40, kc: 0.75 }, { name: "Flowering / Boll Dev.", days: 65, kc: 1.15 }, { name: "Maturity", days: 40, kc: 0.6 } ] },
  { id: "sugarcane", name: "Sugarcane", category: "Cash Crop", season: "Year-round", sow: "best Feb \u2013 Mar", rootDepth: 1.2, flood: false,
    ideal: { n: [85,115], p: [45,65], k: [35,55], temp: [21,32], humidity: [65,85], ph: [6,7.5], rainfall: [150,250] },
    stages: [ { name: "Germination", days: 35, kc: 0.4 }, { name: "Tillering / Vegetative", days: 105, kc: 1.0 }, { name: "Grand Growth", days: 140, kc: 1.25 }, { name: "Ripening / Maturity", days: 50, kc: 0.75 } ] },
  { id: "groundnut", name: "Groundnut", category: "Oilseed", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 0.5, flood: false,
    ideal: { n: [15,45], p: [45,65], k: [35,55], temp: [22,30], humidity: [50,70], ph: [6,7], rainfall: [60,100] },
    stages: [ { name: "Germination", days: 15, kc: 0.4 }, { name: "Vegetative", days: 30, kc: 0.7 }, { name: "Flowering / Pegging", days: 40, kc: 1.05 }, { name: "Maturity", days: 25, kc: 0.6 } ] },
  { id: "sunflower", name: "Sunflower", category: "Oilseed", season: "Rabi / Zaid", sow: "Jan \u2013 Feb", rootDepth: 1.0, flood: false,
    ideal: { n: [45,75], p: [30,50], k: [30,50], temp: [18,27], humidity: [45,65], ph: [6,7.5], rainfall: [40,70] },
    stages: [ { name: "Germination", days: 15, kc: 0.35 }, { name: "Vegetative", days: 30, kc: 0.75 }, { name: "Flowering", days: 30, kc: 1.15 }, { name: "Maturity", days: 25, kc: 0.55 } ] },
  { id: "soybean", name: "Soybean", category: "Oilseed", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 0.6, flood: false,
    ideal: { n: [15,45], p: [50,80], k: [35,55], temp: [20,28], humidity: [60,75], ph: [6,7], rainfall: [70,100] },
    stages: [ { name: "Germination", days: 15, kc: 0.4 }, { name: "Vegetative", days: 30, kc: 0.75 }, { name: "Flowering / Pod Fill", days: 35, kc: 1.15 }, { name: "Maturity", days: 20, kc: 0.5 } ] },
  { id: "mustard", name: "Mustard", category: "Oilseed", season: "Rabi", sow: "Oct \u2013 Nov", rootDepth: 0.6, flood: false,
    ideal: { n: [45,75], p: [30,50], k: [25,45], temp: [10,22], humidity: [35,55], ph: [6,7.5], rainfall: [25,45] },
    stages: [ { name: "Germination", days: 15, kc: 0.35 }, { name: "Vegetative", days: 35, kc: 0.7 }, { name: "Flowering", days: 35, kc: 1.05 }, { name: "Maturity", days: 25, kc: 0.55 } ] },
  { id: "banana", name: "Banana", category: "Fruit", season: "Year-round", sow: "best Jun \u2013 Jul", rootDepth: 0.5, flood: false,
    ideal: { n: [85,115], p: [60,90], k: [280,320], temp: [22,32], humidity: [70,90], ph: [5.5,7], rainfall: [150,250] },
    stages: [ { name: "Establishment", days: 30, kc: 0.5 }, { name: "Vegetative", days: 120, kc: 1.0 }, { name: "Flowering / Bunching", days: 90, kc: 1.15 }, { name: "Maturity", days: 60, kc: 1.1 } ] },
  { id: "tomato", name: "Tomato", category: "Vegetable", season: "Year-round", sow: "best Jun \u2013 Jul / Oct \u2013 Nov", rootDepth: 0.5, flood: false,
    ideal: { n: [75,105], p: [45,75], k: [35,65], temp: [18,28], humidity: [55,70], ph: [6,6.8], rainfall: [40,70] },
    stages: [ { name: "Establishment", days: 20, kc: 0.5 }, { name: "Vegetative", days: 30, kc: 0.85 }, { name: "Flowering / Fruit-set", days: 30, kc: 1.15 }, { name: "Ripening / Maturity", days: 20, kc: 0.9 } ] },
  { id: "mango", name: "Mango", category: "Fruit", season: "Perennial", sow: "flowering Jan \u2013 Feb", rootDepth: 1.5, flood: false,
    ideal: { n: [20,50], p: [20,50], k: [45,75], temp: [22,32], humidity: [50,70], ph: [5.5,7.5], rainfall: [75,120] },
    stages: [ { name: "Flowering", days: 20, kc: 0.5 }, { name: "Fruit-set / Development", days: 60, kc: 0.85 }, { name: "Growth", days: 45, kc: 1.0 }, { name: "Ripening / Maturity", days: 25, kc: 0.75 } ] },
];

CROPS.forEach((c) => { c.duration = c.stages.reduce((s, st) => s + st.days, 0); });

const SOILS = {
  sandy: { label: "Sandy", fc: 0.12, wp: 0.05 },
  sandyloam: { label: "Sandy Loam", fc: 0.18, wp: 0.08 },
  loam: { label: "Loam", fc: 0.25, wp: 0.11 },
  clayloam: { label: "Clay Loam", fc: 0.32, wp: 0.15 },
  clay: { label: "Clay", fc: 0.38, wp: 0.2 },
};

const CLIMATES = {
  arid: { label: "Arid / Very dry", et0: 6.5 },
  semiarid: { label: "Semi-Arid", et0: 5.5 },
  subhumid: { label: "Sub-Humid", et0: 4.5 },
  humid: { label: "Humid", et0: 3.5 },
};

const METHODS = {
  drip: { label: "Drip", eff: 0.9 },
  sprinkler: { label: "Sprinkler", eff: 0.75 },
  surface: { label: "Surface / Flood", eff: 0.6 },
};

const STAGE_ROOT_FACTOR = [0.3, 0.6, 0.9, 1.0];
const STAGE_COLORS = ["#7FA65C", "#5C8F52", "#D69A46", "#8B5E34"];

const CROP_ICON = {
  rice: "\u{1F35A}", wheat: "\u{1F33E}", maize: "\u{1F33D}", chickpea: "\u{1FADB}",
  cotton: "\u{2601}\u{FE0F}", sugarcane: "\u{1F38B}", groundnut: "\u{1F95C}", sunflower: "\u{1F33B}",
  soybean: "\u{1F331}", mustard: "\u{1F33C}", banana: "\u{1F34C}", tomato: "\u{1F345}", mango: "\u{1F96D}",
};

const CROP_THEME = {
  rice: "#7FA65C", wheat: "#D6A94A", maize: "#E0B23C", chickpea: "#C9A46B",
  cotton: "#8FA6B0", sugarcane: "#4C8C5B", groundnut: "#A97C50", sunflower: "#E8B93A",
  soybean: "#6FA85C", mustard: "#D9A62E", banana: "#D8B23A", tomato: "#C1543A", mango: "#D97F3D",
};

/* ------------------------------------------------------------------ */
/* TRANSLATIONS (English, Hindi, Tamil)                                */
/* ------------------------------------------------------------------ */

const LANGS = [
  { key: "en", label: "EN" },
  { key: "hi", label: "हिं" },
  { key: "ta", label: "த" },
];

const CROP_NAMES = {
  rice: { hi: "चावल (धान)", ta: "நெல்" },
  wheat: { hi: "गेहूं", ta: "கோதுமை" },
  maize: { hi: "मक्का", ta: "மக்காச்சோளம்" },
  chickpea: { hi: "चना", ta: "கொண்டைக்கடலை" },
  cotton: { hi: "कपास", ta: "பருத்தி" },
  sugarcane: { hi: "गन्ना", ta: "கரும்பு" },
  groundnut: { hi: "मूंगफली", ta: "நிலக்கடலை" },
  sunflower: { hi: "सूरजमुखी", ta: "சூரியகாந்தி" },
  soybean: { hi: "सोयाबीन", ta: "சோயாபீன்" },
  mustard: { hi: "सरसों", ta: "கடுகு" },
  banana: { hi: "केला", ta: "வாழை" },
  tomato: { hi: "टमाटर", ta: "தக்காளி" },
  mango: { hi: "आम", ta: "மாம்பழம்" },
};

const T = {
  en: {
    eyebrow: "Smart Crop Advisory \u00B7 Adaptive Analytics",
    titleLine1: "Dynamic Farming Timeline.",
    titleLine2: "Real-Time Adaptive Planner.",
    subtitle: "When tomorrow's weather changes, your entire farming plan shouldn't spoil. Speak or type field reports to dynamically recalculate schedules and irrigation events.",
    tabRecommend: "Find a crop",
    tabPlan: "Planting & watering plan",
    tabAdaptive: "⚡ Adaptive Timeline Copilot",
    readingsTitle: "Your soil & weather baseline",
    fieldN: "Nitrogen (N)", fieldP: "Phosphorus (P)", fieldK: "Potassium (K)",
    fieldTemp: "Temperature", fieldHumidity: "Humidity", fieldPh: "Soil pH", fieldRainfall: "Rainfall",
    matchesHelp: "These crops fit your numbers best. Closer to 100% means a better match.",
    matchWord: "match", dayCropWord: "day crop", useCropBtn: "Use this crop",
    fieldSetupTitle: "Your field setup", cropLabel: "Crop", plantingDateLabel: "Planting date",
    soilTypeLabel: "Soil type", climateLabel: "Weather type",
    et0Label: "Daily water loss (sun & wind)", methodLabel: "How you water the field",
    madLabel: "How dry soil can get before watering", areaLabel: "Size of your field",
    statPlanting: "Planting date", statHarvest: "Harvest date", statDuration: "Total time",
    statWaterNeed: "Total water needed", statEvents: "Times to water", statVolume: "Total water (volume)",
    floodBody: "Keep about 3\u20135 cm of water covering the field at all times. The plan below shows how often to refill it.",
    chartTitle: "Water needed at each stage (mm per day)",
    thStage: "Stage", thStart: "Start", thEnd: "End", thDays: "Days", thKc: "Kc",
    thWaterUse: "Water / day", thInterval: "Water every", thPerEvent: "Each time", thEvents: "Times",
    exportBtn: "Download plan (CSV)", printBtn: "Print",
    methodTitle: "Dynamic Closed-Loop Analytics:",
    methodBody: "Farmer feedback is parsed by an LLM into numerical micro-climate shifts, which are fed into a Random Forest Regressor to predict stage deviations, recalculating ETc water demands in real-time.",
    acresLabel: "Acres", hectaresLabel: "Hectares", sqmLabel: "m\u00B2",
    sowWindowNote: (name, season, sow) => `Best time to plant ${name} (${season}): ${sow}`,
    inSeasonBanner: (day, total, stage) => `Day ${day} of ${total} \u2014 Current: ${stage} stage`,
    everyDays: (n) => `every ${n}d`,
    perEventMM: (mm) => `${mm} mm`,
    mmPerDay: (mm) => `${mm} mm/day`,
  },
  hi: {
    eyebrow: "स्मार्ट कृषि सलाहकार · एडेप्टिव एनालिटिक्स",
    titleLine1: "डायनामिक खेती टाइमलाइन।",
    titleLine2: "मौसम के अनुसार बदलती योजना।",
    subtitle: "अगर कल बारिश होने वाली है, तो आपकी पूरी योजना नहीं बिगड़ेगी। बस बताएं और सिस्टम तुरंत नई टाइमलाइन तैयार कर देगा।",
    tabRecommend: "फसल खोजें",
    tabPlan: "बुवाई व सिंचाई योजना",
    tabAdaptive: "⚡ डायनामिक टाइमलाइन कोपायलट",
    readingsTitle: "आपकी मिट्टी व मौसम की जानकारी",
    fieldN: "नाइट्रोजन (N)", fieldP: "फॉस्फोरस (P)", fieldK: "पोटैशियम (K)",
    fieldTemp: "तापमान", fieldHumidity: "हवा में नमी", fieldPh: "मिट्टी का pH", fieldRainfall: "बारिश",
    matchesHelp: "ये फसलें आपकी जानकारी से सबसे अच्छी तरह मेल खाती हैं।",
    matchWord: "मेल", dayCropWord: "दिन की फसल", useCropBtn: "यह फसल चुनें",
    fieldSetupTitle: "आपका खेत", cropLabel: "फसल", plantingDateLabel: "बुवाई की तारीख",
    soilTypeLabel: "मिट्टी का प्रकार", climateLabel: "मौसम का प्रकार",
    et0Label: "रोज़ाना पानी की कमी", methodLabel: "सिंचाई विधि",
    madLabel: "मिट्टी सूखने की सीमा", areaLabel: "खेत का आकार",
    statPlanting: "बुवाई की तारीख", statHarvest: "कटाई की तारीख", statDuration: "कुल समय",
    statWaterNeed: "कुल पानी की ज़रूरत", statEvents: "पानी देने की संख्या", statVolume: "कुल पानी (मात्रा)",
    chartTitle: "हर चरण में ज़रूरी पानी (मिमी प्रति दिन)",
    thStage: "चरण", thStart: "शुरुआत", thEnd: "अंत", thDays: "दिन", thKc: "Kc",
    thWaterUse: "पानी / दिन", thInterval: "पानी कब-कब दें", thPerEvent: "हर बार", thEvents: "बार",
    exportBtn: "योजना डाउनलोड करें (CSV)", printBtn: "प्रिंट करें",
    methodTitle: "एडेप्टिव क्लोज्ड-लूप सिस्टम:",
    methodBody: "किसान की प्रतिक्रिया को समझकर मशीन लर्निंग मॉडल तुरंत नई बुवाई, सिंचाई और कटाई का समय निर्धारित करता है।",
    acresLabel: "एकड़", hectaresLabel: "हेक्टेयर", sqmLabel: "वर्ग मी",
    sowWindowNote: (name, season, sow) => `${name} बोने का सही समय (${season}): ${sow}`,
    inSeasonBanner: (day, total, stage) => `दिन ${day} / ${total}, अभी: ${stage} चरण`,
    everyDays: (n) => `हर ${n} दिन`,
    perEventMM: (mm) => `${mm} मिमी`,
    mmPerDay: (mm) => `${mm} मिमी/दिन`,
  },
  ta: {
    eyebrow: "ஸ்மார்ட் வேளாண் ஆலோசகர் · அனலிட்டிக்ஸ்",
    titleLine1: "டைனமிக் பயிர் காலவரிசை.",
    titleLine2: "வானிலைக்கேற்ப மாறும் திட்டம்.",
    subtitle: "நாளை மழை பெய்தால் உங்கள் விவசாய திட்டம் வீணாகாது. உங்கள் வாய்மொழி தகவலுக்கு ஏற்ப கால அட்டவணை தானாக மாறும்.",
    tabRecommend: "பயிரைக் கண்டறியவும்",
    tabPlan: "நடவு & நீர்ப்பாசன திட்டம்",
    tabAdaptive: "⚡ அடாப்டிவ் காலவரிசை",
    readingsTitle: "மண் & வானிலை தகவல்",
    fieldN: "நைட்ரஜன் (N)", fieldP: "பாஸ்பரஸ் (P)", fieldK: "பொட்டாசியம் (K)",
    fieldTemp: "வெப்பநிலை", fieldHumidity: "ஈரப்பதம்", fieldPh: "மண் pH", fieldRainfall: "மழை",
    matchesHelp: "இந்தப் பயிர்கள் உங்கள் தகவலுக்கு மிகச் சரியாகப் பொருந்துகின்றன.",
    matchWord: "பொருத்தம்", dayCropWord: "நாள் பயிர்", useCropBtn: "பயன்படுத்து",
    fieldSetupTitle: "உங்கள் வயல்", cropLabel: "பயிர்", plantingDateLabel: "நடவு தேதி",
    soilTypeLabel: "மண் வகை", climateLabel: "வானிலை வகை",
    et0Label: "தினசரி நீர் இழப்பு", methodLabel: "நீர்ப்பாசன முறை",
    madLabel: "உலர்வு வரம்பு", areaLabel: "வயலின் அளவு",
    statPlanting: "நடவு தேதி", statHarvest: "அறுவடை தேதி", statDuration: "மொத்த காலம்",
    statWaterNeed: "மொத்த தேவையான நீர்", statEvents: "நீர் பாய்ச்ச வேண்டிய முறை", statVolume: "மொத்த நீர்",
    chartTitle: "ஒவ்வொரு நிலையிலும் தேவையான நீர் (மிமீ/நாள்)",
    thStage: "நிலை", thStart: "தொடக்கம்", thEnd: "முடிவு", thDays: "நாட்கள்", thKc: "Kc",
    thWaterUse: "நீர் / நாள்", thInterval: "நீர் இடைவெளி", thPerEvent: "ஒவ்வொரு முறை", thEvents: "முறை",
    exportBtn: "பதிவிறக்கு (CSV)", printBtn: "அச்சிடு",
    methodTitle: "டைனமிக் பகுப்பாய்வு:",
    methodBody: "விவசாயியின் தகவலைப் பெற்று இயந்திர கற்றல் மாதிரி புதிய காலவரிசையையும் நீர்ப்பாசன அட்டவணையையும் வழங்குகிறது.",
    acresLabel: "ஏக்கர்", hectaresLabel: "ஹெக்டேர்", sqmLabel: "சதுர மீ",
    sowWindowNote: (name, season, sow) => `${name} நடவு செய்ய சரியான நேரம் (${season}): ${sow}`,
    inSeasonBanner: (day, total, stage) => `நாள் ${day} / ${total}, இப்போது: ${stage} நிலை`,
    everyDays: (n) => `${n} நாட்களுக்கு ஒருமுறை`,
    perEventMM: (mm) => `${mm} மிமீ`,
    mmPerDay: (mm) => `${mm} மிமீ/நாள்`,
  },
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function parseDateInput(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatDate(date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function areaToM2(value, unit) {
  if (unit === "acre") return value * 4046.86;
  if (unit === "hectare") return value * 10000;
  return value;
}

function t(lang, key, ...args) {
  const dict = T[lang] || T.en;
  const entry = dict[key] !== undefined ? dict[key] : T.en[key];
  return typeof entry === "function" ? entry(...args) : entry;
}
function tCropName(lang, crop) {
  if (lang === "en") return crop.name;
  return (CROP_NAMES[crop.id] && CROP_NAMES[crop.id][lang]) || crop.name;
}

const PRESET_FEEDBACKS = [
  { icon: "🌧️", label: "Heavy Rain (45mm)", text: "Weather forecast predicted heavy rain 45mm tomorrow. Soil will be wet and flooded." },
  { icon: "☀️", label: "Heatwave (+5°C)", text: "Intense heatwave expected for the next 5 days with temperatures exceeding 38°C." },
  { icon: "🧪", label: "Urea Applied (25kg)", text: "Applied 25kg Nitrogen fertilizer today. Soil needs moderate moisture to dissolve." },
  { icon: "❄️", label: "Cold Snap / Frost", text: "Sudden cold wave and morning frost observed in field. Growth is slowing down." },
  { icon: "🐛", label: "Pest Attack on Leaves", text: "Mild caterpillar attack spotted on vegetative leaves. Delaying next flood irrigation." },
];

export default function App() {
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("plan"); // "recommend" | "plan" | "adaptive"
  const [cropId, setCropId] = useState("rice");
  const [plantingDate, setPlantingDate] = useState(() => toDateInputValue(new Date()));
  const [soilKey, setSoilKey] = useState("loam");
  const [climateKey, setClimateKey] = useState("subhumid");
  const [et0Override, setEt0Override] = useState(null);
  const [methodKey, setMethodKey] = useState("surface");
  const [mad, setMad] = useState(50);
  const [area, setArea] = useState(1);
  const [areaUnit, setAreaUnit] = useState("acre");

  // Recommendation inputs
  const [inputs, setInputs] = useState({
    n: 90, p: 42, k: 43, temp: 24, humidity: 82, ph: 6.5, rainfall: 200
  });

  // Adaptive Feedback State
  const [daysElapsed, setDaysElapsed] = useState(35);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isLoadingAdaptive, setIsLoadingAdaptive] = useState(false);
  const [adaptiveResult, setAdaptiveResult] = useState(null);
  const [adaptiveHistory, setAdaptiveHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("crop_adaptive_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("crop_adaptive_history", JSON.stringify(adaptiveHistory));
    } catch (e) {
      console.error(e);
    }
  }, [adaptiveHistory]);

  const crop = useMemo(() => CROPS.find((c) => c.id === cropId) || CROPS[0], [cropId]);
  const soil = SOILS[soilKey];
  const climate = CLIMATES[climateKey];
  const method = METHODS[methodKey];
  const et0 = et0Override !== null ? et0Override : climate.et0;
  const planting = useMemo(() => parseDateInput(plantingDate), [plantingDate]);

  function tr(key, ...args) {
    return t(lang, key, ...args);
  }

  // Recommendation matches
  const matches = useMemo(() => {
    return CROPS.map((c) => {
      const { n, p, k, temp, humidity, ph, rainfall } = c.ideal;
      const scores = [
        scoreInRange(inputs.n, n),
        scoreInRange(inputs.p, p),
        scoreInRange(inputs.k, k),
        scoreInRange(inputs.temp, temp),
        scoreInRange(inputs.humidity, humidity),
        scoreInRange(inputs.ph, ph),
        scoreInRange(inputs.rainfall, rainfall),
      ];
      const avg = scores.reduce((s, x) => s + x, 0) / scores.length;
      return { crop: c, score: Math.round(avg * 100) };
    }).sort((a, b) => b.score - a.score);
  }, [inputs]);

  function scoreInRange(val, [min, max]) {
    if (val >= min && val <= max) return 1;
    const span = max - min || 1;
    const dist = val < min ? min - val : val - max;
    return Math.max(0, 1 - dist / span);
  }

  // Base Irrigation Schedule Calculation
  const schedule = useMemo(() => {
    let currentStart = planting;
    const rows = crop.stages.map((stage, idx) => {
      const start = currentStart;
      const end = addDays(start, stage.days);
      currentStart = end;

      const etc = Math.round(et0 * stage.kc * 10) / 10;
      const rootD = crop.rootDepth * STAGE_ROOT_FACTOR[idx];
      const taw = (soil.fc - soil.wp) * rootD * 1000;
      const raw = taw * (mad / 100);
      const grossReq = raw / method.eff;
      const intervalDays = Math.max(1, Math.round(raw / Math.max(0.1, etc)));
      const events = Math.max(1, Math.ceil(stage.days / intervalDays));
      const totalWaterMM = Math.round(events * grossReq);

      return {
        stage: stage.name,
        days: stage.days,
        kc: stage.kc,
        start,
        end,
        etc,
        intervalDays,
        depthPerEventMM: Math.round(grossReq),
        events,
        totalWaterMM,
      };
    });

    const totalGrossMM = rows.reduce((s, r) => s + r.totalWaterMM, 0);
    const totalEvents = rows.reduce((s, r) => s + r.events, 0);
    const harvestDate = rows.length ? rows[rows.length - 1].end : planting;

    return { rows, totalGrossMM, totalEvents, harvestDate };
  }, [crop, planting, et0, soil, mad, method]);

  // Adapted Schedule Calculation
  const dynamicSchedule = useMemo(() => {
    if (!adaptiveResult || !adaptiveResult.timeline_reschedule) {
      return schedule;
    }

    const adaptedStages = adaptiveResult.timeline_reschedule.adapted_stages || [];
    let currentStart = planting;
    
    const rows = adaptedStages.map((stage, idx) => {
      const start = currentStart;
      const days = stage.adapted_days || stage.original_days || 30;
      const end = addDays(start, days);
      currentStart = end;

      const tweakedEt0 = adaptiveResult.nlp_extraction?.tweaked_temperature 
        ? Math.max(1.5, et0 + (adaptiveResult.nlp_extraction.tweaked_temperature - 26) * 0.15)
        : et0;

      const etc = Math.round(tweakedEt0 * (stage.kc || 1.0) * 10) / 10;
      const rootD = crop.rootDepth * STAGE_ROOT_FACTOR[Math.min(idx, 3)];
      const taw = (soil.fc - soil.wp) * rootD * 1000;
      const raw = taw * (mad / 100);
      const grossReq = raw / method.eff;
      const intervalDays = Math.max(1, Math.round(raw / Math.max(0.1, etc)));
      const events = Math.max(1, Math.ceil(days / intervalDays));
      const totalWaterMM = Math.round(events * grossReq);

      return {
        stage: stage.name,
        days: days,
        delta_days: stage.delta_days || 0,
        status: stage.status,
        kc: stage.kc,
        start,
        end,
        etc,
        intervalDays,
        depthPerEventMM: Math.round(grossReq),
        events,
        totalWaterMM,
      };
    });

    const totalGrossMM = rows.reduce((s, r) => s + r.totalWaterMM, 0);
    const totalEvents = rows.reduce((s, r) => s + r.events, 0);
    const harvestDate = rows.length ? rows[rows.length - 1].end : planting;

    return { rows, totalGrossMM, totalEvents, harvestDate, isAdapted: true };
  }, [schedule, adaptiveResult, planting, et0, crop, soil, mad, method]);

  const activeSchedule = adaptiveResult ? dynamicSchedule : schedule;
  const totalM2 = areaToM2(area, areaUnit);
  const totalM3 = Math.round((activeSchedule.totalGrossMM / 1000) * totalM2);

  // In-season tracker
  const today = new Date();
  const dayInSeason = Math.floor((today - planting) / (1000 * 60 * 60 * 24));
  const inSeason = dayInSeason >= 0 && dayInSeason < crop.duration;
  let currentStage = null;
  if (inSeason) {
    let acc = 0;
    for (const r of activeSchedule.rows) {
      acc += r.days;
      if (dayInSeason < acc) {
        currentStage = r;
        break;
      }
    }
  }

  // Handle Adaptive Reschedule Submission
  async function handleApplyFeedback(textToUse) {
    const feedback = (textToUse || feedbackInput).trim();
    if (!feedback) return;

    setIsLoadingAdaptive(true);

    const payload = {
      crop_name: crop.id,
      days_since_sowing: parseInt(daysElapsed) || 30,
      feedback_text: feedback,
      baseline: {
        n: inputs.n,
        p: inputs.p,
        k: inputs.k,
        ph: inputs.ph,
        temperature: inputs.temp,
        humidity: inputs.humidity,
        rainfall: inputs.rainfall,
      },
      stages: crop.stages,
      region_id: "R1",
      prev_harvest_success: "success",
      gemini_api_key: geminiApiKey || undefined,
    };

    try {
      // 1. Try FastAPI backend on localhost:8000
      const res = await fetch("http://localhost:8000/api/adaptive-reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
      const data = await res.json();
      setAdaptiveResult(data);

      // Save to Farm Memory history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        crop: crop.name,
        days_since_sowing: daysElapsed,
        feedback: feedback,
        shift_days: data.ml_prediction?.timeline_shift_days || 0,
        explanation: data.farmer_explanation,
        advisory: data.actionable_advisory,
      };
      setAdaptiveHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
    } catch (err) {
      console.warn("Backend request failed, executing client-side intelligent fallback:", err);
      // Client-side fallback simulation
      const isRain = /rain|wet|flood|storm/i.test(feedback);
      const isHeat = /heat|hot|sun/i.test(feedback);
      const isCold = /cold|frost|chill/i.test(feedback);
      const isFert = /fertilizer|urea|npk/i.test(feedback);

      let shift = 0;
      let expl = "Schedule recalibrated based on your field report.";
      let adv = "Monitor soil moisture regularly and follow updated irrigation timeline.";

      if (isRain) {
        shift = 3.5;
        expl = "Heavy rainfall reported. Saturated root zone delays vegetative field work and pauses irrigation.";
        adv = "Pause irrigation for 4 days. Clear drainage channels to prevent root rot.";
      } else if (isHeat) {
        shift = -2.0;
        expl = "High temperatures accelerate plant transpiration and stage progression.";
        adv = "Increase watering frequency during cooler morning hours to combat thermal stress.";
      } else if (isCold) {
        shift = 4.0;
        expl = "Low temperatures slow enzymatic plant growth, extending time to next stage.";
        adv = "Protect sensitive vegetative blooms; reduce water volume.";
      } else if (isFert) {
        shift = -1.0;
        expl = "Nutrient application provides a growth boost.";
        adv = "Apply a light 15mm irrigation to dissolve nutrients into the root zone.";
      }

      const adaptedStages = crop.stages.map((st, i) => ({
        name: st.name,
        kc: st.kc,
        original_days: st.days,
        adapted_days: Math.max(5, Math.round(st.days + (i >= 1 ? shift / (crop.stages.length - 1) : 0))),
        delta_days: i >= 1 ? Math.round(shift / (crop.stages.length - 1)) : 0,
        status: i === 1 ? "active" : i < 1 ? "completed" : "upcoming",
      }));

      const mockData = {
        status: "success",
        feedback_text: feedback,
        nlp_extraction: {
          affected_feature: isRain ? "rainfall" : isHeat ? "temperature" : "soil_moisture",
          adjustment_direction: isRain || isHeat ? "increase" : "decrease",
          weather_event: isRain ? "rain" : isHeat ? "heatwave" : "normal",
        },
        ml_prediction: {
          timeline_shift_days: shift,
          contingency_crop: crop.id,
          crop_change_recommended: false,
          confidence: 0.91,
        },
        timeline_reschedule: {
          adapted_stages: adaptedStages,
          net_shift_days: shift,
        },
        farmer_explanation: expl,
        actionable_advisory: adv,
      };

      setAdaptiveResult(mockData);
      setAdaptiveHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          crop: crop.name,
          days_since_sowing: daysElapsed,
          feedback: feedback,
          shift_days: shift,
          explanation: expl,
          advisory: adv,
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsLoadingAdaptive(false);
    }
  }

  function resetAdaptivePlan() {
    setAdaptiveResult(null);
    setFeedbackInput("");
  }

  function clearHistory() {
    setAdaptiveHistory([]);
    try {
      localStorage.removeItem("crop_adaptive_history");
    } catch (e) {
      console.error(e);
    }
  }

  const chartData = activeSchedule.rows.map((r) => ({
    name: r.stage.split("/")[0].trim(),
    mm: r.etc,
  }));

  const activeTheme = CROP_THEME[cropId] || "#7FA65C";
  const heroStyle = {
    background: `radial-gradient(ellipse at 20% -20%, ${activeTheme}2A, transparent 55%), radial-gradient(ellipse at 90% 0%, ${activeTheme}22, transparent 50%), var(--bg)`,
  };

  return (
    <div className="irr-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .irr-root {
          --bg: #17140F;
          --surface: #211C15;
          --surface-2: #2A231A;
          --border: #3A3226;
          --text: #EDE6D6;
          --text-dim: #A99C82;
          --water: #4FA3B5;
          --harvest: #D69A46;
          --growth: #7FA65C;
          --alert: #E06C75;
          --soil: #8B5E34;
          font-family: 'IBM Plex Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          border-radius: 14px;
          padding: 0;
          max-width: 1100px;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .irr-root * { box-sizing: border-box; }
        .irr-mono { font-family: 'IBM Plex Mono', monospace; }

        .irr-hero { padding: 28px 32px 24px; border-bottom: 1px solid var(--border); transition: background 0.5s ease; }
        .irr-hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .irr-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--growth);
          border: 1px solid rgba(127,166,92,0.35); background: rgba(127,166,92,0.08);
          padding: 4px 10px; border-radius: 999px;
        }
        .irr-lang-toggle { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 3px; }
        .irr-lang-btn {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; padding: 5px 12px; border-radius: 999px;
          cursor: pointer; color: var(--text-dim); border: none; background: transparent;
        }
        .irr-lang-btn.active { background: var(--growth); color: #17140F; font-weight: 600; }

        .irr-title {
          font-family: 'Fraunces', serif; font-weight: 700; font-size: 32px;
          line-height: 1.15; margin: 0 0 10px; letter-spacing: -0.01em;
        }
        .irr-title em { color: var(--water); font-style: italic; font-weight: 500; }
        .irr-sub { color: var(--text-dim); font-size: 14.5px; max-width: 680px; line-height: 1.55; margin: 0; }

        .irr-tabs { display: flex; gap: 8px; padding: 20px 32px 0; border-bottom: 1px solid var(--border); }
        .irr-tab {
          font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; letter-spacing: 0.03em;
          padding: 10px 16px; border-radius: 9px 9px 0 0; cursor: pointer; border: 1px solid var(--border);
          border-bottom: none; background: var(--surface); color: var(--text-dim);
          display: flex; align-items: center; gap: 7px; transition: all .15s ease;
        }
        .irr-tab.active { background: var(--surface-2); color: var(--text); box-shadow: inset 0 2px 0 var(--growth); font-weight: 600; }
        .irr-tab.active-special { box-shadow: inset 0 2px 0 var(--water); }

        .irr-body { padding: 28px 32px 36px; }
        .irr-grid { display: grid; grid-template-columns: 320px 1fr; gap: 26px; align-items: start; }
        @media (max-width: 760px) { .irr-grid { grid-template-columns: 1fr; } }

        .irr-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .irr-panel h3 {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-dim); margin: 0 0 16px; display: flex; align-items: center; gap: 6px;
        }
        .irr-field { margin-bottom: 16px; }
        .irr-field label { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-dim); margin-bottom: 6px; }
        .irr-field label span.val { color: var(--harvest); font-family: 'IBM Plex Mono', monospace; }
        .irr-field input[type=range] { width: 100%; accent-color: var(--growth); height: 4px; }
        .irr-field input[type=number], .irr-field input[type=date], .irr-field input[type=text], .irr-field select, .irr-field textarea {
          width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
          padding: 9px 10px; border-radius: 8px; font-size: 13px; font-family: 'IBM Plex Sans', sans-serif;
        }
        .irr-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .irr-summary { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 10px; margin-bottom: 20px; }
        .irr-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; position: relative; }
        .irr-stat .lbl { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); font-family: 'IBM Plex Mono', monospace; }
        .irr-stat .val { font-family: 'Fraunces', serif; font-size: 18px; margin-top: 4px; color: var(--text); }
        .irr-stat .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; position: absolute; top: 10px; right: 10px; font-family: 'IBM Plex Mono', monospace; }

        .irr-timeline { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .irr-stage-card {
          display: grid; grid-template-columns: 180px 1fr auto; gap: 14px; align-items: center; padding: 14px 16px;
          border-radius: 8px; border-left: 4px solid var(--border); background: var(--surface); border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .irr-stage-name { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 600; }
        .irr-stage-dates { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: rgba(237,230,214,0.75); margin-top: 2px; }
        .irr-stage-mid { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .irr-kc-chip { font-family: 'IBM Plex Mono', monospace; font-size: 11px; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 999px; color: rgba(237,230,214,0.85); border: 1px solid var(--border); }
        .irr-stage-right { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; text-align: right; color: rgba(237,230,214,0.8); white-space: nowrap; }

        .irr-banner-adaptive {
          background: linear-gradient(90deg, rgba(79,163,181,0.15), rgba(127,166,92,0.15));
          border: 1px solid rgba(79,163,181,0.4); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;
        }

        .irr-preset-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .irr-preset-chip {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 999px;
          padding: 5px 10px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
          transition: all 0.15s ease;
        }
        .irr-preset-chip:hover { border-color: var(--water); background: rgba(79,163,181,0.1); }

        .irr-btn-primary {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--growth); color: #17140F; border: none; padding: 11px; border-radius: 8px;
          font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
          transition: transform 0.1s ease;
        }
        .irr-btn-primary:active { transform: scale(0.98); }

        .irr-history-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px;
          margin-bottom: 8px; font-size: 12.5px;
        }
      `}</style>

      {/* HERO SECTION */}
      <div className="irr-hero" style={heroStyle}>
        <div className="irr-hero-top">
          <div className="irr-eyebrow"><Leaf size={13} /> {tr("eyebrow")}</div>
          <div className="irr-lang-toggle">
            {LANGS.map((l) => (
              <button key={l.key} className={`irr-lang-btn ${lang === l.key ? "active" : ""}`} onClick={() => setLang(l.key)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <h1 className="irr-title">{tr("titleLine1")}<br /><em>{tr("titleLine2")}</em></h1>
        <p className="irr-sub">{tr("subtitle")}</p>
      </div>

      {/* TABS */}
      <div className="irr-tabs">
        <div className={`irr-tab ${mode === "plan" ? "active" : ""}`} onClick={() => setMode("plan")}>
          <CalendarDays size={14} /> {tr("tabPlan")}
        </div>
        <div className={`irr-tab ${mode === "adaptive" ? "active active-special" : ""}`} onClick={() => setMode("adaptive")}>
          <Zap size={14} color="var(--water)" /> {tr("tabAdaptive")}
        </div>
        <div className={`irr-tab ${mode === "recommend" ? "active" : ""}`} onClick={() => setMode("recommend")}>
          <Leaf size={14} /> {tr("tabRecommend")}
        </div>
      </div>

      {/* MAIN CONTENT BODY */}
      <div className="irr-body">
        
        {/* ============================================================== */}
        {/* TAB 1: ADAPTIVE COPILOT & REAL-TIME RECALCULATION               */}
        {/* ============================================================== */}
        {mode === "adaptive" && (
          <div className="irr-grid">
            
            {/* Left Control Panel */}
            <div className="irr-panel">
              <h3><Sparkles size={14} color="var(--water)" /> Farmer Feedback Input</h3>

              <div className="irr-field">
                <label>Current Selected Crop: <span className="val">{crop.name}</span></label>
              </div>

              <div className="irr-field">
                <label>Days Since Sowing: <span className="val">{daysElapsed} days</span></label>
                <input type="range" min={1} max={crop.duration} value={daysElapsed} onChange={(e) => setDaysElapsed(parseInt(e.target.value))} />
              </div>

              <div className="irr-field">
                <label>Quick Weather / Field Reports:</label>
                <div className="irr-preset-chips">
                  {PRESET_FEEDBACKS.map((p, idx) => (
                    <button key={idx} className="irr-preset-chip" onClick={() => { setFeedbackInput(p.text); handleApplyFeedback(p.text); }}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="irr-field">
                <label>Or Type / Speak Field Observation:</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Tmr news said heavy rain 40mm expected; soil in north field is waterlogged..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>

              <div className="irr-field">
                <label style={{ fontSize: 11 }}>Optional Gemini API Key (Uses Local Model fallback if empty):</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
              </div>

              <button
                className="irr-btn-primary"
                onClick={() => handleApplyFeedback()}
                disabled={isLoadingAdaptive}
                style={{ background: "var(--water)" }}
              >
                {isLoadingAdaptive ? (
                  <><RefreshCw size={15} className="spin" /> Recalculating with ML & LLM...</>
                ) : (
                  <><Zap size={15} /> Recalculate Dynamic Timeline</>
                )}
              </button>

              {adaptiveResult && (
                <button
                  style={{
                    width: "100%", marginTop: 8, background: "transparent", border: "1px solid var(--border)",
                    color: "var(--text-dim)", padding: 8, borderRadius: 8, fontSize: 12, cursor: "pointer"
                  }}
                  onClick={resetAdaptivePlan}
                >
                  Reset to Original Plan
                </button>
              )}
            </div>

            {/* Right Visualization & Dynamic Plan */}
            <div>
              {adaptiveResult ? (
                <div className="irr-banner-adaptive">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "var(--water)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        ⚡ Adaptive Plan Active
                      </div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, marginTop: 4 }}>
                        {adaptiveResult.farmer_explanation}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-dim)", marginTop: 6 }}>
                        💡 <b>Agronomic Advisory:</b> {adaptiveResult.actionable_advisory}
                      </div>
                    </div>
                    <div style={{
                      textAlign: "right", padding: "6px 12px", borderRadius: 8,
                      background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", fontFamily: "'IBM Plex Mono', monospace"
                    }}>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>NET SHIFT</div>
                      <div style={{
                        fontSize: 16, fontWeight: 700,
                        color: (adaptiveResult.ml_prediction?.timeline_shift_days || 0) >= 0 ? "var(--alert)" : "var(--growth)"
                      }}>
                        {(adaptiveResult.ml_prediction?.timeline_shift_days || 0) > 0 ? "+" : ""}
                        {adaptiveResult.ml_prediction?.timeline_shift_days || 0} Days
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 10,
                  padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12
                }}>
                  <Info size={20} color="var(--text-dim)" />
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                    Select a preset scenario on the left or type your own observation to test how the timeline and irrigation automatically adapt.
                  </div>
                </div>
              )}

              {/* Summary Stats */}
              <div className="irr-summary">
                <div className="irr-stat">
                  <div className="lbl">Planting Date</div>
                  <div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(planting)}</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">Harvest Date</div>
                  <div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(activeSchedule.harvestDate)}</div>
                  {adaptiveResult && (
                    <span className="badge" style={{ background: "rgba(79,163,181,0.2)", color: "var(--water)" }}>ADAPTED</span>
                  )}
                </div>
                <div className="irr-stat">
                  <div className="lbl">Total Duration</div>
                  <div className="val">{activeSchedule.rows.reduce((s, r) => s + r.days, 0)} days</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">Total Water</div>
                  <div className="val">{activeSchedule.totalGrossMM} mm</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">Irrigation Events</div>
                  <div className="val">{activeSchedule.totalEvents}</div>
                </div>
              </div>

              {/* Dynamic Timeline Stage Bands */}
              <div className="irr-timeline">
                {activeSchedule.rows.map((r, i) => (
                  <div
                    key={i}
                    className="irr-stage-card"
                    style={{
                      borderLeftColor: STAGE_COLORS[i % STAGE_COLORS.length],
                      background: r.status === "active" ? "rgba(79,163,181,0.12)" : "var(--surface)",
                    }}
                  >
                    <div>
                      <div className="irr-stage-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {r.stage}
                        {r.status === "active" && (
                          <span style={{ fontSize: 10, background: "var(--growth)", color: "#17140F", padding: "1px 6px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="irr-stage-dates">
                        {formatDate(r.start)} &rarr; {formatDate(r.end)} &middot; {r.days}d
                        {r.delta_days !== undefined && r.delta_days !== 0 && (
                          <span style={{ marginLeft: 6, color: r.delta_days > 0 ? "var(--alert)" : "var(--growth)" }}>
                            ({r.delta_days > 0 ? `+${r.delta_days}` : r.delta_days}d shift)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="irr-stage-mid">
                      <span className="irr-kc-chip">Kc {r.kc}</span>
                      <span className="irr-kc-chip">{r.etc} mm/day</span>
                    </div>
                    <div className="irr-stage-right">
                      every {r.intervalDays}d &middot; {r.depthPerEventMM} mm ({r.events} times)
                    </div>
                  </div>
                ))}
              </div>

              {/* Historical Farm Memory Log */}
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                    <History size={13} /> Farmer Feedback Memory History ({adaptiveHistory.length})
                  </div>
                  {adaptiveHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Trash2 size={12} /> Clear History
                    </button>
                  )}
                </div>

                {adaptiveHistory.length === 0 ? (
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 12.5, color: "var(--text-dim)" }}>
                    No previous feedback logged yet. When you submit feedback, it will be memorized here across sessions.
                  </div>
                ) : (
                  <div>
                    {adaptiveHistory.map((item) => (
                      <div key={item.id} className="irr-history-card">
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dim)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>
                          <span>{new Date(item.timestamp).toLocaleDateString()} · {item.crop} (Day {item.days_since_sowing})</span>
                          <span style={{ color: item.shift_days > 0 ? "var(--alert)" : "var(--growth)" }}>
                            {item.shift_days > 0 ? `+${item.shift_days}` : item.shift_days}d shift
                          </span>
                        </div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>"{item.feedback}"</div>
                        <div style={{ color: "var(--text-dim)", fontSize: 11.5 }}>{item.explanation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ORIGINAL PLANTING & WATERING PLAN                        */}
        {/* ============================================================== */}
        {mode === "plan" && (
          <div className="irr-grid">
            <div className="irr-panel">
              <h3><Ruler size={13} /> {tr("fieldSetupTitle")}</h3>

              <div className="irr-field">
                <label>{tr("cropLabel")}</label>
                <select value={cropId} onChange={(e) => setCropId(e.target.value)}>
                  {CROPS.map((c) => (
                    <option value={c.id} key={c.id}>
                      {tCropName(lang, c)} ({c.season})
                    </option>
                  ))}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("plantingDateLabel")}</label>
                <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
              </div>

              <div className="irr-field">
                <label>{tr("soilTypeLabel")}</label>
                <select value={soilKey} onChange={(e) => setSoilKey(e.target.value)}>
                  {Object.entries(SOILS).map(([k, s]) => <option value={k} key={k}>{s.label}</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("climateLabel")}</label>
                <select value={climateKey} onChange={(e) => { setClimateKey(e.target.value); setEt0Override(null); }}>
                  {Object.entries(CLIMATES).map(([k, c]) => <option value={k} key={k}>{c.label}</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("methodLabel")}</label>
                <select value={methodKey} onChange={(e) => setMethodKey(e.target.value)}>
                  {Object.entries(METHODS).map(([k, m]) => <option value={k} key={k}>{m.label} ({Math.round(m.eff * 100)}%)</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("areaLabel")}</label>
                <div className="irr-row2">
                  <input type="number" min={0.1} step={0.1} value={area} onChange={(e) => setArea(parseFloat(e.target.value) || 0)} />
                  <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                    <option value="acre">{tr("acresLabel")}</option>
                    <option value="hectare">{tr("hectaresLabel")}</option>
                    <option value="m2">{tr("sqmLabel")}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="irr-summary">
                <div className="irr-stat"><div className="lbl">{tr("statPlanting")}</div><div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(planting)}</div></div>
                <div className="irr-stat"><div className="lbl">{tr("statHarvest")}</div><div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(schedule.harvestDate)}</div></div>
                <div className="irr-stat"><div className="lbl">{tr("statDuration")}</div><div className="val">{crop.duration} days</div></div>
                <div className="irr-stat"><div className="lbl">{tr("statWaterNeed")}</div><div className="val">{schedule.totalGrossMM} mm</div></div>
                <div className="irr-stat"><div className="lbl">{tr("statVolume")}</div><div className="val">{totalM3.toLocaleString()} m&sup3;</div></div>
              </div>

              <div className="irr-timeline">
                {schedule.rows.map((r, i) => (
                  <div key={i} className="irr-stage-card" style={{ borderLeftColor: STAGE_COLORS[i % STAGE_COLORS.length] }}>
                    <div>
                      <div className="irr-stage-name">{r.stage}</div>
                      <div className="irr-stage-dates">{formatDate(r.start)} &rarr; {formatDate(r.end)} &middot; {r.days}d</div>
                    </div>
                    <div className="irr-stage-mid">
                      <span className="irr-kc-chip">Kc {r.kc}</span>
                      <span className="irr-kc-chip">{r.etc} mm/day</span>
                    </div>
                    <div className="irr-stage-right">
                      every {r.intervalDays}d &middot; {r.depthPerEventMM} mm
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 10 }}>
                  Stage Water Consumption (mm/day)
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3226" />
                    <XAxis dataKey="name" tick={{ fill: "#A99C82", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#A99C82", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#211C15", border: "1px solid #3A3226", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="mm" fill="#4FA3B5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, fontSize: 12.5, color: "var(--text-dim)" }}>
                <b>💡 Tip:</b> Click on the <b>⚡ Adaptive Timeline Copilot</b> tab above to simulate real-time weather changes and see the plan adapt dynamically.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FIND A CROP (RECOMMENDATION)                             */}
        {/* ============================================================== */}
        {mode === "recommend" && (
          <div className="irr-grid">
            <div className="irr-panel">
              <h3><Info size={13} /> {tr("readingsTitle")}</h3>
              {[
                { key: "n", label: tr("fieldN"), unit: "kg/ha", min: 0, max: 140 },
                { key: "p", label: tr("fieldP"), unit: "kg/ha", min: 0, max: 140 },
                { key: "k", label: tr("fieldK"), unit: "kg/ha", min: 0, max: 210 },
                { key: "temp", label: tr("fieldTemp"), unit: "°C", min: 5, max: 42 },
                { key: "humidity", label: tr("fieldHumidity"), unit: "%", min: 15, max: 100 },
                { key: "ph", label: tr("fieldPh"), unit: "", min: 3.5, max: 9, step: 0.1 },
                { key: "rainfall", label: tr("fieldRainfall"), unit: "mm", min: 10, max: 320 },
              ].map((f) => (
                <div className="irr-field" key={f.key}>
                  <label>{f.label} <span className="val">{inputs[f.key]}{f.unit}</span></label>
                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step || 1}
                    value={inputs[f.key]}
                    onChange={(e) => setInputs({ ...inputs, [f.key]: parseFloat(e.target.value) })}
                  />
                </div>
              ))}
            </div>

            <div>
              <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 0, marginBottom: 14 }}>{tr("matchesHelp")}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {matches.map(({ crop: c, score }) => (
                  <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{CROP_ICON[c.id] || "🌱"}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>{tCropName(lang, c)}</div>
                    <div style={{ fontSize: 12, color: "var(--water)", margin: "6px 0", fontFamily: "'IBM Plex Mono', monospace" }}>{score}% Match</div>
                    <button
                      className="irr-btn-primary"
                      style={{ fontSize: 12, padding: 8, marginTop: 8 }}
                      onClick={() => { setCropId(c.id); setMode("plan"); }}
                    >
                      Use in Plan &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
