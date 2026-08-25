import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Droplets,
  CloudRain,
  Sun,
  Wind,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { AgricultureAdvisory, WeatherLocation } from '../../types';

interface AgricultureViewProps {
  location: WeatherLocation;
}

export const AgricultureView: React.FC<AgricultureViewProps> = ({ location }) => {
  const [crop, setCrop] = useState('Paddy / Rice (धान)');
  const [advisory, setAdvisory] = useState<AgricultureAdvisory | null>(null);
  const [loading, setLoading] = useState(true);

  const cropsList = [
    'Paddy / Rice (धान)',
    'Cotton (कपास)',
    'Sugarcane (गन्ना)',
    'Wheat (गेहूं)',
    'Soybean (सोयाबीन)',
    'Vegetables / Horticulture (सब्जियां)',
    'Groundnut / Oilseeds (मूंगफली)',
    'Maize / Corn (मक्का)',
  ];

  const fetchAdvisory = (selectedCrop: string) => {
    setLoading(true);
    fetch('/api/advisory/agriculture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: location.name,
        lat: location.latitude,
        lon: location.longitude,
        crop: selectedCrop,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAdvisory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching agri advisory:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdvisory(crop);
  }, [location, crop]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h2
              className="text-2xl sm:text-3xl font-light text-white font-serif tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Agricultural Weather & Crop Advisory
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">
            Agro-meteorological advisories and crop risk models for <span className="text-white font-medium">{location.name}</span>
          </p>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Crop Focus:</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="bg-[#0A0A0A] text-xs font-mono text-gray-200 border border-white/15 rounded-xl px-3 py-2 focus:outline-none focus:border-white/40"
          >
            {cropsList.map((c) => (
              <option key={c} value={c} className="bg-[#0A0A0A] text-gray-200">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !advisory ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Evaluating soil moisture balance & thermal trends...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Soil Moisture Risk & Forecast Banner */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-2xl">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Soil Moisture Stress</span>
              <p className={`text-2xl font-light font-serif mt-1 ${
                advisory.soilMoistureRisk === 'Severe' ? 'text-red-400' :
                advisory.soilMoistureRisk === 'High' ? 'text-amber-400' :
                advisory.soilMoistureRisk === 'Moderate' ? 'text-yellow-300' : 'text-emerald-400'
              }`} style={{ fontFamily: "'Georgia', serif" }}>
                {advisory.soilMoistureRisk} Risk
              </p>
              <p className="text-[11px] text-gray-400 font-light mt-0.5">Based on cumulative precipitation balance</p>
            </div>

            <div className="sm:col-span-2 bg-white/[0.03] p-4 rounded-xl border border-white/10 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em] font-semibold">Agro-Meteorological Summary</span>
              <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mt-1">
                {advisory.forecastSummary}
              </p>
            </div>
          </div>

          {/* Irrigation & Spraying Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Irrigation */}
            <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-gray-300">
                <Droplets className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                  Irrigation Scheduling
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                {advisory.irrigationAdvice}
              </p>
            </div>

            {/* Spraying & Chemical Application */}
            <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-gray-300">
                <Wind className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                  Pesticide & Spraying Feasibility
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                {advisory.sprayingAdvice}
              </p>
            </div>
          </div>

          {/* Harvesting & Field Precautions */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-4 shadow-2xl">
            <h3 className="text-base font-light text-white font-serif flex items-center gap-2" style={{ fontFamily: "'Georgia', serif" }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Field Operations & Precautions</span>
            </h3>

            <div className="bg-black/50 p-4 rounded-xl border border-white/10 text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 block mb-1">Harvest & Post-Harvest Note:</span>
              {advisory.harvestingAdvice}
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-light">
              {advisory.precautions.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 mt-1.5 shrink-0"></span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 text-[10px] font-mono text-gray-500 border-t border-white/10 uppercase tracking-wider">
              Generated by WeatherGPT Agricultural Reasoning Engine • Aligned with IMD Agro-Advisory Standards.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
