import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/* CONSTANTS                                                           */
/* ------------------------------------------------------------------ */

const LANGS = [
  { key: "en", label: "EN" },
  { key: "hi", label: "हिं" },
  { key: "ta", label: "த" },
];

const FEATURES = [
  {
    tab: "recommend",
    icon: "🌱",
    color: "#3ECF8E",
    glow: "rgba(62,207,142,0.22)",
    title: { en: "Find a Crop", hi: "फसल खोजें", ta: "பயிரைக் கண்டறி" },
    tagline: "ML Model · SHAP Explainability",
    desc: {
      en: "Enter your soil's N, P, K, pH and local climate. A trained Random Forest model recommends the best crop — with SHAP feature impact charts showing exactly why.",
      hi: "मिट्टी की NPK, pH और मौसम डालें। ML मॉडल सबसे उपयुक्त फसल सुझाएगा और SHAP से पारदर्शी व्याख्या देगा।",
      ta: "மண்ணின் NPK, pH, வானிலை தகவல் உள்ளிடவும். ML மாதிரி சிறந்த பயிரை SHAP விளக்கத்துடன் பரிந்துரைக்கும்.",
    },
    steps: ["Enter soil data", "Run ML model", "See SHAP chart"],
    cta: { en: "Analyse My Soil", hi: "मिट्टी विश्लेषण करें", ta: "மண் பகுப்பாய்வு" },
  },
  {
    tab: "timeline",
    icon: "📅",
    color: "#4BBFD6",
    glow: "rgba(75,191,214,0.22)",
    title: { en: "Adaptive Timeline", hi: "अनुकूली टाइमलाइन", ta: "அடாப்டிவ் காலவரிசை" },
    tagline: "Real-Time · AI Feedback · Dynamic",
    desc: {
      en: "Get a stage-wise cultivation timeline with irrigation schedules. Report weather in plain text — the AI model shifts your entire plan in real-time.",
      hi: "बुवाई से कटाई तक चरण-वार योजना पाएं। मौसम रिपोर्ट करें और AI तुरंत पूरी टाइमलाइन बदल देगा।",
      ta: "நடவிலிருந்து அறுவடை வரை திட்டம் பெறுங்கள். வானிலை மாற்றங்களை AI உடனே திட்டமாக்கும்.",
    },
    steps: ["Set planting date", "Get stage plan", "Report & Adapt"],
    cta: { en: "Open My Planner", hi: "मेरी योजना खोलें", ta: "திட்டம் திற" },
  },
  {
    tab: "market",
    icon: "📈",
    color: "#E8C04A",
    glow: "rgba(232,192,74,0.22)",
    title: { en: "Market Prices", hi: "बाज़ार भाव", ta: "சந்தை விலை" },
    tagline: "Price Forecast · Live Map · Mandi",
    desc: {
      en: "Discover nearby mandis on an interactive map. View forecasted crop prices for the next 3 months, trained on real Tamil Nadu market data.",
      hi: "इंटरेक्टिव मैप पर पास की मंडियां देखें। तमिलनाडु के असली बाज़ार डेटा से अगले 3 महीनों की कीमतें।",
      ta: "அருகில் உள்ள மண்டிகளை வரைபடத்தில் காணவும். 3 மாத விலை முன்னறிவிப்பு தமிழ்நாடு சந்தை தரவில் பெறவும்.",
    },
    steps: ["Pick your crop", "Find nearby mandis", "See 3-month forecast"],
    cta: { en: "Check Prices", hi: "भाव देखें", ta: "விலை பார்" },
  },
];

const STEPS = [
  { num: "01", icon: "🧪", title: "Enter Field Data", desc: "Soil N, P, K, pH + temperature, humidity, rainfall" },
  { num: "02", icon: "🤖", title: "Model Recommends", desc: "Random Forest picks your crop + SHAP explains why" },
  { num: "03", icon: "💬", title: "Report Conditions", desc: "Speak or type weather changes in your language" },
  { num: "04", icon: "⚡", title: "Plan Adapts", desc: "AI shifts your irrigation timeline based on real conditions" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function LandingPage({ onNavigate, lang, setLang }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  function T(obj) {
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.en;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B1612",
      color: "#E8F2EA",
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      overflowX: "hidden",
    }}>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        @keyframes agro-fadeup {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes agro-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes agro-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes agro-scan {
          0%   { left: -50%; width: 50%; }
          100% { left: 100%; width: 50%; }
        }
        @keyframes agro-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .agro-up-1 { animation: agro-fadeup 0.6s cubic-bezier(.22,1,.36,1) 0.05s both; }
        .agro-up-2 { animation: agro-fadeup 0.6s cubic-bezier(.22,1,.36,1) 0.15s both; }
        .agro-up-3 { animation: agro-fadeup 0.6s cubic-bezier(.22,1,.36,1) 0.25s both; }
        .agro-card-1 { animation: agro-fadeup 0.65s cubic-bezier(.22,1,.36,1) 0.30s both; }
        .agro-card-2 { animation: agro-fadeup 0.65s cubic-bezier(.22,1,.36,1) 0.42s both; }
        .agro-card-3 { animation: agro-fadeup 0.65s cubic-bezier(.22,1,.36,1) 0.54s both; }
        .agro-up-footer { animation: agro-fadeup 0.6s cubic-bezier(.22,1,.36,1) 0.60s both; }

        .agro-card {
          transition:
            transform 0.35s cubic-bezier(.34,1.56,.64,1),
            box-shadow 0.3s ease,
            border-color 0.3s ease,
            opacity 0.3s ease;
          cursor: pointer;
        }
        .agro-card:hover { transform: translateY(-10px) scale(1.025) !important; }
        .agro-card-dim  { opacity: 0.45; transform: scale(0.96) !important; }

        .agro-icon-float { animation: agro-float 3.2s ease-in-out infinite; }

        .agro-enter-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .agro-enter-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(62,207,142,0.35);
        }

        .agro-step {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .agro-step:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.35);
        }

        .agro-nav-lang {
          transition: background 0.15s, color 0.15s;
        }
        .agro-cta-link {
          transition: transform 0.15s ease, opacity 0.15s;
        }
        .agro-cta-link:hover { transform: translateX(3px); opacity: 0.85; }

        .agro-back {
          transition: opacity 0.15s, transform 0.15s;
          opacity: 0.6;
        }
        .agro-back:hover { opacity: 1; transform: translateX(-2px); }

        @media (max-width: 820px) {
          .agro-cards { flex-direction: column !important; align-items: center !important; }
          .agro-card  { max-width: 420px !important; width: 100% !important; }
          .agro-steps { flex-wrap: wrap !important; }
          .agro-hero-title { font-size: 34px !important; }
          .agro-nav { padding: 14px 20px !important; }
          .agro-hero-section { padding: 52px 20px 44px !important; }
          .agro-how-section  { padding: 44px 20px !important; }
          .agro-footer       { padding: 16px 20px !important; flex-direction: column !important; gap: 6px !important; text-align: center !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav className="agro-nav" style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 44px",
        borderBottom: "1px solid #1F3027",
        background: "rgba(11,22,18,0.85)",
        backdropFilter: "blur(14px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #3ECF8E 0%, #4BBFD6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, boxShadow: "0 4px 14px rgba(62,207,142,0.35)",
          }}>🌿</div>
          <div>
            <div style={{
              fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", color: "#E8F2EA",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>AgroSense</div>
            <div style={{
              fontSize: 9.5, color: "#4A8060",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>AI CROP ADVISORY</div>
          </div>
        </div>

        {/* Language toggle */}
        <div style={{
          display: "flex", gap: 3,
          background: "#112019", border: "1px solid #1F3027",
          borderRadius: 999, padding: 3,
        }}>
          {LANGS.map(l => (
            <button
              key={l.key}
              className="agro-nav-lang"
              onClick={() => setLang(l.key)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5, padding: "5px 13px", borderRadius: 999,
                cursor: "pointer", border: "none",
                background: lang === l.key ? "#3ECF8E" : "transparent",
                color: lang === l.key ? "#0B1612" : "#4A8060",
                fontWeight: lang === l.key ? 700 : 400,
              }}
            >{l.label}</button>
          ))}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="agro-hero-section" style={{
        textAlign: "center",
        padding: "72px 44px 60px",
        position: "relative",
        background: `
          radial-gradient(ellipse 60% 50% at 15% 0%,  rgba(62,207,142,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 5%,  rgba(75,191,214,0.09) 0%, transparent 60%),
          #0B1612
        `,
      }}>
        {/* Live badge */}
        <div className={ready ? "agro-up-1" : ""} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(62,207,142,0.08)",
          border: "1px solid rgba(62,207,142,0.25)",
          borderRadius: 999, padding: "6px 18px", marginBottom: 30,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, letterSpacing: "0.1em",
          color: "#3ECF8E", textTransform: "uppercase",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#3ECF8E",
            animation: "agro-pulse 2s ease infinite",
            display: "inline-block",
          }} />
          Data Analytics · Machine Learning · Explainable AI
        </div>

        {/* Headline */}
        <h1
          className={`agro-hero-title ${ready ? "agro-up-2" : ""}`}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 54, lineHeight: 1.1,
            letterSpacing: "-0.035em", marginBottom: 22,
            color: "#E8F2EA",
          }}
        >
          Smarter Farming,<br />
          <span style={{
            background: "linear-gradient(100deg, #3ECF8E 0%, #4BBFD6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            One Platform.
          </span>
        </h1>

        {/* Sub */}
        <p className={ready ? "agro-up-3" : ""} style={{
          fontSize: 17, color: "#5C8A6E",
          maxWidth: 560, margin: "0 auto 52px",
          lineHeight: 1.7,
        }}>
          AgroSense combines AI-powered crop recommendation, real-time adaptive farming timelines,
          and live market price forecasting — built for Indian farmers.
        </p>

        {/* ── Feature Cards ── */}
        <div className="agro-cards" style={{
          display: "flex", gap: 20, justifyContent: "center",
          maxWidth: 1020, margin: "0 auto 52px",
        }}>
          {FEATURES.map((f, i) => {
            const isHovered = hoveredCard === f.tab;
            const isDimmed  = hoveredCard !== null && hoveredCard !== f.tab;
            return (
              <div
                key={f.tab}
                className={`agro-card ${isDimmed ? "agro-card-dim" : ""} ${ready ? `agro-card-${i + 1}` : ""}`}
                onMouseEnter={() => setHoveredCard(f.tab)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onNavigate(f.tab)}
                style={{
                  flex: "1 1 280px", maxWidth: 310,
                  background: isHovered ? "#122018" : "#0F1C14",
                  border: `1.5px solid ${isHovered ? f.color : "#1F3027"}`,
                  borderRadius: 18, padding: "28px 24px 26px",
                  textAlign: "left", position: "relative", overflow: "hidden",
                  boxShadow: isHovered
                    ? `0 24px 56px ${f.glow}, 0 0 0 1px ${f.color}30`
                    : "0 4px 20px rgba(0,0,0,0.25)",
                }}
              >
                {/* Accent bar at top */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${f.color} 0%, transparent 80%)`,
                  opacity: isHovered ? 1 : 0.4,
                  transition: "opacity 0.3s ease",
                }} />

                {/* Subtle bg glow when hovered */}
                {isHovered && (
                  <div style={{
                    position: "absolute", top: -60, left: -60,
                    width: 180, height: 180, borderRadius: "50%",
                    background: `radial-gradient(circle, ${f.glow} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                )}

                {/* Icon */}
                <div
                  className="agro-icon-float"
                  style={{
                    fontSize: 38, marginBottom: 18, display: "inline-block",
                    animationDelay: `${i * 0.45}s`,
                  }}
                >{f.icon}</div>

                {/* Tag */}
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, color: f.color,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  marginBottom: 8, fontWeight: 600,
                }}>{f.tagline}</div>

                {/* Title */}
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 22, color: "#E8F2EA",
                  marginBottom: 10, letterSpacing: "-0.025em",
                }}>{T(f.title)}</div>

                {/* Desc */}
                <div style={{
                  fontSize: 13.5, color: "#5C8A6E",
                  lineHeight: 1.7, marginBottom: 20,
                }}>{T(f.desc)}</div>

                {/* Steps chips */}
                <div style={{ display: "flex", gap: 5, marginBottom: 22, flexWrap: "wrap" }}>
                  {f.steps.map((s, si) => (
                    <span key={si} style={{
                      fontSize: 10.5, padding: "3px 9px", borderRadius: 5,
                      background: `${f.color}14`, color: f.color,
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                      border: `1px solid ${f.color}25`,
                    }}>
                      {si + 1}. {s}
                    </span>
                  ))}
                </div>

                {/* CTA link */}
                <div className="agro-cta-link" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13.5, fontWeight: 700, color: f.color,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {T(f.cta)} <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main CTA Button */}
        <button
          className="agro-enter-btn"
          onClick={() => onNavigate("timeline")}
          style={{
            background: "linear-gradient(135deg, #3ECF8E 0%, #2EBD7C 100%)",
            color: "#0B1612", border: "none", borderRadius: 14,
            padding: "15px 40px", fontSize: 15.5, fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 28px rgba(62,207,142,0.28)",
          }}
        >
          ▶ &nbsp;Enter the System
        </button>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="agro-how-section" style={{
        padding: "60px 44px 64px",
        borderTop: "1px solid #1F3027",
        background: "#0D1913",
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, color: "#3ECF8E",
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 12,
          }}>— How It Works —</div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800, fontSize: 30, color: "#E8F2EA",
            letterSpacing: "-0.025em", margin: 0,
          }}>
            From Soil Sample to Smart Decision
          </h2>
        </div>

        <div className="agro-steps" style={{
          display: "flex", gap: 0, maxWidth: 960,
          margin: "0 auto", alignItems: "stretch",
          justifyContent: "center",
        }}>
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="agro-step" style={{
                flex: "1 1 180px", maxWidth: 220,
                background: "#0F1C14",
                border: "1px solid #1F3027",
                borderRadius: 14, padding: "22px 18px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{step.icon}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, color: "#3ECF8E",
                  marginBottom: 7, letterSpacing: "0.1em",
                }}>STEP {step.num}</div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 14, color: "#E8F2EA", marginBottom: 7,
                }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "#5C8A6E", lineHeight: 1.55 }}>
                  {step.desc}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  display: "flex", alignItems: "center", padding: "0 6px",
                  color: "#264533", fontSize: 22, fontWeight: 200,
                  flexShrink: 0,
                }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="agro-footer" style={{
        padding: "18px 44px",
        borderTop: "1px solid #1F3027",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
        background: "#0B1612",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: "#2E5040",
        }}>
          AgroSense · Smart Crop Advisory System · Data Science Project
        </div>
        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: "#2E5040",
        }}>
          {["Random Forest", "SHAP XAI", "Adaptive ML", "LLM Parser", "Tamil Nadu Data"].map((t, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>·</span>}
              <span>{t}</span>
            </React.Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}
