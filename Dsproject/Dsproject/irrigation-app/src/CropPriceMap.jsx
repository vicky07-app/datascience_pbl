import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, MapPin, Navigation, TrendingUp, TrendingDown, Calendar, BarChart3, Zap, Target, ArrowUpRight, ArrowDownRight, Minus, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './CropPriceMap.css';

const API_BASE = 'http://127.0.0.1:8000/api';

const formatINR = (val) => {
  if (val == null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const CATEGORY_COLORS = {
  'Fruit': '#f59e0b',
  'Vegetable': '#10b981',
  'Spice': '#ef4444',
  'Pulse': '#8b5cf6',
  'Cereal': '#3b82f6',
  'Oilseed': '#f97316',
  'Flower': '#ec4899',
  'Plantation': '#14b8a6',
  'Fibre': '#6366f1',
  'Cash crop': '#84cc16',
  'Tuber': '#d97706',
};

const CATEGORY_EMOJIS = {
  'Fruit': '🍎', 'Vegetable': '🥬', 'Spice': '🌶️', 'Pulse': '🫘',
  'Cereal': '🌾', 'Oilseed': '🥜', 'Flower': '🌸', 'Plantation': '🌴',
  'Fibre': '🧵', 'Cash crop': '💰', 'Tuber': '🥔',
};

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CropPriceMap({ initialCrop }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [crops, setCrops] = useState([]);
  const [categories, setCategories] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  const [userLoc, setUserLoc] = useState({ lat: 11.0, lon: 78.0 });
  const [radius, setRadius] = useState(200);

  // Fetch crops and categories
  useEffect(() => {
    fetch(`${API_BASE}/crops`)
      .then(res => res.json())
      .then(data => {
        const cropList = data.crops || [];
        setCrops(cropList);
        if (initialCrop) {
          const match = cropList.find(c => c.toLowerCase() === initialCrop.toLowerCase());
          if (match) {
            selectCrop(match);
          }
        }
      })
      .catch(console.error);
    fetch(`${API_BASE}/crop-categories`)
      .then(res => res.json())
      .then(data => setCategories(data.categories || {}))
      .catch(console.error);
  }, [initialCrop]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = window.L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([userLoc.lat, userLoc.lon], 7);

    // Esri World Dark Gray Canvas - 100% free, dark aesthetic, no API key needed
    window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }).addTo(map);

    window.L.control.zoom({ position: 'bottomright' }).addTo(map);

    // User location marker
    const userIcon = window.L.divIcon({
      className: 'user-marker',
      html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px rgba(59,130,246,0.6),0 0 40px rgba(59,130,246,0.3);position:relative;">
        <div style="position:absolute;inset:-6px;border:2px solid rgba(59,130,246,0.4);border-radius:50%;animation:pulse-ring 2s infinite;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    userMarkerRef.current = window.L.marker([userLoc.lat, userLoc.lon], { icon: userIcon }).addTo(map);
    userMarkerRef.current.bindPopup('<div class="cpm-popup"><h3>📍 Your Location</h3><p>Tamil Nadu Center</p></div>');

    mapInstance.current = map;

    // Invalidate size to ensure proper tile rendering in responsive layouts and tabs
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 250);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 0) {
      const filtered = crops.filter(c => c.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered.slice(0, 10));
    } else {
      setSuggestions([]);
    }
  };

  const selectCrop = useCallback((crop) => {
    setSelectedCrop(crop);
    setSearchQuery(crop);
    setSuggestions([]);
    setPredictionData(null);
    setSelectedMarket(null);
    fetchMarkets(crop);
  }, [userLoc, radius]);

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat) {
      setActiveCategory(null);
      setSuggestions([]);
    } else {
      setActiveCategory(cat);
      const catCrops = categories[cat] || [];
      setSuggestions(catCrops);
      setSearchQuery('');
    }
  };

  const fetchMarkets = async (crop) => {
    setLoadingMarkets(true);
    try {
      const res = await fetch(`${API_BASE}/markets?crop=${encodeURIComponent(crop)}&lat=${userLoc.lat}&lon=${userLoc.lon}&radius=${radius}`);
      const data = await res.json();
      setMarkets(data.markets || []);
    } catch (e) {
      console.error(e);
      setMarkets([]);
    } finally {
      setLoadingMarkets(false);
    }
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLoc(newLoc);
          if (mapInstance.current) {
            mapInstance.current.setView([newLoc.lat, newLoc.lon], 9);
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng([newLoc.lat, newLoc.lon]);
            }
          }
          if (selectedCrop) fetchMarkets(selectedCrop);
        },
        () => alert('Location access denied')
      );
    }
  };

  // Update markers on map
  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];

    markets.forEach((market, i) => {
      const color = CATEGORY_COLORS[market.category] || '#0d9488';
      const icon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div class="market-pin" style="--pin-color:${color};animation-delay:${i * 60}ms">
          <div style="width:14px;height:14px;background:${color};border-radius:50%;border:2px solid rgba(255,255,255,0.9);box-shadow:0 0 12px ${color}80;transition:transform 0.2s;"></div>
        </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = window.L.marker([market.latitude, market.longitude], { icon }).addTo(mapInstance.current);

      const popupContent = `
        <div class="cpm-popup">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="background:${color};color:#fff;padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:600;">${market.category}</span>
            <span style="color:#94a3b8;font-size:0.8rem;">${market.distance_km.toFixed(1)} km</span>
          </div>
          <h3 style="margin:0 0 2px;font-size:1.05rem;">${market.name}</h3>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <p style="margin:0;color:#94a3b8;font-size:0.85rem;">📍 ${market.district}</p>
            <a href="https://www.google.com/maps?q=${market.latitude},${market.longitude}" target="_blank" style="color:#4BBFD6;text-decoration:none;display:flex;align-items:center;gap:4px;font-size:0.75rem;background:rgba(75,191,214,0.1);padding:3px 8px;border-radius:99px;transition:0.2s;" onmouseover="this.style.background='rgba(75,191,214,0.2)'" onmouseout="this.style.background='rgba(75,191,214,0.1)'" title="Open in Google Maps">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> GMap
            </a>
          </div>
          <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">
            <span style="font-size:1.6rem;font-weight:800;color:#10b981;">${formatINR(market.current_price)}</span>
            <span style="font-size:0.75rem;color:#94a3b8;">/ quintal</span>
          </div>
          <button class="cpm-popup-btn" onclick="window.__predictClick('${market.name.replace(/'/g, "\\'")}')">
            📈 Predict Next 3 Months
          </button>
        </div>
      `;
      marker.bindPopup(popupContent, { maxWidth: 280, className: 'dark-popup' });
      markersRef.current.push(marker);
    });

    if (markets.length > 0) {
      const group = new window.L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds(), { padding: [60, 60] });
    }
  }, [markets, selectedCrop]);

  // Prediction click handler
  useEffect(() => {
    window.__predictClick = (marketName) => {
      const m = markets.find(x => x.name === marketName);
      setSelectedMarket(m || { name: marketName });
      fetchPrediction(marketName);
      setTimeout(() => {
        const panel = document.querySelector('.cpm-panel-section');
        if (panel) panel.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    };
    return () => { delete window.__predictClick; };
  }, [selectedCrop, markets]);

  const fetchPrediction = async (marketName) => {
    setLoadingPrediction(true);
    setPredictionData(null);
    setShowPanel(true);
    try {
      const res = await fetch(`${API_BASE}/predict?crop=${encodeURIComponent(selectedCrop)}&market=${encodeURIComponent(marketName)}`);
      const data = await res.json();
      setPredictionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Build chart data — critical: overlap last historical point into predicted so areas connect
  const chartData = useMemo(() => {
    if (!predictionData) return [];
    const hist = (predictionData.historical || []);
    const pred = (predictionData.predicted || []);

    const combined = [];
    hist.forEach(d => {
      combined.push({ date: d.date, price: d.price, priceH: d.price, priceP: null, type: 'historical' });
    });

    // Bridge: last historical point also gets priceP so the line connects
    if (hist.length > 0 && pred.length > 0) {
      combined[combined.length - 1].priceP = hist[hist.length - 1].price;
    }

    pred.forEach(d => {
      combined.push({ date: d.date, price: d.price, priceH: null, priceP: d.price, type: 'predicted' });
    });

    return combined;
  }, [predictionData]);

  const predStats = useMemo(() => {
    if (!predictionData) return null;
    const hist = predictionData.historical || [];
    const pred = predictionData.predicted || [];
    const lastHistPrice = hist.length > 0 ? hist[hist.length - 1].price : 0;
    const firstPredPrice = pred.length > 0 ? pred[0].price : 0;
    const lastPredPrice = pred.length > 0 ? pred[pred.length - 1].price : 0;
    const minPred = pred.length > 0 ? Math.min(...pred.map(p => p.price)) : 0;
    const maxPred = pred.length > 0 ? Math.max(...pred.map(p => p.price)) : 0;
    const allPrices = hist.map(h => h.price);
    const minHist = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxHist = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    return { lastHistPrice, firstPredPrice, lastPredPrice, minPred, maxPred, minHist, maxHist };
  }, [predictionData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPred = data.type === 'predicted';
      const [y, m] = data.date.split('-');
      const monthLabel = MONTH_NAMES[parseInt(m)] || m;
      return (
        <div className="custom-tooltip">
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>{monthLabel} {y}</p>
          <p style={{ margin: '4px 0 2px', fontWeight: 700, fontSize: '1.3rem', color: isPred ? '#f97316' : '#14b8a6' }}>
            {formatINR(data.price)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPred ? '#f97316' : '#14b8a6' }} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8' }}>
              {isPred ? 'Predicted' : 'Historical'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const trendIcon = predictionData?.price_trend === 'rising'
    ? <ArrowUpRight size={16} /> : predictionData?.price_trend === 'falling'
    ? <ArrowDownRight size={16} /> : <Minus size={16} />;
  const trendColor = predictionData?.price_trend === 'rising' ? '#ef4444' : predictionData?.price_trend === 'falling' ? '#10b981' : '#94a3b8';

  const categoryKeys = Object.keys(categories);

  return (
    <div className="cpm-container">
      {/* ── Top Bar ── */}
      <div className="cpm-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', borderRadius: '10px', padding: '6px', display: 'flex' }}>
            <BarChart3 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.5px' }}>AgriMarket</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Price Forecaster</p>
          </div>
        </div>

        <div className="cpm-search-wrap">
          <Search className="cpm-search-icon" size={16} />
          <input
            type="text"
            className="cpm-search-input"
            placeholder="Search crop name..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => { if (searchQuery.trim()) handleSearchChange({ target: { value: searchQuery } }); }}
          />
          {searchQuery && (
            <button className="cpm-search-clear" onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
              <X size={14} />
            </button>
          )}
          {suggestions.length > 0 && (
            <div className="cpm-suggestions">
              {suggestions.map((s, idx) => (
                <div key={idx} className="cpm-suggestion-item" onClick={() => selectCrop(s)}>
                  <span>{CATEGORY_EMOJIS[Object.entries(categories).find(([_, crops]) => crops.includes(s))?.[0]] || '🌱'}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="cpm-category-pills">
          {categoryKeys.map(cat => (
            <button
              key={cat}
              className={`cpm-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              style={{ '--cat-color': CATEGORY_COLORS[cat] || '#0d9488' }}
              onClick={() => handleCategoryClick(cat)}
            >
              <span>{CATEGORY_EMOJIS[cat] || '🌱'}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="cpm-location-wrap">
          <MapPin size={16} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tamil Nadu</span>
          <button className="cpm-location-btn" onClick={useMyLocation}>
            <Navigation size={13} /> My Loc
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="cpm-content">
        <div className="cpm-map-section">
          <div ref={mapRef} className="cpm-map-container" />
          {/* Market count badge */}
          {selectedCrop && !loadingMarkets && (
            <div className="cpm-map-badge">
              <Target size={14} />
              <span><b>{markets.length}</b> markets for <b>{selectedCrop}</b></span>
            </div>
          )}
          {loadingMarkets && (
            <div className="cpm-map-badge loading">
              <div className="cpm-spinner-sm" />
              <span>Finding markets...</span>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className={`cpm-panel-section ${showPanel ? 'open' : 'closed'}`}>
          {!selectedCrop && !loadingMarkets && (
            <div className="cpm-placeholder">
              <div className="cpm-placeholder-icon">
                <Search size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: '0 0 0.25rem' }}>Search a Crop</h3>
              <p>Type a crop name or select a category above to discover market prices across Tamil Nadu</p>
            </div>
          )}

          {selectedCrop && !predictionData && !loadingPrediction && !loadingMarkets && (
            <div className="cpm-placeholder">
              <div className="cpm-placeholder-icon">
                <MapPin size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ margin: '0 0 0.25rem' }}>Select a Market</h3>
              <p>Click any marker on the map and hit <b>"Predict"</b> to see the 3-month price forecast</p>
            </div>
          )}

          {loadingPrediction && (
            <div className="cpm-loading">
              <div className="cpm-spinner" />
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Training prediction...</p>
            </div>
          )}

          {predictionData && !loadingPrediction && (
            <div className="cpm-prediction-content">
              {/* Header */}
              <div className="cpm-pred-header">
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{predictionData.market}</h2>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    {predictionData.crop} · {predictionData.unit}
                  </p>
                </div>
                <div className="cpm-trend-badge" style={{ '--trend-color': trendColor }}>
                  {trendIcon}
                  <span>{predictionData.predicted_change_pct > 0 ? '+' : ''}{predictionData.predicted_change_pct}%</span>
                </div>
              </div>

              {/* Chart */}
              <div className="cpm-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>3-Month Price Forecast</h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#14b8a6', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 8, height: 8, background: '#14b8a6', borderRadius: '50%' }} /> Historical
                    </span>
                    <span style={{ color: '#f97316', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: 8, height: 8, background: '#f97316', borderRadius: '50%' }} /> Forecast
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradH" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => {
                          const [y, m] = val.split('-');
                          return `${MONTH_NAMES[parseInt(m)] || m} '${y.slice(2)}`;
                        }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                        width={55}
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                      {predictionData.historical.length > 0 && predictionData.predicted.length > 0 && (
                        <ReferenceLine
                          x={predictionData.historical[predictionData.historical.length - 1].date}
                          stroke="rgba(255,255,255,0.15)"
                          strokeDasharray="4 4"
                          label={{ value: 'Now', position: 'top', fill: '#64748b', fontSize: 11 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="priceH"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradH)"
                        dot={false}
                        activeDot={{ r: 5, stroke: '#14b8a6', strokeWidth: 2, fill: '#0f1419' }}
                        connectNulls={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="priceP"
                        stroke="#f97316"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#gradP)"
                        strokeDasharray="6 3"
                        dot={false}
                        activeDot={{ r: 5, stroke: '#f97316', strokeWidth: 2, fill: '#0f1419' }}
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="cpm-stats-grid">
                <div className="cpm-stat-card">
                  <div className="cpm-stat-label"><Calendar size={13} /> Avg Price</div>
                  <div className="cpm-stat-value">{formatINR(predictionData.avg_historical_price)}</div>
                  <div className="cpm-stat-sub">Historical average</div>
                </div>
                <div className="cpm-stat-card">
                  <div className="cpm-stat-label"><Zap size={13} color="#f97316" /> Latest</div>
                  <div className="cpm-stat-value">{predStats ? formatINR(predStats.lastHistPrice) : '—'}</div>
                  <div className="cpm-stat-sub">Most recent price</div>
                </div>
                <div className="cpm-stat-card">
                  <div className="cpm-stat-label"><TrendingUp size={13} color="#14b8a6" /> Forecast High</div>
                  <div className="cpm-stat-value" style={{ color: '#14b8a6' }}>{predStats ? formatINR(predStats.maxPred) : '—'}</div>
                  <div className="cpm-stat-sub">Next 3 months max</div>
                </div>
                <div className="cpm-stat-card">
                  <div className="cpm-stat-label"><TrendingDown size={13} color="#ef4444" /> Forecast Low</div>
                  <div className="cpm-stat-value" style={{ color: '#ef4444' }}>{predStats ? formatINR(predStats.minPred) : '—'}</div>
                  <div className="cpm-stat-sub">Next 3 months min</div>
                </div>
              </div>

              {/* Predicted months breakdown */}
              <div className="cpm-pred-months">
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>Monthly Forecast Breakdown</h4>
                {(predictionData.predicted || []).map((p, i) => {
                  const [y, m] = p.date.split('-');
                  const monthLabel = `${MONTH_NAMES[parseInt(m)]} ${y}`;
                  const prevPrice = i === 0 ? (predStats?.lastHistPrice || 0) : predictionData.predicted[i - 1].price;
                  const change = prevPrice ? ((p.price - prevPrice) / prevPrice * 100) : 0;
                  return (
                    <div key={i} className="cpm-month-row">
                      <div className="cpm-month-name">{monthLabel}</div>
                      <div className="cpm-month-price">{formatINR(p.price)}</div>
                      <div className="cpm-month-change" style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
                        {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(change).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
