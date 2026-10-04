import React, { useState } from 'react';
import App from './App.jsx';
import CropPriceMap from './CropPriceMap.jsx';
import { Sprout, LineChart } from 'lucide-react';
import './CropPriceMap.css';

export default function CropPriceApp() {
  const [activeTab, setActiveTab] = useState('market');

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {activeTab === 'irrigation' ? <App /> : <CropPriceMap />}
      
      <div className="floating-nav">
        <div className="nav-pill">
          <button 
            className={`nav-btn ${activeTab === 'irrigation' ? 'active' : ''}`}
            onClick={() => setActiveTab('irrigation')}
          >
            <Sprout size={18} />
            <span>Irrigation Planner</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            <LineChart size={18} />
            <span>Market Prices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
