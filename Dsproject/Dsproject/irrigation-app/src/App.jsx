import React, { useState, useMemo, useEffect } from "react";
import LandingPage from "./LandingPage.jsx";
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
  Mic,
  MicOff,
  BarChart2,
  X,
  Settings,
  MessageSquare,
  Activity,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  TrendingUp,
} from "lucide-react";
import CropPriceMap from "./CropPriceMap.jsx";

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
  { id: "apple", name: "Apple", category: "Fruit", season: "Year-round", sow: "Jan \u2013 Feb", rootDepth: 1.2, flood: false,
    ideal: { n: [10,40], p: [10,35], k: [45,75], temp: [15,24], humidity: [55,75], ph: [5.5,7], rainfall: [100,180] },
    stages: [ { name: "Budbreak / Flowering", days: 30, kc: 0.5 }, { name: "Fruit Set & Growth", days: 90, kc: 0.95 }, { name: "Ripening & Harvest", days: 60, kc: 0.8 } ] },
  { id: "blackgram", name: "Blackgram", category: "Pulse", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 0.5, flood: false,
    ideal: { n: [35,65], p: [55,85], k: [15,45], temp: [24,35], humidity: [60,80], ph: [6.5,7.8], rainfall: [60,90] },
    stages: [ { name: "Germination", days: 10, kc: 0.4 }, { name: "Vegetative", days: 25, kc: 0.7 }, { name: "Flowering / Podding", days: 25, kc: 1.0 }, { name: "Maturity", days: 15, kc: 0.45 } ] },
  { id: "coconut", name: "Coconut", category: "Fruit", season: "Perennial", sow: "Jun \u2013 Sep", rootDepth: 1.5, flood: false,
    ideal: { n: [15,40], p: [5,25], k: [25,55], temp: [25,32], humidity: [70,90], ph: [5.2,8], rainfall: [150,300] },
    stages: [ { name: "Vegetative / Leafing", days: 90, kc: 0.7 }, { name: "Flowering", days: 120, kc: 1.0 }, { name: "Nut Growth & Ripening", days: 150, kc: 1.05 } ] },
  { id: "coffee", name: "Coffee", category: "Cash Crop", season: "Perennial", sow: "Jun \u2013 Aug", rootDepth: 1.2, flood: false,
    ideal: { n: [80,120], p: [15,40], k: [20,50], temp: [20,28], humidity: [65,85], ph: [6,6.5], rainfall: [130,220] },
    stages: [ { name: "Flowering", days: 45, kc: 0.6 }, { name: "Berry Expansion", days: 120, kc: 0.95 }, { name: "Ripening & Harvest", days: 90, kc: 0.8 } ] },
  { id: "grapes", name: "Grapes", category: "Fruit", season: "Year-round", sow: "Oct \u2013 Nov", rootDepth: 1.0, flood: false,
    ideal: { n: [10,40], p: [120,150], k: [190,210], temp: [12,30], humidity: [65,85], ph: [5.5,7], rainfall: [60,110] },
    stages: [ { name: "Budburst & Shooting", days: 30, kc: 0.35 }, { name: "Flowering & Berry Set", days: 45, kc: 0.75 }, { name: "Veraison & Ripening", days: 75, kc: 0.85 } ] },
  { id: "jute", name: "Jute", category: "Fibre", season: "Kharif", sow: "Mar \u2013 May", rootDepth: 0.8, flood: false,
    ideal: { n: [60,90], p: [35,55], k: [35,55], temp: [24,37], humidity: [70,90], ph: [6,7.5], rainfall: [120,200] },
    stages: [ { name: "Germination", days: 15, kc: 0.4 }, { name: "Active Fibre Growth", days: 75, kc: 1.0 }, { name: "Harvesting Phase", days: 30, kc: 0.7 } ] },
  { id: "kidneybeans", name: "Kidneybeans", category: "Pulse", season: "Kharif / Rabi", sow: "Jun \u2013 Jul / Oct", rootDepth: 0.6, flood: false,
    ideal: { n: [15,40], p: [55,85], k: [15,40], temp: [15,26], humidity: [60,80], ph: [5.5,6.5], rainfall: [90,150] },
    stages: [ { name: "Germination", days: 12, kc: 0.35 }, { name: "Vegetative Growth", days: 30, kc: 0.7 }, { name: "Flowering & Podding", days: 30, kc: 1.05 }, { name: "Maturity", days: 18, kc: 0.4 } ] },
  { id: "lentil", name: "Lentil", category: "Pulse", season: "Rabi", sow: "Oct \u2013 Nov", rootDepth: 0.5, flood: false,
    ideal: { n: [10,35], p: [55,85], k: [15,40], temp: [15,25], humidity: [60,75], ph: [6,7.5], rainfall: [35,65] },
    stages: [ { name: "Germination", days: 15, kc: 0.35 }, { name: "Vegetative", days: 35, kc: 0.7 }, { name: "Flowering / Pod Fill", days: 40, kc: 1.0 }, { name: "Maturity", days: 20, kc: 0.4 } ] },
  { id: "mothbeans", name: "Mothbeans", category: "Pulse", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 0.5, flood: false,
    ideal: { n: [10,35], p: [35,65], k: [15,40], temp: [24,35], humidity: [45,65], ph: [6.5,8], rainfall: [30,70] },
    stages: [ { name: "Germination", days: 10, kc: 0.35 }, { name: "Vegetative", days: 25, kc: 0.65 }, { name: "Flowering", days: 30, kc: 0.95 }, { name: "Maturity", days: 15, kc: 0.4 } ] },
  { id: "mungbean", name: "Mungbean", category: "Pulse", season: "Kharif / Zaid", sow: "Jun \u2013 Jul / Mar", rootDepth: 0.5, flood: false,
    ideal: { n: [10,35], p: [35,65], k: [15,40], temp: [25,35], humidity: [60,80], ph: [6.2,7.2], rainfall: [50,90] },
    stages: [ { name: "Germination", days: 10, kc: 0.4 }, { name: "Vegetative", days: 25, kc: 0.7 }, { name: "Flowering / Podding", days: 25, kc: 1.0 }, { name: "Maturity", days: 15, kc: 0.45 } ] },
  { id: "muskmelon", name: "Muskmelon", category: "Fruit", season: "Zaid", sow: "Feb \u2013 Mar", rootDepth: 0.8, flood: false,
    ideal: { n: [80,120], p: [5,30], k: [45,75], temp: [22,34], humidity: [80,95], ph: [6,6.8], rainfall: [20,60] },
    stages: [ { name: "Germination & Vining", days: 20, kc: 0.45 }, { name: "Flowering & Fruit Set", days: 30, kc: 0.85 }, { name: "Fruit Enlargement", days: 30, kc: 1.05 }, { name: "Ripening", days: 15, kc: 0.75 } ] },
  { id: "orange", name: "Orange", category: "Fruit", season: "Perennial", sow: "Jun \u2013 Aug", rootDepth: 1.2, flood: false,
    ideal: { n: [10,40], p: [5,30], k: [5,30], temp: [10,32], humidity: [85,98], ph: [6,7.5], rainfall: [100,160] },
    stages: [ { name: "Flowering", days: 30, kc: 0.5 }, { name: "Fruit Setting & Growth", days: 120, kc: 0.85 }, { name: "Color Break & Ripening", days: 90, kc: 0.75 } ] },
  { id: "papaya", name: "Papaya", category: "Fruit", season: "Year-round", sow: "Jun \u2013 Sep", rootDepth: 0.8, flood: false,
    ideal: { n: [30,70], p: [45,75], k: [45,75], temp: [22,33], humidity: [85,98], ph: [6,7], rainfall: [140,250] },
    stages: [ { name: "Establishment", days: 45, kc: 0.5 }, { name: "Vegetative Growth", days: 75, kc: 0.85 }, { name: "Flowering & Bearing", days: 120, kc: 1.05 } ] },
  { id: "pigeonpeas", name: "Pigeonpeas", category: "Pulse", season: "Kharif", sow: "Jun \u2013 Jul", rootDepth: 1.0, flood: false,
    ideal: { n: [10,35], p: [55,85], k: [15,40], temp: [20,32], humidity: [55,75], ph: [6.5,7.5], rainfall: [70,120] },
    stages: [ { name: "Germination", days: 15, kc: 0.35 }, { name: "Vegetative Branching", days: 60, kc: 0.7 }, { name: "Flowering & Podding", days: 60, kc: 1.05 }, { name: "Maturity", days: 30, kc: 0.4 } ] },
  { id: "pomegranate", name: "Pomegranate", category: "Fruit", season: "Perennial", sow: "Jun \u2013 Aug", rootDepth: 1.0, flood: false,
    ideal: { n: [10,40], p: [5,30], k: [35,65], temp: [18,34], humidity: [85,98], ph: [5.5,7.2], rainfall: [50,110] },
    stages: [ { name: "Bahar / Flowering", days: 30, kc: 0.45 }, { name: "Fruit Development", days: 90, kc: 0.8 }, { name: "Maturity & Harvest", days: 60, kc: 0.75 } ] },
  { id: "watermelon", name: "Watermelon", category: "Fruit", season: "Zaid", sow: "Feb \u2013 Mar", rootDepth: 0.8, flood: false,
    ideal: { n: [80,120], p: [5,30], k: [45,75], temp: [22,35], humidity: [80,95], ph: [6,7], rainfall: [40,80] },
    stages: [ { name: "Vining & Flowering", days: 25, kc: 0.45 }, { name: "Fruit Setting & Growth", days: 35, kc: 0.85 }, { name: "Ripening & Harvest", days: 25, kc: 0.75 } ] },
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
  apple: "🍎", blackgram: "🫘", coconut: "🥥", coffee: "☕", grapes: "🍇", jute: "🌾",
  kidneybeans: "🫘", lentil: "🫘", mothbeans: "🌱", mungbean: "🫘", muskmelon: "🍈",
  orange: "🍊", papaya: "🥭", pigeonpeas: "🌱", pomegranate: "🍎", watermelon: "🍉",
};

const CROP_THEME = {
  rice: "#7FA65C", wheat: "#D6A94A", maize: "#E0B23C", chickpea: "#C9A46B",
  cotton: "#8FA6B0", sugarcane: "#4C8C5B", groundnut: "#A97C50", sunflower: "#E8B93A",
  soybean: "#6FA85C", mustard: "#D9A62E", banana: "#D8B23A", tomato: "#C1543A", mango: "#D97F3D",
  apple: "#C14B3A", blackgram: "#5C504A", coconut: "#8B6F47", coffee: "#6F4E37", grapes: "#6F4A8C",
  jute: "#A89648", kidneybeans: "#8C3A3A", lentil: "#A86D48", mothbeans: "#7F8C4A", mungbean: "#4A8C5C",
  muskmelon: "#E8A63A", orange: "#E87C3A", papaya: "#E8963A", pigeonpeas: "#8C7F4A", pomegranate: "#C13A4A", watermelon: "#4AC16F",
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
  apple: { hi: "सेब", ta: "ஆப்பிள்" },
  blackgram: { hi: "उड़द", ta: "உளுந்து" },
  coconut: { hi: "नारियल", ta: "தேங்காய்" },
  coffee: { hi: "कॉफी", ta: "காபி" },
  grapes: { hi: "अंगूर", ta: "திராட்சை" },
  jute: { hi: "पटसन", ta: "சணல்" },
  kidneybeans: { hi: "राजमा", ta: "ராஜ்பீன்ஸ்" },
  lentil: { hi: "मसूर", ta: "மைசூர் பருப்பு" },
  mothbeans: { hi: "मोठ", ta: "நரிப்பயறு" },
  mungbean: { hi: "मूंग", ta: "பாசிப்பயறு" },
  muskmelon: { hi: "खरबूजा", ta: "முலாம் பழம்" },
  orange: { hi: "संतरा", ta: "ஆரஞ்சு" },
  papaya: { hi: "पपीता", ta: "பப்பாளி" },
  pigeonpeas: { hi: "अरहर (तूर)", ta: "துவரை" },
  pomegranate: { hi: "अनार", ta: "மாதுளை" },
  watermelon: { hi: "तरबूज", ta: "தர்பூசணி" },
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
    methodBody: "Farmer feedback is parsed by our model into numerical micro-climate shifts, which are fed into a Random Forest Regressor to predict stage deviations, recalculating ETc water demands in real-time.",
    pastHarvest: "Past harvest result", success: "Success", partial: "Partial", failure: "Failure",
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
    pastHarvest: "पिछली फसल का परिणाम", success: "सफल", partial: "आंशिक", failure: "विफल",
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
    pastHarvest: "முந்தைய அறுவடை", success: "வெற்றி", partial: "பகுதி", failure: "தோல்வி",
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
  if (!crop) return "Crop";
  if (lang === "en") return crop.name || crop.id || "Crop";
  return (crop.id && CROP_NAMES[crop.id] && CROP_NAMES[crop.id][lang]) || crop.name || crop.id || "Crop";
}

const PRESET_FEEDBACKS = [
  { icon: "🌧️", label: "Heavy Rain (45mm)", text: "Weather forecast predicted heavy rain 45mm tomorrow. Soil will be wet and flooded." },
  { icon: "☀️", label: "Heatwave (+5°C)", text: "Intense heatwave expected for the next 5 days with temperatures exceeding 38°C." },
  { icon: "🧪", label: "Urea Applied (25kg)", text: "Applied 25kg Nitrogen fertilizer today. Soil needs moderate moisture to dissolve." },
  { icon: "❄️", label: "Cold Snap / Frost", text: "Sudden cold wave and morning frost observed in field. Growth is slowing down." },
  { icon: "🐛", label: "Pest Attack on Leaves", text: "Mild caterpillar attack spotted on vegetative leaves. Delaying next flood irrigation." },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function handleNavigate(tab) {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLanding(false);
      setMode(tab);
      setIsTransitioning(false);
    }, 380);
  }

  function handleBackToLanding() {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLanding(true);
      setIsTransitioning(false);
    }, 380);
  }

  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("timeline"); // "recommend" | "timeline"
  const [showFieldSetup, setShowFieldSetup] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [cropId, setCropId] = useState("rice");
  const [plantingDate, setPlantingDate] = useState(() => toDateInputValue(new Date()));
  const [soilKey, setSoilKey] = useState("loam");
  const [climateKey, setClimateKey] = useState("subhumid");
  const [et0Override, setEt0Override] = useState(null);
  const [methodKey, setMethodKey] = useState("surface");
  const [mad, setMad] = useState(50);
  const [area, setArea] = useState(1);
  const [areaUnit, setAreaUnit] = useState("acre");

  const [fieldSetupChanged, setFieldSetupChanged] = useState(false);
  const [fieldSetupVersion, setFieldSetupVersion] = useState(0);

  useEffect(() => {
    setFieldSetupVersion((v) => v + 1);
  }, [cropId, plantingDate, soilKey, climateKey, methodKey, mad, area, areaUnit]);

  useEffect(() => {
    if (fieldSetupVersion > 1) { // >1 because first render will increment it to 1
      setFieldSetupChanged(true);
      const t = setTimeout(() => setFieldSetupChanged(false), 1500);
      return () => clearTimeout(t);
    }
  }, [fieldSetupVersion]);

  // Recommendation inputs
  const [inputs, setInputs] = useState({
    n: 90, p: 42, k: 43, temp: 24, humidity: 82, ph: 6.5, rainfall: 200
  });
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [topReasonTab, setTopReasonTab] = useState(null); // "reason" | "shap" | null
  const [expandedCropId, setExpandedCropId] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Adaptive Feedback State
  const [daysElapsed, setDaysElapsed] = useState(35);
  const [prevHarvest, setPrevHarvest] = useState("success");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isLoadingAdaptive, setIsLoadingAdaptive] = useState(false);
  const [llmFeedbackPreview, setLlmFeedbackPreview] = useState(null);
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

  function toggleSpeech() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      window.speechRecog?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFeedbackInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    window.speechRecog = recognition;
    recognition.start();
  }

  const [isSpeaking, setIsSpeaking] = useState(false);

  function speakAdvisory(advisoryObj) {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare farmer-friendly spoken text
    let script = advisoryObj?.spoken_farmer_script;
    if (!script) {
      const activeStageName = currentStage ? currentStage.stage : "active";
      const cropName = tCropName(lang, crop);
      if (lang === "hi") {
        script = `नमस्ते किसान भाई! आपकी ${cropName} की फसल जो अभी ${activeStageName} चरण में है, उसके लिए सलाह है: ${advisoryObj?.llm_stage_suggestion || advisoryObj?.farmer_explanation || advisoryObj?.actionable_advisory}. अपनी फसल का ध्यान रखें!`;
      } else if (lang === "ta") {
        script = `வணக்கம் விவசாய தோழரே! உங்கள் ${cropName} பயிரின் ${activeStageName} நிலைக்கு ஆலோசனை: ${advisoryObj?.llm_stage_suggestion || advisoryObj?.farmer_explanation || advisoryObj?.actionable_advisory}.`;
      } else {
        script = `Hello farmer friend! For your ${cropName} crop currently in the ${activeStageName} stage, here is today's advice: ${advisoryObj?.llm_stage_suggestion || advisoryObj?.farmer_explanation || advisoryObj?.actionable_advisory}. Have a productive day!`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : "en-IN";
    utterance.rate = 0.92; // Slightly unhurried for maximum clarity and loud pronunciation
    utterance.pitch = 1.05; // Warm, friendly tone
    utterance.volume = 1.0; // Clear & loud

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const voice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2))) || voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US"));
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

  async function getCropRecommendation() {
    setIsRecommending(true);
    setRecommendation(null);
    try {
      const res = await fetch("http://localhost:8000/api/recommend-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: {
            n: inputs.n, p: inputs.p, k: inputs.k,
            temperature: inputs.temp, humidity: inputs.humidity,
            ph: inputs.ph, rainfall: inputs.rainfall
          }
        })
      });
      if (!res.ok) throw new Error("Recommendation failed");
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
      alert("Failed to get recommendation from Model. Is the backend running?");
    } finally {
      setIsRecommending(false);
    }
  }

  // Synchronize daysElapsed with actual days since planting
  useEffect(() => {
    const daysSincePlanting = Math.max(1, Math.min(crop.duration, Math.floor((new Date() - parseDateInput(plantingDate)) / (1000 * 60 * 60 * 24))));
    setDaysElapsed(daysSincePlanting);
  }, [plantingDate, crop]);

  // Synchronize matches array with Model recommendation when available, fallback to local scoring
  const matches = useMemo(() => {
    if (recommendation && recommendation.top_candidates && recommendation.top_candidates.length > 0) {
      return recommendation.top_candidates.map((cand) => {
        const cropIdStr = (cand.crop || "").toLowerCase();
        const foundCrop = CROPS.find(c => c.id.toLowerCase() === cropIdStr) || {
          id: cropIdStr || "crop",
          name: cand.crop ? cand.crop.charAt(0).toUpperCase() + cand.crop.slice(1) : "Crop",
          season: "Kharif / Rabi",
          duration: 100,
          stages: [
            { name: "Germination", days: 15, kc: 0.4 },
            { name: "Vegetative", days: 35, kc: 0.75 },
            { name: "Flowering", days: 30, kc: 1.05 },
            { name: "Maturity", days: 20, kc: 0.5 }
          ]
        };
        const score = Math.round((cand.prob || 0) * 100);
        const recCropStr = (recommendation.recommended_crop || "").toLowerCase();
        return {
          crop: foundCrop,
          score: score > 0 ? score : 15,
          isAiPick: cropIdStr && recCropStr ? cropIdStr === recCropStr : false
        };
      });
    }

    return CROPS.map((c) => {
      if (!c.ideal) return { crop: c, score: 50, isAiPick: false };
      const { n = [50, 100], p = [30, 60], k = [30, 60], temp = [20, 30], humidity = [50, 80], ph = [6, 7.5], rainfall = [50, 150] } = c.ideal;
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
      return { crop: c, score: Math.round(avg * 100), isAiPick: false };
    }).sort((a, b) => b.score - a.score);
  }, [inputs, recommendation]);

  function scoreInRange(val, range) {
    if (!range || !Array.isArray(range) || range.length < 2) return 0.5;
    const [min, max] = range;
    if (val === undefined || val === null || isNaN(val)) return 0.5;
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
    
    const weatherEvent = adaptiveResult.nlp_extraction?.weather_event;
    const tweakedTemp = adaptiveResult.nlp_extraction?.tweaked_temperature;

    const rows = adaptedStages.map((stage, idx) => {
      const start = currentStart;
      const days = stage.adapted_days || stage.original_days || 30;
      const end = addDays(start, days);
      currentStart = end;

      const tweakedEt0 = tweakedTemp !== undefined
        ? Math.max(1.5, et0 + (tweakedTemp - 26) * 0.15)
        : et0;

      const etc = Math.round(tweakedEt0 * (stage.kc || 1.0) * 10) / 10;
      const rootD = crop.rootDepth * STAGE_ROOT_FACTOR[Math.min(idx, 3)];
      const taw = (soil.fc - soil.wp) * rootD * 1000;
      const raw = taw * (mad / 100);
      const grossReq = raw / method.eff;

      let intervalDays = Math.max(1, Math.round(raw / Math.max(0.1, etc)));
      if (weatherEvent === "rain" && stage.status === "active") {
        intervalDays = Math.round(intervalDays * 1.5);
      } else if (weatherEvent === "heatwave" && stage.status === "active") {
        intervalDays = Math.max(1, Math.round(intervalDays * 0.7));
      }

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
  const totalActiveDuration = activeSchedule.rows.reduce((s, r) => s + r.days, 0);
  const dayInSeason = Math.floor((today - planting) / (1000 * 60 * 60 * 24));
  const inSeason = dayInSeason >= 0 && dayInSeason < totalActiveDuration;
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
      prev_harvest_success: prevHarvest,
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
      setLlmFeedbackPreview(data);
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
      let sugg = `For your ${crop.name} in the ${currentStage ? currentStage.stage : 'current'} stage, follow the updated timeline and check soil moisture.`;
      let actions = [
        `Monitor ${currentStage ? currentStage.stage : 'current'} stage moisture levels`,
        "Inspect root zone before next watering",
        "Follow updated irrigation schedule"
      ];

      if (isRain) {
        shift = 2;
        expl = "Heavy rainfall reported. Saturated root zone delays vegetative field work and pauses irrigation.";
        adv = "Pause irrigation for 4 days. Clear drainage channels to prevent root rot.";
        sugg = `Since your ${crop.name} is in the ${currentStage ? currentStage.stage : 'current'} stage (Day ${daysElapsed}), hold off all irrigation for 4-5 days and clear drainage ditches.`;
        actions = [
          `Pause active irrigation for ${currentStage ? currentStage.stage : 'current'} stage`,
          "Clear field drainage bunds to avoid root rot",
          "Postpone fertilizer application until soil dries"
        ];
      } else if (isHeat) {
        shift = -2;
        expl = "High temperatures accelerate plant transpiration and stage progression.";
        adv = "Increase watering frequency during cooler morning hours to combat thermal stress.";
        sugg = `High heat accelerates maturity in the ${currentStage ? currentStage.stage : 'current'} stage. Switch watering to 5-8 AM to avoid thermal shock.`;
        actions = [
          "Switch irrigation to early morning (5-8 AM)",
          "Apply soil surface mulch to preserve moisture",
          "Shorten watering intervals to prevent moisture stress"
        ];
      } else if (isCold) {
        shift = 3;
        expl = "Low temperatures slow enzymatic plant growth, extending time to next stage.";
        adv = "Protect sensitive vegetative blooms; reduce water volume.";
        sugg = `Cold weather slows metabolic activity during ${currentStage ? currentStage.stage : 'current'} stage. Reduce watering depth by 20% to keep soil warmer.`;
        actions = [
          "Reduce watering depth by 20%",
          "Avoid night-time irrigation",
          "Apply light potassium spray to boost frost tolerance"
        ];
      } else if (isFert) {
        shift = -1;
        expl = "Nutrient application provides a growth boost.";
        adv = "Apply a light 15mm irrigation to dissolve nutrients into the root zone.";
        sugg = `With nutrients applied in ${currentStage ? currentStage.stage : 'current'} stage, give a light 15mm watering to dissolve fertilizer into root feeding zone.`;
        actions = [
          "Provide light 15mm watering within 24 hours",
          "Prevent runoff from field bunds",
          "Check leaf greening progress over 4-6 days"
        ];
      }

      const activeIdx = currentStage ? crop.stages.findIndex(s => s.name === currentStage.stage) : 1;
      const adaptedStages = crop.stages.map((st, i) => ({
        name: st.name,
        kc: st.kc,
        original_days: st.days,
        adapted_days: Math.max(5, st.days + (i === activeIdx ? shift : 0)),
        delta_days: i === activeIdx ? shift : 0,
        status: i === activeIdx ? "active" : i < activeIdx ? "completed" : "upcoming",
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
          original_total_days: crop.duration,
          adapted_total_days: crop.duration + shift,
          adapted_stages: adaptedStages,
          net_shift_days: shift,
          current_stage_index: activeIdx,
        },
        farmer_explanation: expl,
        actionable_advisory: adv,
        llm_stage_suggestion: sugg,
        suggested_actions: actions,
      };

      setLlmFeedbackPreview(mockData);
    } finally {
      setIsLoadingAdaptive(false);
    }
  }

  function commitLlmShift(previewToUse) {
    const data = previewToUse || llmFeedbackPreview;
    if (!data) return;

    setAdaptiveResult(data);

    // Save to Farm Memory history
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      crop: crop.name,
      days_since_sowing: daysElapsed,
      feedback: data.feedback_text,
      shift_days: data.timeline_reschedule?.net_shift_days || data.ml_prediction?.timeline_shift_days || 0,
      explanation: data.farmer_explanation,
      advisory: data.actionable_advisory,
      suggestion: data.llm_stage_suggestion,
    };
    setAdaptiveHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
    setLlmFeedbackPreview(null);
    setShowFeedback(false);
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

  if (showLanding) {
    return (
      <div style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.38s ease" }}>
        <LandingPage onNavigate={handleNavigate} lang={lang} setLang={setLang} />
      </div>
    );
  }

  return (
    <div style={{ opacity: isTransitioning ? 0 : 1, transition: "opacity 0.38s ease" }}>
    <div className="irr-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .irr-root {
          --bg: #0B1612;
          --surface: #0F1C14;
          --surface-2: #122018;
          --border: #1F3027;
          --text: #E8F2EA;
          --text-dim: #5C8A6E;
          --water: #4BBFD6;
          --harvest: #E8C04A;
          --growth: #3ECF8E;
          --alert: #E06C75;
          --soil: #8C6B4A;
          font-family: 'Plus Jakarta Sans', sans-serif;
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
        .irr-mono { font-family: 'JetBrains Mono', monospace; }

        .irr-hero { padding: 28px 32px 24px; border-bottom: 1px solid var(--border); transition: background 0.5s ease; }
        .irr-hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .irr-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--growth);
          border: 1px solid rgba(127,166,92,0.35); background: rgba(127,166,92,0.08);
          padding: 4px 10px; border-radius: 999px;
        }
        .irr-lang-toggle { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 3px; }
        .irr-lang-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 5px 12px; border-radius: 999px;
          cursor: pointer; color: var(--text-dim); border: none; background: transparent;
        }
        .irr-lang-btn.active { background: var(--growth); color: #17140F; font-weight: 600; }

        .irr-title {
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 32px;
          line-height: 1.15; margin: 0 0 10px; letter-spacing: -0.01em;
          text-align: center;
        }
        .irr-title em { color: var(--water); font-style: italic; font-weight: 500; }
        .irr-sub { color: var(--text-dim); font-size: 14.5px; max-width: 680px; line-height: 1.55; margin: 0 auto; text-align: center; }

        .irr-tabs { display: flex; gap: 8px; padding: 20px 32px 0; border-bottom: 1px solid var(--border); }
        .irr-tab {
          font-family: 'JetBrains Mono', monospace; font-size: 12.5px; letter-spacing: 0.03em;
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
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-dim); margin: 0 0 16px; display: flex; align-items: center; gap: 6px;
        }
        .irr-field { margin-bottom: 16px; }
        .irr-field label { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-dim); margin-bottom: 6px; }
        .irr-field label span.val { color: var(--harvest); font-family: 'JetBrains Mono', monospace; }
        .irr-field input[type=range] { width: 100%; accent-color: var(--growth); height: 4px; }
        .irr-field input[type=number], .irr-field input[type=date], .irr-field input[type=text], .irr-field select, .irr-field textarea {
          width: 100%; background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
          padding: 9px 10px; border-radius: 8px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .irr-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .irr-summary { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 10px; margin-bottom: 20px; }
        .irr-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; position: relative; }
        .irr-stat .lbl { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
        .irr-stat .val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; margin-top: 4px; color: var(--text); }
        .irr-stat .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; position: absolute; top: 10px; right: 10px; font-family: 'JetBrains Mono', monospace; }

        .irr-timeline { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .irr-stage-card {
          display: grid; grid-template-columns: 180px 1fr auto; gap: 14px; align-items: center; padding: 14px 16px;
          border-radius: 8px; border-left: 4px solid var(--border); background: var(--surface); border-top: 1px solid var(--border); border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .irr-stage-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600; }
        .irr-stage-dates { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: rgba(237,230,214,0.75); margin-top: 2px; }
        .irr-stage-mid { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .irr-kc-chip { font-family: 'JetBrains Mono', monospace; font-size: 11px; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 999px; color: rgba(237,230,214,0.85); border: 1px solid var(--border); }
        .irr-stage-right { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; text-align: right; color: rgba(237,230,214,0.8); white-space: nowrap; }

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
          font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: transform 0.1s ease;
        }
        .irr-btn-primary:active { transform: scale(0.98); }

        .irr-history-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px;
          margin-bottom: 8px; font-size: 12.5px;
        }
        @keyframes irr-flash-highlight {
          0% { background: var(--surface); }
          30% { background: rgba(214,154,70,0.2); box-shadow: 0 0 12px rgba(214,154,70,0.15); }
          100% { background: var(--surface); }
        }
        .irr-stage-card.flash-update {
          animation: irr-flash-highlight 1.5s ease-out;
        }

        .irr-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          animation: irr-fade-in 0.2s ease;
        }
        @keyframes irr-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .irr-modal-content {
          background: var(--bg); border: 1px solid var(--border); border-radius: 14px;
          padding: 24px 28px; width: 400px; max-width: 90vw; max-height: 85vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: irr-slide-up 0.25s ease;
        }
        @keyframes irr-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .irr-modal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;
        }
        .irr-modal-header h3 {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-dim); margin: 0; display: flex; align-items: center; gap: 6px;
        }
        .irr-modal-close {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
          width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex;
          align-items: center; justify-content: center; font-size: 16px; transition: all 0.15s;
        }
        .irr-modal-close:hover { background: var(--border); color: var(--text); }

        .irr-action-btn {
          display: flex; align-items: center; gap: 8px; padding: 12px 16px;
          background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
          cursor: pointer; color: var(--text); font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; transition: all 0.15s ease; width: 100%;
        }
        .irr-action-btn:hover { border-color: var(--growth); background: rgba(127,166,92,0.08); }

        .irr-mic-btn {
          background: var(--surface-2); border: 1px solid var(--border); color: var(--text-dim);
          padding: 8px 12px; border-radius: 8px; cursor: pointer; display: flex;
          align-items: center; gap: 6px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
          transition: all 0.15s;
        }
        .irr-mic-btn:hover { border-color: var(--water); color: var(--water); }
        .irr-mic-btn.active { background: var(--alert); border-color: var(--alert); color: #fff; animation: irr-mic-pulse 1s ease infinite; }
        @keyframes irr-mic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,108,117,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(224,108,117,0); }
        }

        .irr-voice-btn {
          background: rgba(79,163,181,0.12); border: 1px solid var(--water); color: var(--water);
          padding: 6px 12px; border-radius: 8px; cursor: pointer; display: inline-flex;
          align-items: center; gap: 8px; font-size: 12px; font-family: 'JetBrains Mono', monospace;
          font-weight: 600; transition: all 0.15s ease;
        }
        .irr-voice-btn:hover { background: rgba(79,163,181,0.22); }
        .irr-voice-btn.speaking {
          background: rgba(224,108,117,0.2); border-color: var(--alert); color: var(--alert);
        }
        .irr-soundwave {
          display: inline-flex; align-items: center; gap: 2px; height: 12px;
        }
        .irr-soundwave span {
          display: inline-block; width: 2.5px; height: 100%; background: currentColor; border-radius: 2px;
          animation: irr-wave 0.7s ease-in-out infinite alternate;
        }
        .irr-soundwave span:nth-child(2) { animation-delay: 0.15s; height: 50%; }
        .irr-soundwave span:nth-child(3) { animation-delay: 0.35s; height: 80%; }
        .irr-soundwave span:nth-child(4) { animation-delay: 0.25s; height: 35%; }
        .irr-soundwave span:nth-child(5) { animation-delay: 0.45s; height: 95%; }
        @keyframes irr-wave {
          0% { transform: scaleY(0.2); }
          100% { transform: scaleY(1); }
        }
      `}</style>

      {/* HERO SECTION */}
      <div className="irr-hero" style={heroStyle}>
        <div className="irr-hero-top">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={handleBackToLanding}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-dim)", padding: "4px 10px", borderRadius: 999,
                fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6
              }}
            >
              ← Home
            </button>
            <div className="irr-eyebrow"><Leaf size={13} /> {tr("eyebrow")}</div>
          </div>
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
      <div className="irr-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div id="tab-timeline" className={`irr-tab ${mode === "timeline" ? "active" : ""}`} onClick={() => setMode("timeline")}>
            <CalendarDays size={14} /> Timeline
          </div>
          <div id="tab-recommend" className={`irr-tab ${mode === "recommend" ? "active" : ""}`} onClick={() => setMode("recommend")}>
            <Leaf size={14} /> {tr("tabRecommend")}
          </div>
          <div id="tab-market" className={`irr-tab ${mode === "market" ? "active" : ""}`} onClick={() => setMode("market")}>
            <TrendingUp size={14} /> Market Prices & Map
          </div>
        </div>

        {/* Action buttons (only in timeline mode) */}
        {mode === "timeline" && (
          <div style={{ display: "flex", gap: 8, paddingBottom: 6 }}>
            <button
              onClick={() => setShowFieldSetup(true)}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "6px 12px", borderRadius: 8,
                background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s"
              }}
            >
              <Settings size={13} color="var(--growth)" /> Edit Field Setup
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "6px 12px", borderRadius: 8,
                background: "var(--surface-2)", border: "1px solid var(--water)", color: "var(--water)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s"
              }}
            >
              <MessageSquare size={13} color="var(--water)" /> Feedback
            </button>
          </div>
        )}
      </div>

      {/* Model Loading Overlay Modal */}
      {(isLoadingAdaptive || isRecommending) && (
        <div className="irr-modal-overlay">
          <div className="irr-modal-content" style={{ textAlign: "center", padding: "36px 28px", maxWidth: 420 }}>
            <div style={{ display: "inline-flex", padding: 16, background: "rgba(79,163,181,0.1)", borderRadius: 999, marginBottom: 16, border: "1px solid rgba(79,163,181,0.3)" }}>
              <RefreshCw size={32} className="spin" color="var(--water)" />
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {isRecommending ? "Analyzing Soil & Weather with Model..." : "Recalculating Timeline with Model..."}
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
              {isRecommending 
                ? "Running Random Forest classifier and generating SHAP feature impact explanations..."
                : "Extracting micro-climate observations and predicting stage shifts with trained Regressor..."
              }
            </div>
            <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, var(--water), var(--growth))", borderRadius: 2, animation: "irr-flash-highlight 1s infinite alternate" }} />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT BODY */}
      <div className="irr-body">
        
        {/* ============================================================== */}
        {/* UNIFIED TIMELINE (merged plan + adaptive)                       */}
        {/* ============================================================== */}
        {mode === "timeline" && (
          <div className="irr-grid">

            {/* ── Left Panel: Stats + Action Buttons ── */}
            <div>
              {/* Active Crop Badge */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>{CROP_ICON[crop.id] || "🌱"}</span>
                <div>
                  <div style={{ fontSize: 10, color: "var(--growth)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Active Crop in Plan</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{tCropName(lang, crop)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{crop.season} · {crop.duration} days</div>
                </div>
              </div>

              {/* Summary stats stacked vertically */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div className="irr-stat">
                  <div className="lbl">{tr("statPlanting")}</div>
                  <div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(planting)}</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">{tr("statHarvest")}</div>
                  <div className="val irr-mono" style={{ fontSize: 15 }}>{formatDate(activeSchedule.harvestDate)}</div>
                  {adaptiveResult && (
                    <span className="badge" style={{ background: "rgba(79,163,181,0.2)", color: "var(--water)" }}>ADAPTED</span>
                  )}
                </div>
                <div className="irr-stat">
                  <div className="lbl">{tr("statDuration")}</div>
                  <div className="val">{activeSchedule.rows.reduce((s, r) => s + r.days, 0)} days</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">{tr("statWaterNeed")}</div>
                  <div className="val">{activeSchedule.totalGrossMM} mm</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">{tr("statEvents")}</div>
                  <div className="val">{activeSchedule.totalEvents}</div>
                </div>
                <div className="irr-stat">
                  <div className="lbl">{tr("statVolume")}</div>
                  <div className="val">{totalM3.toLocaleString()} m&sup3;</div>
                </div>
              </div>

              {/* Current stage indicator */}
              {inSeason && currentStage && (
                <div style={{ marginTop: 16, background: "rgba(127,166,92,0.1)", border: "1px solid rgba(127,166,92,0.3)", borderRadius: 10, padding: "12px 14px", fontSize: 12.5 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--growth)", marginBottom: 4 }}>📍 Current Stage</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600 }}>{currentStage.stage}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                    Day {dayInSeason + 1} of {crop.duration}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Panel: Timeline + Chart ── */}
            <div>
              {/* 1. Pending Model Suggestion Card (Displayed on MAIN PAGE with Apply Button & Voice Assistant) */}
              {llmFeedbackPreview && (
                <div style={{
                  background: "var(--surface)", border: "1.5px solid var(--water)", borderRadius: 12,
                  padding: 18, marginBottom: 22, animation: "irr-slide-up 0.25s ease",
                  boxShadow: "0 8px 24px rgba(79,163,181,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--water)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles size={15} /> Model Stage Suggestion
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Voice AI Read Out Loud Button */}
                      <button
                        className={`irr-voice-btn ${isSpeaking ? 'speaking' : ''}`}
                        onClick={() => speakAdvisory(llmFeedbackPreview)}
                        title="Farmer Voice Assistant will read out the suggestion"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX size={14} /> Stop Voice AI
                            <div className="irr-soundwave">
                              <span /><span /><span /><span /><span />
                            </div>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} /> 🔊 Listen (Voice AI)
                          </>
                        )}
                      </button>
                      <span style={{ fontSize: 11, background: "rgba(79,163,181,0.2)", color: "var(--water)", padding: "4px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {currentStage ? currentStage.stage : 'Active'} Stage (Day {daysElapsed})
                      </span>
                    </div>
                  </div>

                  {/* Stage-aware advice */}
                  <div style={{ background: "rgba(79, 163, 181, 0.12)", borderLeft: "3px solid var(--water)", padding: "12px 16px", borderRadius: "0 8px 8px 0", color: "var(--text)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 14 }}>
                    💡 <b>Model Recommendation:</b> {llmFeedbackPreview.llm_stage_suggestion || llmFeedbackPreview.farmer_explanation}
                  </div>

                  {/* Checklist of recommended actions */}
                  {llmFeedbackPreview.suggested_actions && llmFeedbackPreview.suggested_actions.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        Action Checklist:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {llmFeedbackPreview.suggested_actions.map((act, i) => (
                          <div key={i} style={{ fontSize: 12.5, display: "flex", alignItems: "flex-start", gap: 8, color: "var(--text)" }}>
                            <CheckCircle2 size={14} color="var(--growth)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline shift preview details */}
                  <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: "var(--text-dim)" }}>Proposed Timeline Duration:</span>
                      <span style={{ fontWeight: 700, color: (llmFeedbackPreview.timeline_reschedule?.net_shift_days || 0) !== 0 ? "var(--alert)" : "var(--growth)" }}>
                        {llmFeedbackPreview.timeline_reschedule?.original_total_days}d &rarr; {llmFeedbackPreview.timeline_reschedule?.adapted_total_days}d ({(llmFeedbackPreview.timeline_reschedule?.net_shift_days || 0) > 0 ? '+' : ''}{llmFeedbackPreview.timeline_reschedule?.net_shift_days || 0}d)
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {(llmFeedbackPreview.timeline_reschedule?.adapted_stages || []).map((st, idx) => (
                        <div key={idx} style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 4,
                          background: st.delta_days !== 0 ? (st.delta_days > 0 ? "rgba(224,108,117,0.2)" : "rgba(127,166,92,0.2)") : "rgba(0,0,0,0.3)",
                          color: st.delta_days !== 0 ? (st.delta_days > 0 ? "var(--alert)" : "var(--growth)") : "var(--text-dim)",
                          fontFamily: "'JetBrains Mono', monospace"
                        }}>
                          {st.name}: <b>{st.adapted_days}d</b> {st.delta_days !== 0 && `(${st.delta_days > 0 ? '+' : ''}${st.delta_days}d)`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Model Shift Button on MAIN PAGE */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="irr-btn-primary"
                      onClick={() => commitLlmShift()}
                      style={{ background: "var(--growth)", color: "#17140F", fontWeight: 700, flex: 1, padding: "10px 16px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 13 }}
                    >
                      <CheckCircle2 size={16} /> Apply Model Shift to Timeline
                    </button>
                    <button
                      onClick={() => setLlmFeedbackPreview(null)}
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-dim)", padding: "0 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      ✕ Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Active Model Banner (if shift has already been applied) */}
              {adaptiveResult && !llmFeedbackPreview && (
                <div className="irr-banner-adaptive" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--water)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                          <Sparkles size={13} /> Active Model Stage Copilot
                        </div>
                        <span style={{ fontSize: 10, background: "rgba(79,163,181,0.2)", color: "var(--water)", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                          {currentStage ? currentStage.stage : 'Vegetative'} Stage
                        </span>

                        {/* Voice AI button in active banner */}
                        <button
                          className={`irr-voice-btn ${isSpeaking ? 'speaking' : ''}`}
                          onClick={() => speakAdvisory(adaptiveResult)}
                          style={{ padding: "3px 8px", fontSize: 11 }}
                          title="Farmer Voice Assistant will read out the suggestion"
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX size={12} /> Stop Voice AI
                              <div className="irr-soundwave">
                                <span /><span /><span />
                              </div>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} /> 🔊 Listen (Voice AI)
                            </>
                          )}
                        </button>
                      </div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                        {adaptiveResult.farmer_explanation}
                      </div>
                      
                      {/* Model Stage Suggestion */}
                      {adaptiveResult.llm_stage_suggestion && (
                        <div style={{ fontSize: 13, color: "var(--text)", background: "rgba(0,0,0,0.25)", padding: "8px 12px", borderRadius: 8, marginTop: 8, borderLeft: "3px solid var(--water)" }}>
                          💡 <b>Model Stage Suggestion:</b> {adaptiveResult.llm_stage_suggestion}
                        </div>
                      )}

                      {/* Action Checklist */}
                      {adaptiveResult.suggested_actions && adaptiveResult.suggested_actions.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                          {adaptiveResult.suggested_actions.map((act, i) => (
                            <div key={i} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, color: "var(--text-dim)" }}>
                              <CheckCircle2 size={12} color="var(--growth)" /> <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        textAlign: "right", padding: "6px 12px", borderRadius: 8,
                        background: "rgba(0,0,0,0.3)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        <div style={{ fontSize: 10, color: "var(--text-dim)" }}>NET SHIFT</div>
                        <div style={{
                          fontSize: 16, fontWeight: 700,
                          color: (adaptiveResult.timeline_reschedule?.net_shift_days || adaptiveResult.ml_prediction?.timeline_shift_days || 0) !== 0 ? "var(--alert)" : "var(--growth)"
                        }}>
                          {(adaptiveResult.timeline_reschedule?.net_shift_days || adaptiveResult.ml_prediction?.timeline_shift_days || 0) > 0 ? "+" : ""}
                          {adaptiveResult.timeline_reschedule?.net_shift_days ?? (adaptiveResult.ml_prediction?.timeline_shift_days || 0)} Days
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFeedback(true)}
                        style={{ background: "var(--surface-2)", border: "1px solid var(--water)", color: "var(--water)", padding: "6px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={resetAdaptivePlan}
                        style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-dim)", padding: "6px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}
                        title="Reset to original plan"
                      >✕</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Stage Cards */}
              <div className="irr-timeline">
                {activeSchedule.rows.map((r, i) => {
                  const isCurrent = inSeason && currentStage && r.stage === currentStage.stage;
                  const isShifted = adaptiveResult && r.delta_days !== undefined && r.delta_days !== 0;
                  const isAdaptedActive = adaptiveResult && r.status === "active";
                  return (
                    <div
                      key={i}
                      className={`irr-stage-card ${fieldSetupChanged || adaptiveResult ? 'flash-update' : ''}`}
                      style={{
                        borderLeftColor: STAGE_COLORS[i % STAGE_COLORS.length],
                        ...(isShifted ? {
                          background: r.delta_days > 0 ? "rgba(224,108,117,0.15)" : "rgba(127,166,92,0.15)",
                          borderRight: "2px solid " + (r.delta_days > 0 ? "var(--alert)" : "var(--growth)"),
                          boxShadow: "0 0 16px " + (r.delta_days > 0 ? "rgba(224,108,117,0.3)" : "rgba(127,166,92,0.3)")
                        } : (isCurrent || isAdaptedActive) ? {
                          background: isAdaptedActive ? 'rgba(79,163,181,0.12)' : 'rgba(127,166,92,0.12)',
                          boxShadow: '-4px 0 12px ' + (isAdaptedActive ? 'rgba(79,163,181,0.2)' : 'rgba(127,166,92,0.2)')
                        } : {})
                      }}
                    >
                      <div>
                        <div className="irr-stage-name" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {r.stage}
                          {isShifted && (
                            <span style={{
                              fontSize: 10,
                              background: r.delta_days > 0 ? "var(--alert)" : "var(--growth)",
                              color: "#fff",
                              padding: "2px 7px",
                              borderRadius: 4,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              ⚡ {r.delta_days > 0 ? `+${r.delta_days}` : r.delta_days}d MODEL SHIFT
                            </span>
                          )}
                          {(isCurrent || isAdaptedActive) && !isShifted && (
                            <span style={{ fontSize: 10, background: isAdaptedActive ? "var(--water)" : "var(--growth)", color: "#17140F", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="irr-stage-dates">
                          {formatDate(r.start)} &rarr; {formatDate(r.end)} &middot; {r.days}d
                          {r.delta_days !== undefined && r.delta_days !== 0 && (
                            <span style={{ marginLeft: 6, fontWeight: 600, color: r.delta_days > 0 ? "var(--alert)" : "var(--growth)" }}>
                              (Adjusted from {r.days - r.delta_days}d)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="irr-stage-mid">
                        <span className="irr-kc-chip">Kc {r.kc}</span>
                        <span className="irr-kc-chip" style={{ color: adaptiveResult ? "var(--water)" : "inherit" }}>{r.etc} mm/day</span>
                      </div>
                      <div className="irr-stage-right">
                        every {r.intervalDays}d &middot; {r.depthPerEventMM} mm ({r.events} times)
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Water Consumption Chart */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 10 }}>
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

              {/* Farm Memory Audit Log */}
              {adaptiveHistory.length > 0 && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--water)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <Activity size={13} /> Farm Memory: Feedback Audit Trail
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'JetBrains Mono', monospace" }}>{adaptiveHistory.length} entries</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                    {adaptiveHistory.map((h) => (
                      <div key={h.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-dim)" }}>
                            {new Date(h.timestamp).toLocaleString()} &middot; Day {h.days_since_sowing}
                          </span>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                            color: h.shift_days > 0 ? "var(--alert)" : h.shift_days < 0 ? "var(--growth)" : "var(--text-dim)"
                          }}>
                            {h.shift_days > 0 ? `+${h.shift_days}d shift` : h.shift_days < 0 ? `${h.shift_days}d shift` : "No shift"}
                          </span>
                        </div>
                        <div style={{ color: "var(--text)", fontStyle: "italic", marginBottom: 2 }}>&ldquo;{h.feedback}&rdquo;</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{h.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL: Field Setup Settings ── */}
        {showFieldSetup && (
          <div className="irr-modal-overlay" onClick={() => setShowFieldSetup(false)}>
            <div className="irr-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="irr-modal-header">
                <h3><SlidersHorizontal size={14} color="var(--growth)" /> {tr("fieldSetupTitle")}</h3>
                <button className="irr-modal-close" onClick={() => setShowFieldSetup(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="irr-field">
                <label>{tr("cropLabel")}</label>
                <select value={cropId} onChange={(e) => { setCropId(e.target.value); setAdaptiveResult(null); }}>
                  {CROPS.map((c) => <option value={c.id} key={c.id}>{tCropName(lang, c)} ({c.season})</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("plantingDateLabel")}</label>
                <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  {tr("sowWindowNote", tCropName(lang, crop), crop.season, crop.sow)}
                </div>
              </div>

              <div className="irr-field">
                <label>{tr("soilTypeLabel")}</label>
                <select value={soilKey} onChange={(e) => setSoilKey(e.target.value)}>
                  {Object.entries(SOILS).map(([k, s]) => <option value={k} key={k}>{s.name}</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("climateLabel")}</label>
                <select value={climateKey} onChange={(e) => setClimateKey(e.target.value)}>
                  {Object.entries(CLIMATES).map(([k, c]) => <option value={k} key={k}>{c.name}</option>)}
                </select>
              </div>

              <div className="irr-field">
                <label>{tr("methodLabel")}</label>
                <select value={methodKey} onChange={(e) => setMethodKey(e.target.value)}>
                  {Object.entries(METHODS).map(([k, m]) => <option value={k} key={k}>{m.label} ({Math.round(m.eff * 100)}%)</option>)}
                </select>
              </div>

              <button
                className="irr-btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => setShowFieldSetup(false)}
              >
                <CheckCircle2 size={15} /> Done
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL: Farmer Feedback (with mic) ── */}
        {showFeedback && (
          <div className="irr-modal-overlay" onClick={() => setShowFeedback(false)}>
            <div className="irr-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="irr-modal-header">
                <h3><Sparkles size={14} color="var(--water)" /> Farmer Feedback</h3>
                <button className="irr-modal-close" onClick={() => setShowFeedback(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="irr-field">
                <label>Current Crop: <span className="val">{tCropName(lang, crop)}</span></label>
              </div>

              <div className="irr-field">
                <label>Days Since Sowing: <span className="val">{daysElapsed} days</span></label>
                <input type="range" min={1} max={crop.duration} value={daysElapsed} onChange={(e) => setDaysElapsed(parseInt(e.target.value))} />
              </div>

              <div className="irr-field">
                <label>{tr("pastHarvest")}:</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["success", "partial", "failure"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPrevHarvest(v)}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                        fontFamily: "'JetBrains Mono', monospace",
                        background: prevHarvest === v ? (v === "success" ? "var(--growth)" : v === "failure" ? "var(--alert)" : "var(--harvest)") : "var(--surface-2)",
                        color: prevHarvest === v ? "#17140F" : "var(--text-dim)",
                        border: "1px solid " + (prevHarvest === v ? "transparent" : "var(--border)")
                      }}
                    >
                      {tr(v)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="irr-field">
                <label>Quick Reports:</label>
                <div className="irr-preset-chips">
                  {PRESET_FEEDBACKS.map((p, idx) => (
                    <button key={idx} className="irr-preset-chip" onClick={() => setFeedbackInput(p.text)}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Observation Input */}
              <div className="irr-field">
                <label>Field Observation / Weather Report:</label>
                <div style={{ position: "relative" }}>
                  <textarea
                    rows={3}
                    placeholder="e.g. Heavy rain 40mm expected tomorrow; soil in north field is waterlogged..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    style={{ paddingRight: 50 }}
                  />
                  <button
                    className={`irr-mic-btn ${isListening ? 'active' : ''}`}
                    onClick={toggleSpeech}
                    style={{ position: "absolute", right: 8, bottom: 8 }}
                    title={isListening ? "Stop recording" : "Speak (supports EN, हिं, த)"}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? "Stop" : "Mic"}
                  </button>
                </div>
              </div>

              <button
                className="irr-btn-primary"
                onClick={() => { handleApplyFeedback(); setShowFeedback(false); }}
                disabled={isLoadingAdaptive || !feedbackInput.trim()}
                style={{ background: "var(--water)", marginTop: 6 }}
              >
                {isLoadingAdaptive ? (
                  <><RefreshCw size={15} className="spin" /> Consulting Model Engine...</>
                ) : (
                  <><Sparkles size={15} /> Analyze with Model & Get Suggestion</>
                )}
              </button>

              {adaptiveResult && (
                <button
                  style={{
                    width: "100%", marginTop: 8, background: "transparent", border: "1px solid var(--border)",
                    color: "var(--text-dim)", padding: 8, borderRadius: 8, fontSize: 12, cursor: "pointer"
                  }}
                  onClick={() => { resetAdaptivePlan(); setShowFeedback(false); }}
                >
                  Reset to Original Plan
                </button>
              )}
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
              <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 0, marginBottom: 14 }}>
                Enter your soil and weather readings on the left, then use the trained ML Model to find the best crop.
              </p>
              <button
                className="irr-btn-primary"
                style={{ width: "100%", padding: "14px", marginBottom: "20px", fontSize: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                onClick={getCropRecommendation}
                disabled={isRecommending}
              >
                {isRecommending ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
                {isRecommending ? "Analyzing with Model..." : "Get Model Crop Recommendation (with SHAP)"}
              </button>

              {/* Top Section Explanation (rendered above cards when top match Reason or SHAP is clicked) */}
              {topReasonTab && matches.length > 0 && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--water)", borderRadius: 12, padding: 18, marginBottom: 20, animation: "irr-slide-up 0.2s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--water)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <Info size={14} /> Top Recommendation Analysis — {tCropName(lang, matches[0].crop)}
                    </div>
                    <button
                      onClick={() => setTopReasonTab(null)}
                      style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 14 }}
                    >✕</button>
                  </div>

                  {topReasonTab === "reason" && (
                    <div style={{ background: "rgba(79, 163, 181, 0.1)", borderLeft: "3px solid var(--water)", padding: "12px 16px", borderRadius: "0 8px 8px 0", color: "var(--text)", fontSize: 13, lineHeight: 1.5 }}>
                      {recommendation && recommendation.recommended_crop === matches[0].crop.id ? (
                        <span><b>Model Explanation:</b> {recommendation.explanation}</span>
                      ) : (
                        <span>Your soil N={inputs.n}, P={inputs.p}, K={inputs.k} values with {inputs.temp}°C temperature, {inputs.humidity}% humidity, and pH {inputs.ph} give a <b>{matches[0].score}% match</b> for {tCropName(lang, matches[0].crop)}.</span>
                      )}
                    </div>
                  )}

                  {topReasonTab === "shap" && (
                    recommendation && recommendation.shap_values && recommendation.shap_values.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BarChart2 size={14} color="var(--water)"/> Feature Impact (SHAP Values for {tCropName(lang, matches[0].crop)})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {recommendation.shap_values.map((shap, idx) => {
                            const impact = shap.impact || 0;
                            const isPositive = impact > 0;
                            const maxAbs = Math.max(1, ...recommendation.shap_values.map(s => Math.abs(s.impact || 0)));
                            const width = (Math.abs(impact) / maxAbs) * 100;
                            return (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', alignItems: 'center', gap: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                                <div style={{ color: "var(--text-dim)", textAlign: 'right' }}>{shap.feature}</div>
                                <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, position: 'relative' }}>
                                  <div style={{ 
                                    position: 'absolute', 
                                    top: 0, bottom: 0, 
                                    left: isPositive ? '50%' : `calc(50% - ${width / 2}%)`, 
                                    width: `${width / 2}%`, 
                                    background: isPositive ? "var(--growth)" : "var(--alert)",
                                    borderRadius: 3 
                                  }} />
                                </div>
                                <div style={{ color: isPositive ? "var(--growth)" : "var(--alert)" }}>
                                  {impact > 0 ? '+' : ''}{impact.toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "var(--text-dim)", fontSize: 13, padding: "8px 0" }}>
                        Click <b>"Get Model Crop Recommendation (with SHAP)"</b> above to run the ML model and compute SHAP feature impacts for {tCropName(lang, matches[0]?.crop)}.
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Crop Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.slice(0, 6).map((m, idx) => {
                  const isModelPick = m.isAiPick || (recommendation && recommendation.recommended_crop === m.crop.id);
                  const isTopMatch = idx === 0;

                  return (
                    <div key={m.crop.id} style={{ background: 'var(--surface)', border: isTopMatch ? '1px solid var(--growth)' : '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{CROP_ICON[m.crop.id] || '🌱'}</span>
                          <div>
                            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 600 }}>
                              {tCropName(lang, m.crop)}
                              {isTopMatch && (
                                <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--growth)', color: '#17140F', padding: '2px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                                  TOP MATCH
                                </span>
                              )}
                              {isModelPick && !isTopMatch && (
                                <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--water)', color: '#17140F', padding: '2px 6px', borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                                  🤖 Model Pick
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
                              {m.crop.duration} day crop · {m.crop.season}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: m.score >= 80 ? 'var(--growth)' : m.score >= 50 ? 'var(--harvest)' : 'var(--alert)' }}>
                            {m.score}%
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>match</div>
                        </div>
                      </div>
                      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, marginTop: 10, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${m.score}%`, background: m.score >= 80 ? 'var(--growth)' : m.score >= 50 ? 'var(--harvest)' : 'var(--alert)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* ONLY first/top match gets Reason and SHAP buttons */}
                        {isTopMatch && (
                          <>
                            <button 
                              onClick={() => setTopReasonTab(topReasonTab === 'reason' ? null : 'reason')} 
                              style={{
                                background: topReasonTab === 'reason' ? 'var(--water)' : 'var(--surface-2)',
                                border: '1px solid var(--water)',
                                color: topReasonTab === 'reason' ? '#17140F' : 'var(--text)',
                                borderRadius: 999, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600
                              }}
                            >
                              💡 Reason
                            </button>
                            {(isModelPick || recommendation) && (
                              <button 
                                onClick={() => setTopReasonTab(topReasonTab === 'shap' ? null : 'shap')} 
                                style={{
                                  background: topReasonTab === 'shap' ? 'var(--water)' : 'var(--surface-2)',
                                  border: '1px solid var(--water)',
                                  color: topReasonTab === 'shap' ? '#17140F' : 'var(--text)',
                                  borderRadius: 999, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600
                                }}
                              >
                                📊 SHAP Values
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => { setCropId(m.crop.id); setAdaptiveResult(null); setMode('timeline'); }} style={{ background: 'transparent', border: '1px solid var(--growth)', color: 'var(--growth)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
                          Use in Plan →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: MARKET PRICES & FORECASTING MAP                           */}
        {/* ============================================================== */}
        {mode === "market" && (
          <div style={{ width: "100%", marginTop: 8 }}>
            <CropPriceMap initialCrop={crop?.name} />
          </div>
        )}

      </div>
    </div>
    </div>
  );
}
