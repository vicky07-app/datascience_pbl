import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import "./App.css";

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */
const CROPS = [
  {id:"rice",name:"Rice",emoji:"🍚",season:"Kharif",sow:"Jun–Jul",rootDepth:.4,flood:true,
    ideal:{n:[70,110],p:[30,55],k:[30,55],temp:[22,32],humidity:[75,90],ph:[5.5,7],rainfall:[180,300]},
    stages:[{name:"Nursery",days:20,kc:.9,color:"#3a7d44"},{name:"Tillering",days:40,kc:1.1,color:"#2d6a4f"},{name:"Flowering",days:30,kc:1.2,color:"#d4a03c"},{name:"Maturity",days:30,kc:.9,color:"#8b5e3c"}]},
  {id:"wheat",name:"Wheat",emoji:"🌾",season:"Rabi",sow:"Nov–Dec",rootDepth:1,flood:false,
    ideal:{n:[60,100],p:[40,60],k:[30,50],temp:[12,25],humidity:[50,70],ph:[6,7.5],rainfall:[60,100]},
    stages:[{name:"Germination",days:15,kc:.35,color:"#3a7d44"},{name:"Tillering",days:35,kc:.75,color:"#2d6a4f"},{name:"Heading",days:40,kc:1.15,color:"#d4a03c"},{name:"Maturity",days:30,kc:.4,color:"#8b5e3c"}]},
  {id:"maize",name:"Maize",emoji:"🌽",season:"Kharif",sow:"Jun–Jul",rootDepth:1,flood:false,
    ideal:{n:[70,100],p:[35,55],k:[15,35],temp:[18,27],humidity:[55,75],ph:[5.8,7],rainfall:[60,110]},
    stages:[{name:"Germination",days:15,kc:.3,color:"#3a7d44"},{name:"Vegetative",days:30,kc:.75,color:"#2d6a4f"},{name:"Tasseling",days:30,kc:1.2,color:"#d4a03c"},{name:"Maturity",days:25,kc:.6,color:"#8b5e3c"}]},
  {id:"chickpea",name:"Chickpea",emoji:"🫘",season:"Rabi",sow:"Oct–Nov",rootDepth:.6,flood:false,
    ideal:{n:[25,55],p:[45,75],k:[65,95],temp:[15,25],humidity:[40,60],ph:[6,8],rainfall:[40,70]},
    stages:[{name:"Germination",days:15,kc:.4,color:"#3a7d44"},{name:"Vegetative",days:30,kc:.7,color:"#2d6a4f"},{name:"Flowering",days:35,kc:1.05,color:"#d4a03c"},{name:"Maturity",days:20,kc:.5,color:"#8b5e3c"}]},
  {id:"cotton",name:"Cotton",emoji:"☁️",season:"Kharif",sow:"Apr–May",rootDepth:1,flood:false,
    ideal:{n:[85,115],p:[35,55],k:[30,50],temp:[21,30],humidity:[55,70],ph:[6,8],rainfall:[60,100]},
    stages:[{name:"Germination",days:20,kc:.35,color:"#3a7d44"},{name:"Vegetative",days:40,kc:.75,color:"#2d6a4f"},{name:"Boll Dev.",days:65,kc:1.15,color:"#d4a03c"},{name:"Maturity",days:40,kc:.6,color:"#8b5e3c"}]},
  {id:"sugarcane",name:"Sugarcane",emoji:"🎋",season:"Year-round",sow:"Feb–Mar",rootDepth:1.2,flood:false,
    ideal:{n:[85,115],p:[45,65],k:[35,55],temp:[21,32],humidity:[65,85],ph:[6,7.5],rainfall:[150,250]},
    stages:[{name:"Germination",days:35,kc:.4,color:"#3a7d44"},{name:"Tillering",days:105,kc:1,color:"#2d6a4f"},{name:"Grand Growth",days:140,kc:1.25,color:"#d4a03c"},{name:"Maturity",days:50,kc:.75,color:"#8b5e3c"}]},
  {id:"groundnut",name:"Groundnut",emoji:"🥜",season:"Kharif",sow:"Jun–Jul",rootDepth:.5,flood:false,
    ideal:{n:[15,45],p:[45,65],k:[35,55],temp:[22,30],humidity:[50,70],ph:[6,7],rainfall:[60,100]},
    stages:[{name:"Germination",days:15,kc:.4,color:"#3a7d44"},{name:"Vegetative",days:30,kc:.7,color:"#2d6a4f"},{name:"Pegging",days:40,kc:1.05,color:"#d4a03c"},{name:"Maturity",days:25,kc:.6,color:"#8b5e3c"}]},
  {id:"banana",name:"Banana",emoji:"🍌",season:"Year-round",sow:"Jun–Jul",rootDepth:.5,flood:false,
    ideal:{n:[85,115],p:[60,90],k:[280,320],temp:[22,32],humidity:[70,90],ph:[5.5,7],rainfall:[150,250]},
    stages:[{name:"Establishment",days:30,kc:.5,color:"#3a7d44"},{name:"Vegetative",days:120,kc:1,color:"#2d6a4f"},{name:"Bunching",days:90,kc:1.15,color:"#d4a03c"},{name:"Maturity",days:60,kc:1.1,color:"#8b5e3c"}]},
  {id:"tomato",name:"Tomato",emoji:"🍅",season:"Year-round",sow:"Oct–Nov",rootDepth:.5,flood:false,
    ideal:{n:[75,105],p:[45,75],k:[35,65],temp:[18,28],humidity:[55,70],ph:[6,6.8],rainfall:[40,70]},
    stages:[{name:"Establishment",days:20,kc:.5,color:"#3a7d44"},{name:"Vegetative",days:30,kc:.85,color:"#2d6a4f"},{name:"Fruiting",days:30,kc:1.15,color:"#d4a03c"},{name:"Ripening",days:20,kc:.9,color:"#8b5e3c"}]},
  {id:"mango",name:"Mango",emoji:"🥭",season:"Perennial",sow:"Jan–Feb",rootDepth:1.5,flood:false,
    ideal:{n:[20,50],p:[20,50],k:[45,75],temp:[22,32],humidity:[50,70],ph:[5.5,7.5],rainfall:[75,120]},
    stages:[{name:"Flowering",days:20,kc:.5,color:"#3a7d44"},{name:"Fruit-set",days:60,kc:.85,color:"#2d6a4f"},{name:"Growth",days:45,kc:1,color:"#d4a03c"},{name:"Ripening",days:25,kc:.75,color:"#8b5e3c"}]},
];
CROPS.forEach(c=>{c.duration=c.stages.reduce((s,st)=>s+st.days,0)});

const SOILS={sandy:{l:"Sandy",fc:.12,wp:.05},sandyloam:{l:"Sandy Loam",fc:.18,wp:.08},loam:{l:"Loam",fc:.25,wp:.11},clayloam:{l:"Clay Loam",fc:.32,wp:.15},clay:{l:"Clay",fc:.38,wp:.2}};
const CLIMATES={arid:{l:"Arid",et0:6.5},semiarid:{l:"Semi-Arid",et0:5.5},subhumid:{l:"Sub-Humid",et0:4.5},humid:{l:"Humid",et0:3.5}};
const METHODS={drip:{l:"Drip",eff:.9},sprinkler:{l:"Sprinkler",eff:.75},surface:{l:"Surface / Flood",eff:.6}};
const RF=[.3,.6,.9,1];

const SCENARIOS=[
  {emoji:"🌧️",label:"Heavy Rain",desc:"45mm rainfall expected tomorrow",text:"Weather forecast predicted heavy rain 45mm tomorrow. Soil will be waterlogged."},
  {emoji:"🔥",label:"Heatwave",desc:"+5°C for 5 days",text:"Intense heatwave expected for the next 5 days with temperatures exceeding 38°C."},
  {emoji:"🧪",label:"Fertilizer",desc:"25kg Urea applied",text:"Applied 25kg Nitrogen fertilizer today. Soil needs moderate moisture to dissolve."},
  {emoji:"❄️",label:"Frost",desc:"Cold wave overnight",text:"Sudden cold wave and morning frost observed in field. Growth is slowing down."},
  {emoji:"🐛",label:"Pest Attack",desc:"Caterpillar infestation",text:"Mild caterpillar attack spotted on vegetative leaves. Delaying next irrigation."},
  {emoji:"💧",label:"Drought",desc:"No rain for 2 weeks",text:"No rainfall for past 14 days. Soil is parched dry and cracking. Crop is wilting."},
];

/* Helpers */
const addD=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r};
const parseD=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const toISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmt=d=>d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
const fmtL=d=>d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const scoreR=(v,[lo,hi])=>{if(v>=lo&&v<=hi)return 1;const s=hi-lo||1;return Math.max(0,1-(v<lo?lo-v:v-hi)/s)};

/* ══════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════ */
export default function App(){
  /* -- state -- */
  const[view,setView]=useState("adapt"); // adapt | plan | find
  const[cropId,setCropId]=useState("rice");
  const[plantDate,setPlantDate]=useState(()=>toISO(new Date()));
  const[soilK,setSoilK]=useState("loam");
  const[climK,setClimK]=useState("subhumid");
  const[methK,setMethK]=useState("surface");
  const[mad,setMad]=useState(50);
  const[area,setArea]=useState(1);
  const[areaU,setAreaU]=useState("acre");
  const[inp,setInp]=useState({n:90,p:42,k:43,temp:24,hum:82,ph:6.5,rain:200});
  const[daysSow,setDaysSow]=useState(35);
  const[fbText,setFbText]=useState("");
  const[loading,setLoading]=useState(false);
  const[res,setRes]=useState(null);
  const[hist,setHist]=useState(()=>{try{return JSON.parse(localStorage.getItem("farm_hist")||"[]")}catch{return[]}});
  const[showHist,setShowHist]=useState(false);
  const fbRef=useRef(null);

  useEffect(()=>{try{localStorage.setItem("farm_hist",JSON.stringify(hist))}catch{}},[hist]);

  const crop=useMemo(()=>CROPS.find(c=>c.id===cropId)||CROPS[0],[cropId]);
  const soil=SOILS[soilK],clim=CLIMATES[climK],meth=METHODS[methK];
  const et0=clim.et0;
  const plant=useMemo(()=>parseD(plantDate),[plantDate]);

  /* matches */
  const matches=useMemo(()=>CROPS.map(c=>{
    const i=c.ideal;const avg=[scoreR(inp.n,i.n),scoreR(inp.p,i.p),scoreR(inp.k,i.k),scoreR(inp.temp,i.temp),scoreR(inp.hum,i.humidity),scoreR(inp.ph,i.ph),scoreR(inp.rain,i.rainfall)].reduce((a,b)=>a+b,0)/7;
    return{crop:c,score:Math.round(avg*100)};
  }).sort((a,b)=>b.score-a.score),[inp]);

  /* schedule */
  const sched=useMemo(()=>{
    let cur=plant;
    const rows=crop.stages.map((st,i)=>{
      const start=cur,end=addD(cur,st.days);cur=end;
      const etc=Math.round(et0*st.kc*10)/10;
      const rd=crop.rootDepth*RF[i],taw=(soil.fc-soil.wp)*rd*1000,raw=taw*(mad/100),gross=raw/meth.eff;
      const intv=Math.max(1,Math.round(raw/Math.max(.1,etc))),ev=Math.max(1,Math.ceil(st.days/intv));
      return{name:st.name,days:st.days,kc:st.kc,color:st.color,start,end,etc,intv,depth:Math.round(gross),ev,total:Math.round(ev*gross)};
    });
    return{rows,totalMM:rows.reduce((s,r)=>s+r.total,0),totalEv:rows.reduce((s,r)=>s+r.ev,0),harvest:rows.at(-1)?.end||plant};
  },[crop,plant,et0,soil,mad,meth]);

  /* adapted */
  const dynSched=useMemo(()=>{
    if(!res?.timeline_reschedule)return sched;
    const ad=res.timeline_reschedule.adapted_stages||[];let cur=plant;
    const rows=ad.map((st,i)=>{
      const start=cur,days=st.adapted_days||st.original_days||30,end=addD(cur,days);cur=end;
      const te=res.nlp_extraction?.tweaked_temperature?Math.max(1.5,et0+(res.nlp_extraction.tweaked_temperature-26)*.15):et0;
      const etc=Math.round(te*(st.kc||1)*10)/10;
      const rd=crop.rootDepth*RF[Math.min(i,3)],taw=(soil.fc-soil.wp)*rd*1000,raw=taw*(mad/100),gross=raw/meth.eff;
      const intv=Math.max(1,Math.round(raw/Math.max(.1,etc))),ev=Math.max(1,Math.ceil(days/intv));
      return{name:st.name,days,delta:st.delta_days||0,status:st.status,kc:st.kc,color:crop.stages[i]?.color||"#555",start,end,etc,intv,depth:Math.round(gross),ev,total:Math.round(ev*gross)};
    });
    return{rows,totalMM:rows.reduce((s,r)=>s+r.total,0),totalEv:rows.reduce((s,r)=>s+r.ev,0),harvest:rows.at(-1)?.end||plant,adapted:true};
  },[sched,res,plant,et0,crop,soil,mad,meth]);

  const act=res?dynSched:sched;
  const totalDur=act.rows.reduce((s,r)=>s+r.days,0);
  const dayIn=Math.floor((new Date()-plant)/864e5);
  const pct=dayIn>=0&&dayIn<totalDur?dayIn/totalDur*100:dayIn>=totalDur?100:-1;

  /* submit */
  async function submit(txt){
    const t=(txt||fbText).trim();if(!t)return;
    setLoading(true);
    try{
      const r=await fetch("http://localhost:8000/api/adaptive-reschedule",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({crop_name:crop.id,days_since_sowing:+daysSow||30,feedback_text:t,
          baseline:{n:inp.n,p:inp.p,k:inp.k,ph:inp.ph,temperature:inp.temp,humidity:inp.hum,rainfall:inp.rain},
          stages:crop.stages,region_id:"R1",prev_harvest_success:"success"})});
      if(!r.ok)throw new Error();const d=await r.json();setRes(d);
      pushH(t,d.ml_prediction?.timeline_shift_days||0,d.farmer_explanation,d.actionable_advisory);
    }catch{
      const isR=/rain|wet|flood|storm/i.test(t),isH=/heat|hot|sun/i.test(t),isC=/cold|frost|chill/i.test(t),isF=/fert|urea|npk/i.test(t);
      let sh=0,ex="Schedule recalibrated.",ad="Monitor soil moisture.";
      if(isR){sh=3.5;ex="Heavy rainfall delays field work. Irrigation paused.";ad="Clear drainage channels. Resume after 4 days.";}
      else if(isH){sh=-2;ex="Heatwave accelerates evapotranspiration.";ad="Increase watering during cooler hours.";}
      else if(isC){sh=4;ex="Cold slows metabolic growth.";ad="Protect blooms; reduce water.";}
      else if(isF){sh=-1;ex="Nutrient boost accelerates growth.";ad="Light irrigation to dissolve nutrients.";}
      const adapted=crop.stages.map((s,i)=>({name:s.name,kc:s.kc,original_days:s.days,
        adapted_days:Math.max(5,Math.round(s.days+(i>=1?sh/(crop.stages.length-1):0))),
        delta_days:i>=1?Math.round(sh/(crop.stages.length-1)):0,
        status:i===0?"completed":i===1?"active":"upcoming"}));
      const d={nlp_extraction:{tweaked_temperature:isH?31:isC?18:26},
        ml_prediction:{timeline_shift_days:sh,contingency_crop:crop.id},
        timeline_reschedule:{adapted_stages:adapted},
        farmer_explanation:ex,actionable_advisory:ad};
      setRes(d);pushH(t,sh,ex,ad);
    }finally{setLoading(false)}
  }
  function pushH(t,sh,ex,ad){setHist(p=>[{id:Date.now(),ts:new Date().toISOString(),crop:crop.name,day:daysSow,text:t,shift:sh,expl:ex},
    ...p.slice(0,24)])}

  const chartD=act.rows.map(r=>({name:r.name,mm:r.etc}));

  /* ══════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════ */
  return(
  <div className="shell">

    {/* ═══ NAV ═══ */}
    <nav className="nav">
      <div className="nav-brand">{crop.emoji}<span>CropAdvisor</span></div>
      <div className="nav-links">
        <button className={`nav-link ${view==="adapt"?"on":""}`} onClick={()=>setView("adapt")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Adaptive Timeline
        </button>
        <button className={`nav-link ${view==="plan"?"on":""}`} onClick={()=>setView("plan")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Schedule
        </button>
        <button className={`nav-link ${view==="find"?"on":""}`} onClick={()=>setView("find")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Find Crop
        </button>
      </div>
      <div className="nav-crop-sel">
        <select value={cropId} onChange={e=>setCropId(e.target.value)}>
          {CROPS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>
    </nav>

    {/* ═══ MAIN ═══ */}
    <main className="main" key={view}>

    {/* ═════════════════════════════════════════════
        VIEW: ADAPTIVE TIMELINE
        ═════════════════════════════════════════════ */}
    {view==="adapt"&&<>

      {/* Hero strip */}
      <section className="hero-strip fade-up">
        <div className="hero-left">
          <div className="hero-crop-badge">{crop.emoji} {crop.name} · {crop.season}</div>
          <h1>Tell us what changed,<br/>we'll fix the plan.</h1>
          <p>Weather disruption, fertilizer applied, pest spotted — describe it below. Our ML engine recalculates your timeline, irrigation, and harvest date instantly.</p>
        </div>
        <div className="hero-stats">
          <div className="hs"><span className="hs-n">{totalDur}</span><span className="hs-l">Days Total</span></div>
          <div className="hs"><span className="hs-n">{act.totalMM}</span><span className="hs-l">mm Water</span></div>
          <div className="hs"><span className="hs-n">{act.totalEv}</span><span className="hs-l">Irrigations</span></div>
          <div className="hs"><span className="hs-n">{fmt(act.harvest)}</span><span className="hs-l">Harvest</span></div>
        </div>
      </section>

      {/* ANIMATED TIMELINE */}
      <section className="tl-section fade-up d1">
        <div className="tl-head">
          <h2>Growth Timeline</h2>
          {res&&<span className="tl-adapted-tag">⚡ Adapted</span>}
        </div>

        <div className="tl-bar">
          {act.rows.map((r,i)=>{
            const w=(r.days/totalDur)*100;
            const isAct=r.status==="active";
            return(
              <div key={i} className={`tl-seg ${isAct?"tl-seg-active":""}`} style={{width:`${w}%`,background:r.color}} title={`${r.name} — ${r.days}d`}>
                <span className="tl-seg-name">{r.name}</span>
                <span className="tl-seg-days">{r.days}d</span>
              </div>
            )
          })}
          {/* Current Day Needle */}
          {pct>=0&&pct<=100&&(
            <div className="tl-needle" style={{left:`${pct}%`}}>
              <div className="tl-needle-dot"/>
              <div className="tl-needle-line"/>
              <div className="tl-needle-label">TODAY · Day {dayIn+1}</div>
            </div>
          )}
        </div>
        <div className="tl-dates">
          <span>{fmt(plant)}</span>
          <span>{fmt(act.harvest)}</span>
        </div>
      </section>

      {/* Result Banner */}
      {res&&(
        <section className="result-banner fade-up">
          <div className="rb-content">
            <div className="rb-tag">⚡ Plan Updated</div>
            <h3>{res.farmer_explanation}</h3>
            <p>💡 {res.actionable_advisory}</p>
          </div>
          <div className={`rb-shift ${(res.ml_prediction?.timeline_shift_days||0)>=0?"rb-pos":"rb-neg"}`}>
            <span className="rb-shift-n">{(res.ml_prediction?.timeline_shift_days||0)>0?"+":""}{res.ml_prediction?.timeline_shift_days||0}</span>
            <span className="rb-shift-l">days shift</span>
          </div>
        </section>
      )}

      {/* Stage cards */}
      <section className="stages-section fade-up d2">
        <h2>Stage Breakdown</h2>
        <div className="stages-grid">
          {act.rows.map((r,i)=>(
            <div key={i} className={`sg-card ${r.status==="active"?"sg-active":""} ${r.status==="completed"?"sg-done":""}`}>
              <div className="sg-color" style={{background:r.color}}/>
              <div className="sg-body">
                <div className="sg-top">
                  <span className="sg-name">{r.name}</span>
                  {r.status==="active"&&<span className="sg-tag sg-tag-now">NOW</span>}
                  {r.delta>0&&<span className="sg-tag sg-tag-delay">+{r.delta}d</span>}
                  {r.delta<0&&<span className="sg-tag sg-tag-early">{r.delta}d</span>}
                </div>
                <div className="sg-dates">{fmt(r.start)} → {fmt(r.end)}</div>
                <div className="sg-metrics">
                  <span>{r.days} days</span>
                  <span>Kc {r.kc}</span>
                  <span>{r.etc} mm/d</span>
                  <span>💧 ×{r.ev}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEEDBACK INPUT SECTION */}
      <section className="fb-section fade-up d3">
        <div className="fb-left">
          <h2>Report a Change</h2>
          <p>Select a scenario or describe what happened in your field.</p>

          <div className="scenario-grid">
            {SCENARIOS.map((s,i)=>(
              <button key={i} className="scenario-btn" onClick={()=>{setFbText(s.text);submit(s.text)}}>
                <span className="sc-emoji">{s.emoji}</span>
                <span className="sc-label">{s.label}</span>
                <span className="sc-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="fb-right">
          <div className="fb-compose">
            <div className="fb-field">
              <label>Days since sowing</label>
              <input type="range" min={1} max={crop.duration} value={daysSow} onChange={e=>setDaysSow(+e.target.value)}/>
              <span className="fb-field-val">{daysSow} days</span>
            </div>
            <textarea ref={fbRef} rows={4} placeholder="Describe what happened… e.g. 'Tomorrow news said heavy rain 40mm'" value={fbText} onChange={e=>setFbText(e.target.value)}/>
            <button className="submit-btn" onClick={()=>submit()} disabled={loading||!fbText.trim()}>
              {loading?(
                <><svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Analyzing…</>
              ):(
                <>Recalculate Timeline →</>
              )}
            </button>
            {res&&<button className="reset-btn" onClick={()=>{setRes(null);setFbText("")}}>↺ Reset to original</button>}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="hist-section fade-up d4">
        <button className="hist-toggle" onClick={()=>setShowHist(!showHist)}>
          <span>📋 Feedback History ({hist.length})</span>
          <span>{showHist?"▲":"▼"}</span>
        </button>
        {showHist&&(
          <div className="hist-list">
            {hist.length===0?<div className="hist-empty">No history yet.</div>:
              hist.map(h=>(
                <div key={h.id} className="hist-item">
                  <div className="hi-head">
                    <span>{new Date(h.ts).toLocaleDateString()} · {h.crop} · Day {h.day}</span>
                    <span className={h.shift>=0?"hi-pos":"hi-neg"}>{h.shift>0?"+":""}{h.shift}d</span>
                  </div>
                  <div className="hi-text">"{h.text}"</div>
                  <div className="hi-expl">{h.expl}</div>
                </div>
              ))
            }
            {hist.length>0&&<button className="hist-clear" onClick={()=>{setHist([]);localStorage.removeItem("farm_hist")}}>Clear all history</button>}
          </div>
        )}
      </section>
    </>}

    {/* ═════════════════════════════════════════════
        VIEW: SCHEDULE / PLAN
        ═════════════════════════════════════════════ */}
    {view==="plan"&&<>
      <section className="plan-top fade-up">
        <h1>{crop.emoji} {crop.name} Schedule</h1>
        <p>{crop.season} season · Best sow: {crop.sow} · {crop.duration} days total</p>
      </section>

      <section className="plan-config fade-up d1">
        <div className="pc-grid">
          <div className="pc-field"><label>Planting Date</label><input type="date" value={plantDate} onChange={e=>setPlantDate(e.target.value)}/></div>
          <div className="pc-field"><label>Soil</label><select value={soilK} onChange={e=>setSoilK(e.target.value)}>{Object.entries(SOILS).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
          <div className="pc-field"><label>Climate</label><select value={climK} onChange={e=>setClimK(e.target.value)}>{Object.entries(CLIMATES).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}</select></div>
          <div className="pc-field"><label>Irrigation</label><select value={methK} onChange={e=>setMethK(e.target.value)}>{Object.entries(METHODS).map(([k,v])=><option key={k} value={k}>{v.l} ({Math.round(v.eff*100)}%)</option>)}</select></div>
          <div className="pc-field"><label>Field</label><div className="pc-row"><input type="number" min={0.1} step={0.1} value={area} onChange={e=>setArea(+e.target.value||0)}/><select value={areaU} onChange={e=>setAreaU(e.target.value)}><option value="acre">Acres</option><option value="hectare">Ha</option><option value="m2">m²</option></select></div></div>
        </div>
      </section>

      <section className="tl-section fade-up d2">
        <h2>Growth Timeline</h2>
        <div className="tl-bar">
          {sched.rows.map((r,i)=>{const w=(r.days/crop.duration)*100;
            return(<div key={i} className="tl-seg" style={{width:`${w}%`,background:r.color}} title={`${r.name} — ${r.days}d`}>
              <span className="tl-seg-name">{r.name}</span><span className="tl-seg-days">{r.days}d</span>
            </div>)})}
          {pct>=0&&pct<=100&&(<div className="tl-needle" style={{left:`${pct}%`}}><div className="tl-needle-dot"/><div className="tl-needle-line"/><div className="tl-needle-label">Day {dayIn+1}</div></div>)}
        </div>
        <div className="tl-dates"><span>{fmt(plant)}</span><span>{fmt(sched.harvest)}</span></div>
      </section>

      <section className="plan-stats fade-up d2">
        <div className="ps-card"><div className="ps-n">{fmtL(plant)}</div><div className="ps-l">Planting</div></div>
        <div className="ps-card"><div className="ps-n">{fmtL(sched.harvest)}</div><div className="ps-l">Harvest</div></div>
        <div className="ps-card"><div className="ps-n">{crop.duration}d</div><div className="ps-l">Duration</div></div>
        <div className="ps-card"><div className="ps-n">{sched.totalMM}mm</div><div className="ps-l">Water Need</div></div>
        <div className="ps-card"><div className="ps-n">{sched.totalEv}</div><div className="ps-l">Irrigations</div></div>
        <div className="ps-card"><div className="ps-n">{Math.round((sched.totalMM/1000)*(area*(areaU==="acre"?4046.86:areaU==="hectare"?10000:1))).toLocaleString()}m³</div><div className="ps-l">Volume</div></div>
      </section>

      <section className="stages-section fade-up d3">
        <h2>Detailed Schedule</h2>
        <div className="plan-table-wrap">
          <table className="plan-table">
            <thead><tr><th>Stage</th><th>Start</th><th>End</th><th>Days</th><th>Kc</th><th>ETc</th><th>Interval</th><th>Depth</th><th>Events</th></tr></thead>
            <tbody>{sched.rows.map((r,i)=>(
              <tr key={i}><td><span className="pt-dot" style={{background:r.color}}/>{r.name}</td><td>{fmtL(r.start)}</td><td>{fmtL(r.end)}</td><td>{r.days}d</td><td>{r.kc}</td><td>{r.etc}mm/d</td><td>every {r.intv}d</td><td>{r.depth}mm</td><td>{r.ev}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="chart-section fade-up d4">
        <h2>Water Demand by Stage</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartD}><CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e"/><XAxis dataKey="name" tick={{fill:"#777",fontSize:11}}/><YAxis tick={{fill:"#777",fontSize:11}}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,fontSize:12,color:"#ddd"}}/><Bar dataKey="mm" fill="#3a7d44" radius={[5,5,0,0]}/></BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>}

    {/* ═════════════════════════════════════════════
        VIEW: FIND CROP
        ═════════════════════════════════════════════ */}
    {view==="find"&&<>
      <section className="find-top fade-up">
        <h1>Find the right crop</h1>
        <p>Adjust your soil readings and weather — we'll rank every crop by compatibility.</p>
      </section>

      <section className="find-controls fade-up d1">
        {[
          {k:"n",l:"Nitrogen",u:"kg/ha",mn:0,mx:140},{k:"p",l:"Phosphorus",u:"kg/ha",mn:0,mx:140},{k:"k",l:"Potassium",u:"kg/ha",mn:0,mx:210},
          {k:"temp",l:"Temperature",u:"°C",mn:5,mx:42},{k:"hum",l:"Humidity",u:"%",mn:15,mx:100},{k:"ph",l:"pH",u:"",mn:3.5,mx:9,step:.1},{k:"rain",l:"Rainfall",u:"mm",mn:10,mx:320},
        ].map(f=>(
          <div key={f.k} className="fc-field">
            <div className="fc-row"><span>{f.l}</span><span className="fc-val">{inp[f.k]}{f.u}</span></div>
            <input type="range" min={f.mn} max={f.mx} step={f.step||1} value={inp[f.k]} onChange={e=>setInp({...inp,[f.k]:+e.target.value})}/>
          </div>
        ))}
      </section>

      <section className="find-results fade-up d2">
        <div className="fr-grid">
          {matches.map(({crop:c,score})=>(
            <div key={c.id} className="fr-card" onClick={()=>{setCropId(c.id);setView("plan")}}>
              <div className="fr-emoji">{c.emoji}</div>
              <div className="fr-name">{c.name}</div>
              <div className="fr-season">{c.season} · {c.duration}d</div>
              <div className="fr-bar-track"><div className="fr-bar-fill" style={{width:`${score}%`}}/></div>
              <div className="fr-score">{score}%</div>
            </div>
          ))}
        </div>
      </section>
    </>}

    </main>
  </div>
  );
}
