import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Droplet, CalendarDays, Sun, Download, Info, ChevronRight, Ruler,
  Leaf, Sparkles, RefreshCw, History, Trash2, Zap, CloudRain, Thermometer, Bug, Snowflake, Beaker,
} from "lucide-react";
import "./App.css";

/* ══════════════════════════════════════════════════════
   CROP DATA
   ══════════════════════════════════════════════════════ */
const CROPS = [
  { id:"rice",name:"Rice",cat:"Cereal",season:"Kharif",sow:"Jun–Jul",rootDepth:.4,flood:true,
    ideal:{n:[70,110],p:[30,55],k:[30,55],temp:[22,32],humidity:[75,90],ph:[5.5,7],rainfall:[180,300]},
    stages:[{name:"Nursery / Germination",days:20,kc:.9},{name:"Tillering / Vegetative",days:40,kc:1.1},{name:"Flowering / Reproductive",days:30,kc:1.2},{name:"Ripening / Maturity",days:30,kc:.9}]},
  { id:"wheat",name:"Wheat",cat:"Cereal",season:"Rabi",sow:"Nov–Dec",rootDepth:1,flood:false,
    ideal:{n:[60,100],p:[40,60],k:[30,50],temp:[12,25],humidity:[50,70],ph:[6,7.5],rainfall:[60,100]},
    stages:[{name:"Germination",days:15,kc:.35},{name:"Tillering / Vegetative",days:35,kc:.75},{name:"Heading / Flowering",days:40,kc:1.15},{name:"Ripening / Maturity",days:30,kc:.4}]},
  { id:"maize",name:"Maize",cat:"Cereal",season:"Kharif",sow:"Jun–Jul",rootDepth:1,flood:false,
    ideal:{n:[70,100],p:[35,55],k:[15,35],temp:[18,27],humidity:[55,75],ph:[5.8,7],rainfall:[60,110]},
    stages:[{name:"Germination",days:15,kc:.3},{name:"Vegetative",days:30,kc:.75},{name:"Tasseling / Flowering",days:30,kc:1.2},{name:"Maturity",days:25,kc:.6}]},
  { id:"chickpea",name:"Chickpea",cat:"Pulse",season:"Rabi",sow:"Oct–Nov",rootDepth:.6,flood:false,
    ideal:{n:[25,55],p:[45,75],k:[65,95],temp:[15,25],humidity:[40,60],ph:[6,8],rainfall:[40,70]},
    stages:[{name:"Germination",days:15,kc:.4},{name:"Vegetative",days:30,kc:.7},{name:"Flowering / Podding",days:35,kc:1.05},{name:"Maturity",days:20,kc:.5}]},
  { id:"cotton",name:"Cotton",cat:"Fibre",season:"Kharif",sow:"Apr–May",rootDepth:1,flood:false,
    ideal:{n:[85,115],p:[35,55],k:[30,50],temp:[21,30],humidity:[55,70],ph:[6,8],rainfall:[60,100]},
    stages:[{name:"Germination",days:20,kc:.35},{name:"Vegetative",days:40,kc:.75},{name:"Flowering / Boll Dev.",days:65,kc:1.15},{name:"Maturity",days:40,kc:.6}]},
  { id:"sugarcane",name:"Sugarcane",cat:"Cash Crop",season:"Year-round",sow:"Feb–Mar",rootDepth:1.2,flood:false,
    ideal:{n:[85,115],p:[45,65],k:[35,55],temp:[21,32],humidity:[65,85],ph:[6,7.5],rainfall:[150,250]},
    stages:[{name:"Germination",days:35,kc:.4},{name:"Tillering / Vegetative",days:105,kc:1},{name:"Grand Growth",days:140,kc:1.25},{name:"Ripening / Maturity",days:50,kc:.75}]},
  { id:"groundnut",name:"Groundnut",cat:"Oilseed",season:"Kharif",sow:"Jun–Jul",rootDepth:.5,flood:false,
    ideal:{n:[15,45],p:[45,65],k:[35,55],temp:[22,30],humidity:[50,70],ph:[6,7],rainfall:[60,100]},
    stages:[{name:"Germination",days:15,kc:.4},{name:"Vegetative",days:30,kc:.7},{name:"Flowering / Pegging",days:40,kc:1.05},{name:"Maturity",days:25,kc:.6}]},
  { id:"banana",name:"Banana",cat:"Fruit",season:"Year-round",sow:"Jun–Jul",rootDepth:.5,flood:false,
    ideal:{n:[85,115],p:[60,90],k:[280,320],temp:[22,32],humidity:[70,90],ph:[5.5,7],rainfall:[150,250]},
    stages:[{name:"Establishment",days:30,kc:.5},{name:"Vegetative",days:120,kc:1},{name:"Flowering / Bunching",days:90,kc:1.15},{name:"Maturity",days:60,kc:1.1}]},
  { id:"tomato",name:"Tomato",cat:"Vegetable",season:"Year-round",sow:"Jun–Jul / Oct–Nov",rootDepth:.5,flood:false,
    ideal:{n:[75,105],p:[45,75],k:[35,65],temp:[18,28],humidity:[55,70],ph:[6,6.8],rainfall:[40,70]},
    stages:[{name:"Establishment",days:20,kc:.5},{name:"Vegetative",days:30,kc:.85},{name:"Flowering / Fruit-set",days:30,kc:1.15},{name:"Ripening / Maturity",days:20,kc:.9}]},
  { id:"mango",name:"Mango",cat:"Fruit",season:"Perennial",sow:"Jan–Feb",rootDepth:1.5,flood:false,
    ideal:{n:[20,50],p:[20,50],k:[45,75],temp:[22,32],humidity:[50,70],ph:[5.5,7.5],rainfall:[75,120]},
    stages:[{name:"Flowering",days:20,kc:.5},{name:"Fruit-set / Development",days:60,kc:.85},{name:"Growth",days:45,kc:1},{name:"Ripening / Maturity",days:25,kc:.75}]},
];
CROPS.forEach(c=>{c.duration=c.stages.reduce((s,st)=>s+st.days,0)});

const SOILS={sandy:{label:"Sandy",fc:.12,wp:.05},sandyloam:{label:"Sandy Loam",fc:.18,wp:.08},loam:{label:"Loam",fc:.25,wp:.11},clayloam:{label:"Clay Loam",fc:.32,wp:.15},clay:{label:"Clay",fc:.38,wp:.2}};
const CLIMATES={arid:{label:"Arid / Very dry",et0:6.5},semiarid:{label:"Semi-Arid",et0:5.5},subhumid:{label:"Sub-Humid",et0:4.5},humid:{label:"Humid",et0:3.5}};
const METHODS={drip:{label:"Drip",eff:.9},sprinkler:{label:"Sprinkler",eff:.75},surface:{label:"Surface / Flood",eff:.6}};
const ROOT_F=[.3,.6,.9,1];
const SEG_COLORS=["hsl(110,40%,38%)","hsl(140,35%,32%)","hsl(35,65%,45%)","hsl(20,45%,35%)"];

const ICON={rice:"🍚",wheat:"🌾",maize:"🌽",chickpea:"🫘",cotton:"☁️",sugarcane:"🎋",groundnut:"🥜",banana:"🍌",tomato:"🍅",mango:"🥭"};

const PRESETS=[
  {icon:<CloudRain size={13}/>,label:"Heavy Rain (45mm)",text:"Weather forecast predicted heavy rain 45mm tomorrow. Soil will be wet and flooded."},
  {icon:<Thermometer size={13}/>,label:"Heatwave (+5°C)",text:"Intense heatwave expected for the next 5 days with temperatures exceeding 38°C."},
  {icon:<Beaker size={13}/>,label:"Urea Applied (25kg)",text:"Applied 25kg Nitrogen fertilizer today. Soil needs moderate moisture to dissolve."},
  {icon:<Snowflake size={13}/>,label:"Cold Snap / Frost",text:"Sudden cold wave and morning frost observed in field. Growth is slowing down."},
  {icon:<Bug size={13}/>,label:"Pest Attack",text:"Mild caterpillar attack spotted on vegetative leaves. Delaying next flood irrigation."},
];

/* ═══ Helpers ═══ */
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}
function parseD(s){const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);}
function toISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function fmt(d){return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});}
function fmtFull(d){return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function area2m(v,u){return u==="acre"?v*4046.86:u==="hectare"?v*10000:v;}
function scoreR(v,[lo,hi]){if(v>=lo&&v<=hi)return 1;const s=hi-lo||1;return Math.max(0,1-(v<lo?lo-v:v-hi)/s);}

/* ══════════════════════════════════════════════════════
   ANIMATED TIMELINE COMPONENT
   ══════════════════════════════════════════════════════ */
function AnimatedTimeline({ rows, planting, dayInSeason, duration, isAdapted }) {
  const pct = (dayInSeason >= 0 && dayInSeason < duration)
    ? Math.min(100, (dayInSeason / duration) * 100)
    : dayInSeason >= duration ? 100 : -1;

  return (
    <div className="timeline-rail anim-fade-up" style={{ animationDelay: "150ms" }}>
      {/* The animated bar track */}
      <div className="timeline-track">
        {rows.map((r, i) => {
          const basis = (r.days / duration) * 100;
          return (
            <div
              key={i}
              className="timeline-seg"
              style={{
                flexBasis: `${basis}%`,
                background: SEG_COLORS[i % SEG_COLORS.length],
                animation: `growWidth 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms both`,
              }}
              title={`${r.stage} — ${r.days} days`}
            >
              <span className="seg-label">{r.stage.split("/")[0].trim()}</span>
            </div>
          );
        })}

        {/* Current-day marker with pulse */}
        {pct >= 0 && pct <= 100 && (
          <div className="timeline-marker" style={{ left: `${pct}%` }}>
            <div className="timeline-marker-label">Day {dayInSeason + 1}</div>
          </div>
        )}
      </div>

      {/* Labels below */}
      <div className="timeline-labels">
        {rows.map((r, i) => {
          const basis = (r.days / duration) * 100;
          return (
            <div key={i} className="timeline-label-item" style={{ flexBasis: `${basis}%` }}>
              <span className="timeline-label-days">{r.days}d</span>
              <span className="timeline-label-dates">{fmt(r.start)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════ */
export default function App() {
  const [mode, setMode] = useState("adaptive");
  const [cropId, setCropId] = useState("rice");
  const [plantingDate, setPlantingDate] = useState(() => toISO(new Date()));
  const [soilKey, setSoilKey] = useState("loam");
  const [climateKey, setClimateKey] = useState("subhumid");
  const [et0Override, setEt0Override] = useState(null);
  const [methodKey, setMethodKey] = useState("surface");
  const [mad, setMad] = useState(50);
  const [area, setArea] = useState(1);
  const [areaUnit, setAreaUnit] = useState("acre");

  const [inputs, setInputs] = useState({ n:90, p:42, k:43, temp:24, humidity:82, ph:6.5, rainfall:200 });

  const [daysElapsed, setDaysElapsed] = useState(35);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("crop_adaptive_history") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("crop_adaptive_history", JSON.stringify(history)); } catch {}
  }, [history]);

  const crop = useMemo(() => CROPS.find(c => c.id === cropId) || CROPS[0], [cropId]);
  const soil = SOILS[soilKey], climate = CLIMATES[climateKey], method = METHODS[methodKey];
  const et0 = et0Override ?? climate.et0;
  const planting = useMemo(() => parseD(plantingDate), [plantingDate]);

  // ── Recommendation ──
  const matches = useMemo(() =>
    CROPS.map(c => {
      const i = c.ideal;
      const avg = [scoreR(inputs.n,i.n),scoreR(inputs.p,i.p),scoreR(inputs.k,i.k),scoreR(inputs.temp,i.temp),scoreR(inputs.humidity,i.humidity),scoreR(inputs.ph,i.ph),scoreR(inputs.rainfall,i.rainfall)].reduce((a,b)=>a+b,0)/7;
      return { crop:c, score:Math.round(avg*100) };
    }).sort((a,b)=>b.score-a.score),
  [inputs]);

  // ── Schedule ──
  const schedule = useMemo(() => {
    let cur = planting;
    const rows = crop.stages.map((st, i) => {
      const start = cur, end = addDays(cur, st.days); cur = end;
      const etc = Math.round(et0 * st.kc * 10) / 10;
      const rootD = crop.rootDepth * ROOT_F[i];
      const taw = (soil.fc - soil.wp) * rootD * 1000;
      const raw = taw * (mad / 100);
      const gross = raw / method.eff;
      const intv = Math.max(1, Math.round(raw / Math.max(0.1, etc)));
      const ev = Math.max(1, Math.ceil(st.days / intv));
      return { stage:st.name, days:st.days, kc:st.kc, start, end, etc, intervalDays:intv, depthMM:Math.round(gross), events:ev, totalMM:Math.round(ev*gross) };
    });
    return { rows, totalMM:rows.reduce((s,r)=>s+r.totalMM,0), totalEv:rows.reduce((s,r)=>s+r.events,0), harvest:rows.at(-1)?.end||planting };
  }, [crop, planting, et0, soil, mad, method]);

  // ── Adapted schedule ──
  const dynSchedule = useMemo(() => {
    if (!result?.timeline_reschedule) return schedule;
    const adapted = result.timeline_reschedule.adapted_stages || [];
    let cur = planting;
    const rows = adapted.map((st, i) => {
      const start = cur, days = st.adapted_days || st.original_days || 30;
      const end = addDays(cur, days); cur = end;
      const tweakedEt = result.nlp_extraction?.tweaked_temperature ? Math.max(1.5, et0 + (result.nlp_extraction.tweaked_temperature - 26) * 0.15) : et0;
      const etc = Math.round(tweakedEt * (st.kc || 1) * 10) / 10;
      const rootD = crop.rootDepth * ROOT_F[Math.min(i, 3)];
      const taw = (soil.fc - soil.wp) * rootD * 1000;
      const raw = taw * (mad / 100);
      const gross = raw / method.eff;
      const intv = Math.max(1, Math.round(raw / Math.max(0.1, etc)));
      const ev = Math.max(1, Math.ceil(days / intv));
      return { stage:st.name, days, delta:st.delta_days||0, status:st.status, kc:st.kc, start, end, etc, intervalDays:intv, depthMM:Math.round(gross), events:ev, totalMM:Math.round(ev*gross) };
    });
    return { rows, totalMM:rows.reduce((s,r)=>s+r.totalMM,0), totalEv:rows.reduce((s,r)=>s+r.events,0), harvest:rows.at(-1)?.end||planting, isAdapted:true };
  }, [schedule, result, planting, et0, crop, soil, mad, method]);

  const active = result ? dynSchedule : schedule;
  const m2 = area2m(area, areaUnit);
  const m3 = Math.round((active.totalMM / 1000) * m2);

  const today = new Date();
  const dayIn = Math.floor((today - planting) / 864e5);
  const inSeason = dayIn >= 0 && dayIn < crop.duration;

  // ── Submit Feedback ──
  async function submit(textOverride) {
    const text = (textOverride || feedbackInput).trim();
    if (!text) return;
    setIsLoading(true);

    const payload = {
      crop_name: crop.id,
      days_since_sowing: parseInt(daysElapsed) || 30,
      feedback_text: text,
      baseline: { n:inputs.n, p:inputs.p, k:inputs.k, ph:inputs.ph, temperature:inputs.temp, humidity:inputs.humidity, rainfall:inputs.rainfall },
      stages: crop.stages,
      region_id: "R1",
      prev_harvest_success: "success",
    };

    try {
      const res = await fetch("http://localhost:8000/api/adaptive-reschedule", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setResult(data);
      pushHistory(text, data.ml_prediction?.timeline_shift_days || 0, data.farmer_explanation, data.actionable_advisory);
    } catch {
      // Client-side fallback
      const isR = /rain|wet|flood|storm/i.test(text);
      const isH = /heat|hot|sun/i.test(text);
      const isC = /cold|frost|chill/i.test(text);
      const isF = /fertilizer|urea|npk/i.test(text);
      let shift = 0, expl = "Schedule recalibrated.", adv = "Monitor soil moisture regularly.";
      if (isR) { shift=3.5; expl="Heavy rainfall reported. Saturated root zone delays vegetative work."; adv="Pause irrigation 4 days. Clear drainage channels."; }
      else if (isH) { shift=-2; expl="High temperatures accelerate transpiration and stage progression."; adv="Increase watering frequency during cooler hours."; }
      else if (isC) { shift=4; expl="Low temperatures slow enzymatic growth, extending stage durations."; adv="Protect blooms; reduce water volume."; }
      else if (isF) { shift=-1; expl="Nutrient application provides a growth boost."; adv="Apply light 15mm irrigation to dissolve nutrients."; }

      const adapted = crop.stages.map((st, i) => ({
        name:st.name, kc:st.kc, original_days:st.days,
        adapted_days:Math.max(5, Math.round(st.days + (i>=1 ? shift/(crop.stages.length-1) : 0))),
        delta_days:i>=1 ? Math.round(shift/(crop.stages.length-1)) : 0,
        status:i===1?"active":i<1?"completed":"upcoming",
      }));
      const data = {
        status:"success", nlp_extraction:{affected_feature:isR?"rainfall":"temperature", weather_event:isR?"rain":"normal"},
        ml_prediction:{timeline_shift_days:shift, contingency_crop:crop.id, crop_change_recommended:false, confidence:.91},
        timeline_reschedule:{adapted_stages:adapted, net_shift_days:shift},
        farmer_explanation:expl, actionable_advisory:adv,
      };
      setResult(data);
      pushHistory(text, shift, expl, adv);
    } finally { setIsLoading(false); }
  }

  function pushHistory(text, shift, expl, adv) {
    setHistory(prev => [{ id:Date.now(), ts:new Date().toISOString(), crop:crop.name, day:daysElapsed, text, shift, expl, adv }, ...prev.slice(0,19)]);
  }

  const chartData = active.rows.map(r => ({ name:r.stage.split("/")[0].trim(), mm:r.etc }));

  /* ══════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════ */
  return (
    <div className="app-shell">

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-top">
          <div className="badge"><Leaf size={12}/> Smart Crop Advisory · Adaptive Analytics</div>
        </div>
        <h1 className="anim-fade-up">
          Your crop plan adapts<br/>
          <span>when the weather changes.</span>
        </h1>
        <p className="anim-fade-up" style={{animationDelay:"80ms"}}>
          Report rain, heat, frost, or fertilizer — the ML engine recalculates your entire schedule, irrigation events, and harvest date in real-time.
        </p>
      </div>

      {/* ── TAB BAR ── */}
      <div className="tab-bar">
        <button className={`tab-btn ${mode==="adaptive"?"active-blue":""}`} onClick={()=>setMode("adaptive")}>
          <Zap size={13}/> Adaptive Copilot
        </button>
        <button className={`tab-btn ${mode==="plan"?"active":""}`} onClick={()=>setMode("plan")}>
          <CalendarDays size={13}/> Planting & Irrigation
        </button>
        <button className={`tab-btn ${mode==="recommend"?"active":""}`} onClick={()=>setMode("recommend")}>
          <Leaf size={13}/> Find a Crop
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div className="content">

        {/* ═════════════ ADAPTIVE COPILOT ═════════════ */}
        {mode === "adaptive" && (
          <div className="grid-layout">
            {/* Left — Input Panel */}
            <div className="panel anim-fade-up">
              <div className="panel-title"><Sparkles size={13} color="var(--c-blue)"/> Field Feedback</div>

              <div className="field">
                <label>Crop <span className="fval">{ICON[crop.id]||"🌱"} {crop.name}</span></label>
                <select value={cropId} onChange={e=>setCropId(e.target.value)}>
                  {CROPS.map(c=><option key={c.id} value={c.id}>{c.name} ({c.season})</option>)}
                </select>
              </div>

              <div className="field">
                <label>Days Since Sowing <span className="fval">{daysElapsed}d</span></label>
                <input type="range" min={1} max={crop.duration} value={daysElapsed} onChange={e=>setDaysElapsed(+e.target.value)}/>
              </div>

              <div className="field">
                <label>Quick Scenarios</label>
                <div className="presets">
                  {PRESETS.map((p,i)=>(
                    <button key={i} className="preset-btn" onClick={()=>{setFeedbackInput(p.text);submit(p.text);}}>
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Or describe what happened:</label>
                <textarea rows={3} placeholder="e.g. Tomorrow news said heavy rain 40mm…" value={feedbackInput} onChange={e=>setFeedbackInput(e.target.value)}/>
              </div>

              <button className="btn-primary blue" onClick={()=>submit()} disabled={isLoading}>
                {isLoading ? <><RefreshCw size={14} className="spin"/> Recalculating…</> : <><Zap size={14}/> Recalculate Timeline</>}
              </button>

              {result && <button className="btn-ghost" onClick={()=>{setResult(null);setFeedbackInput("");}}>Reset to Original</button>}
            </div>

            {/* Right — Results */}
            <div>
              {result ? (
                <div className="adaptive-banner">
                  <div className="adaptive-banner-head">
                    <div>
                      <div className="ab-tag">⚡ Adaptive Plan Active</div>
                      <h3>{result.farmer_explanation}</h3>
                      <div className="ab-advisory">💡 <b>Advisory:</b> {result.actionable_advisory}</div>
                    </div>
                    <div className="shift-badge">
                      <div className="sb-label">Net Shift</div>
                      <div className={`sb-val ${(result.ml_prediction?.timeline_shift_days||0)>=0?"shift-pos":"shift-neg"}`}>
                        {(result.ml_prediction?.timeline_shift_days||0)>0?"+":""}{result.ml_prediction?.timeline_shift_days||0}d
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="placeholder-card">
                  <Info size={18}/> Select a scenario or type your own report to see the timeline adapt in real-time.
                </div>
              )}

              {/* Stats */}
              <div className="stats stagger">
                <div className="stat-card accent-g"><div className="stat-label">Planting</div><div className="stat-value">{fmt(planting)}</div></div>
                <div className="stat-card accent-a"><div className="stat-label">Harvest</div><div className="stat-value">{fmt(active.harvest)}</div></div>
                <div className="stat-card"><div className="stat-label">Duration</div><div className="stat-value">{active.rows.reduce((s,r)=>s+r.days,0)}<small>days</small></div></div>
                <div className="stat-card accent-b"><div className="stat-label">Water</div><div className="stat-value">{active.totalMM}<small>mm</small></div></div>
                <div className="stat-card"><div className="stat-label">Events</div><div className="stat-value">{active.totalEv}</div></div>
              </div>

              {/* Animated Timeline */}
              <AnimatedTimeline rows={active.rows} planting={planting} dayInSeason={dayIn} duration={active.rows.reduce((s,r)=>s+r.days,0)} isAdapted={!!result}/>

              {/* Stage Detail Cards */}
              <div className="stage-cards stagger">
                {active.rows.map((r,i)=>(
                  <div key={i} className={`stage-card ${r.status==="active"?"is-active":""} ${r.status==="completed"?"is-completed":""}`} style={{borderLeftColor:SEG_COLORS[i%SEG_COLORS.length], animationDelay:`${i*80}ms`}}>
                    <div>
                      <div className="stage-name">
                        {r.stage}
                        {r.status==="active" && <span className="stage-tag now">NOW</span>}
                        {r.status==="completed" && <span className="stage-tag done">DONE</span>}
                        {r.delta!==undefined && r.delta>0 && <span className="stage-tag shifted-pos">+{r.delta}d</span>}
                        {r.delta!==undefined && r.delta<0 && <span className="stage-tag shifted-neg">{r.delta}d</span>}
                      </div>
                      <div className="stage-meta">{fmt(r.start)} → {fmt(r.end)} · {r.days}d</div>
                    </div>
                    <div className="stage-chips">
                      <span className="chip">Kc {r.kc}</span>
                      <span className="chip">{r.etc} mm/day</span>
                    </div>
                    <div className="stage-irr">every {r.intervalDays}d · {r.depthMM}mm × {r.events}</div>
                  </div>
                ))}
              </div>

              {/* History */}
              <div className="history-header">
                <div className="history-title"><History size={12}/> Feedback Memory ({history.length})</div>
                {history.length>0 && <button className="clear-btn" onClick={()=>{setHistory([]);localStorage.removeItem("crop_adaptive_history");}}><Trash2 size={11}/> Clear</button>}
              </div>
              {history.length===0 ? (
                <div className="empty-state">No feedback logged yet. Submit a report to build farm memory.</div>
              ) : (
                <div>
                  {history.map(h=>(
                    <div key={h.id} className="history-item">
                      <div className="history-item-head">
                        <span>{new Date(h.ts).toLocaleDateString()} · {h.crop} (Day {h.day})</span>
                        <span className={h.shift>=0?"shift-pos":"shift-neg"}>{h.shift>0?"+":""}{h.shift}d</span>
                      </div>
                      <div className="history-item-text">"{h.text}"</div>
                      <div className="history-item-expl">{h.expl}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════ PLANTING & IRRIGATION ═════════════ */}
        {mode === "plan" && (
          <div className="grid-layout">
            <div className="panel anim-fade-up">
              <div className="panel-title"><Ruler size={13}/> Field Setup</div>
              <div className="field"><label>Crop</label><select value={cropId} onChange={e=>setCropId(e.target.value)}>{CROPS.map(c=><option key={c.id} value={c.id}>{c.name} ({c.season})</option>)}</select></div>
              <div className="field"><label>Planting Date</label><input type="date" value={plantingDate} onChange={e=>setPlantingDate(e.target.value)}/></div>
              <div className="field"><label>Soil Type</label><select value={soilKey} onChange={e=>setSoilKey(e.target.value)}>{Object.entries(SOILS).map(([k,s])=><option key={k} value={k}>{s.label}</option>)}</select></div>
              <div className="field"><label>Climate</label><select value={climateKey} onChange={e=>{setClimateKey(e.target.value);setEt0Override(null);}}>{Object.entries(CLIMATES).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}</select></div>
              <div className="field"><label>Irrigation Method</label><select value={methodKey} onChange={e=>setMethodKey(e.target.value)}>{Object.entries(METHODS).map(([k,m])=><option key={k} value={k}>{m.label} ({Math.round(m.eff*100)}%)</option>)}</select></div>
              <div className="field"><label>Field Size</label><div className="row2"><input type="number" min={0.1} step={0.1} value={area} onChange={e=>setArea(+e.target.value||0)}/><select value={areaUnit} onChange={e=>setAreaUnit(e.target.value)}><option value="acre">Acres</option><option value="hectare">Hectares</option><option value="m2">m²</option></select></div></div>
            </div>

            <div>
              <div className="stats stagger">
                <div className="stat-card accent-g"><div className="stat-label">Planting</div><div className="stat-value">{fmtFull(planting)}</div></div>
                <div className="stat-card accent-a"><div className="stat-label">Harvest</div><div className="stat-value">{fmtFull(schedule.harvest)}</div></div>
                <div className="stat-card"><div className="stat-label">Duration</div><div className="stat-value">{crop.duration}<small>days</small></div></div>
                <div className="stat-card accent-b"><div className="stat-label">Total Water</div><div className="stat-value">{schedule.totalMM}<small>mm</small></div></div>
                <div className="stat-card"><div className="stat-label">Volume</div><div className="stat-value">{m3.toLocaleString()}<small>m³</small></div></div>
              </div>

              <AnimatedTimeline rows={schedule.rows} planting={planting} dayInSeason={dayIn} duration={crop.duration}/>

              <div className="stage-cards stagger">
                {schedule.rows.map((r,i)=>(
                  <div key={i} className="stage-card" style={{borderLeftColor:SEG_COLORS[i%SEG_COLORS.length], animationDelay:`${i*80}ms`}}>
                    <div>
                      <div className="stage-name">{r.stage}</div>
                      <div className="stage-meta">{fmtFull(r.start)} → {fmtFull(r.end)} · {r.days}d</div>
                    </div>
                    <div className="stage-chips"><span className="chip">Kc {r.kc}</span><span className="chip">{r.etc} mm/day</span></div>
                    <div className="stage-irr">every {r.intervalDays}d · {r.depthMM}mm × {r.events}</div>
                  </div>
                ))}
              </div>

              <div className="chart-wrap">
                <div className="chart-title">Water Consumption by Stage (mm/day)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(37,10%,16%)"/>
                    <XAxis dataKey="name" tick={{fill:"hsl(38,18%,62%)",fontSize:10}}/>
                    <YAxis tick={{fill:"hsl(38,18%,62%)",fontSize:10}}/>
                    <Tooltip contentStyle={{background:"hsl(38,12%,8%)",border:"1px solid hsl(37,10%,16%)",borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="mm" fill="hsl(190,55%,50%)" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="tip-card">
                <b>💡 Tip:</b> Switch to the <b>Adaptive Copilot</b> tab to simulate weather disruptions and watch the timeline and irrigation events recalculate in real-time.
              </div>
            </div>
          </div>
        )}

        {/* ═════════════ CROP RECOMMENDATION ═════════════ */}
        {mode === "recommend" && (
          <div className="grid-layout">
            <div className="panel anim-fade-up">
              <div className="panel-title"><Info size={13}/> Soil & Weather</div>
              {[
                {k:"n",l:"Nitrogen (N)",u:"kg/ha",mn:0,mx:140},
                {k:"p",l:"Phosphorus (P)",u:"kg/ha",mn:0,mx:140},
                {k:"k",l:"Potassium (K)",u:"kg/ha",mn:0,mx:210},
                {k:"temp",l:"Temperature",u:"°C",mn:5,mx:42},
                {k:"humidity",l:"Humidity",u:"%",mn:15,mx:100},
                {k:"ph",l:"Soil pH",u:"",mn:3.5,mx:9,step:.1},
                {k:"rainfall",l:"Rainfall",u:"mm",mn:10,mx:320},
              ].map(f=>(
                <div className="field" key={f.k}>
                  <label>{f.l} <span className="fval">{inputs[f.k]}{f.u}</span></label>
                  <input type="range" min={f.mn} max={f.mx} step={f.step||1} value={inputs[f.k]} onChange={e=>setInputs({...inputs,[f.k]:+e.target.value})}/>
                </div>
              ))}
            </div>

            <div className="anim-fade-up" style={{animationDelay:"100ms"}}>
              <p style={{color:"var(--c-text3)",fontSize:13,marginBottom:"var(--sp-4)"}}>Crops ranked by how well your soil & weather match their ideal range.</p>
              <div className="match-grid">
                {matches.map(({crop:c,score})=>(
                  <div key={c.id} className="match-card">
                    <div className="match-icon">{ICON[c.id]||"🌱"}</div>
                    <div className="match-name">{c.name}</div>
                    <div className="match-score">{score}% Match</div>
                    <button className="btn-primary" style={{fontSize:12,padding:7}} onClick={()=>{setCropId(c.id);setMode("plan");}}>
                      Use in Plan <ChevronRight size={13}/>
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
