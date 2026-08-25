import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  CloudRain,
  Thermometer,
  TrendingUp,
  Award,
  Loader2,
  FileDown,
} from 'lucide-react';
import { ClimateTrend, WeatherLocation } from '../../types';

interface ClimateViewProps {
  location: WeatherLocation;
}

export const ClimateView: React.FC<ClimateViewProps> = ({ location }) => {
  const [climateData, setClimateData] = useState<ClimateTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/climate/trends?lat=${location.latitude}&lon=${location.longitude}&name=${encodeURIComponent(location.name)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Historical climate data temporarily unavailable');
        return res.json();
      })
      .then((data) => {
        setClimateData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching climate data:', err);
        setError(err.message || 'Failed to load climate statistics');
        setLoading(false);
      });
  }, [location]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <Loader2 className="w-8 h-8 text-[#7bd0ff] animate-spin" />
        <p className="text-sm font-mono text-[#c6c6cd]">Calculating 10-year meteorological archive reanalysis...</p>
      </div>
    );
  }

  if (error || !climateData) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-red-500/30 text-center text-sm text-red-300">
        <p>{error || 'Unable to retrieve historical climate records.'}</p>
      </div>
    );
  }

  const exportCSV = () => {
    const headers = 'Year,Total Rainfall (mm),Average Max Temp (°C),Average Min Temp (°C),Rainfall Anomaly (%)\n';
    const rows = climateData.annualData
      .map((d) => `${d.year},${d.totalRainfallMm},${d.avgTempMaxC},${d.avgTempMinC},${d.anomalyPercent}%`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Climate_Records_${location.name}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h2
              className="text-2xl sm:text-3xl font-light text-white font-serif tracking-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              10-Year Climate Analysis & Trends
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">
            Historical precipitation reanalysis & thermal trends for <span className="text-white font-medium">{location.name}</span> ({climateData.period})
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-gray-300 rounded-xl transition-all self-start sm:self-center uppercase tracking-wider"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export Reanalysis CSV</span>
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500">
            <CloudRain className="w-3.5 h-3.5 text-gray-400" />
            <span>10-Year Mean Rainfall</span>
          </div>
          <p className="text-3xl font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
            {climateData.averageRainfallMm} <span className="text-xs font-mono text-gray-400 opacity-60 font-normal">mm / yr</span>
          </p>
          <p className="text-xs text-gray-400 font-light mt-1">Climatological baseline normal</p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wettest Year Recorded</span>
          </div>
          <p className="text-3xl font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
            {climateData.wettestYear.year}
          </p>
          <p className="text-xs text-emerald-400/90 mt-1 font-mono">
            {climateData.wettestYear.rainfall} mm total precipitation
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-500">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span>Hottest Thermal Peak</span>
          </div>
          <p className="text-3xl font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
            {climateData.hottestYear.year}
          </p>
          <p className="text-xs text-amber-300/90 mt-1 font-mono">
            Annual Mean Max: {climateData.hottestYear.temp}°C
          </p>
        </div>
      </div>

      {/* 10-Year Annual Rainfall Bar Chart */}
      <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-light text-white font-serif flex items-center gap-2" style={{ fontFamily: "'Georgia', serif" }}>
            <CloudRain className="w-4 h-4 text-gray-400" />
            <span>Annual Total Rainfall (mm) by Year</span>
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Baseline: {climateData.averageRainfallMm} mm</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={climateData.annualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="year" stroke="#71717a" fontSize={10} fontStyle="italic" tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any) => [`${val} mm`, 'Rainfall']}
              />
              <Bar dataKey="totalRainfallMm" fill="#ffffff" opacity={0.85} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature Trend Line Chart */}
      <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-light text-white font-serif flex items-center gap-2" style={{ fontFamily: "'Georgia', serif" }}>
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span>10-Year Average Max & Min Temperatures (°C)</span>
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider">
            <span className="text-amber-300">• Mean Max</span>
            <span className="text-sky-300">• Mean Min</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={climateData.annualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              />
              <Line type="monotone" dataKey="avgTempMaxC" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Mean Max °C" />
              <Line type="monotone" dataKey="avgTempMinC" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Mean Min °C" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-2 shadow-2xl">
        <h4 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          Climatological Synthesis:
        </h4>
        <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
          {climateData.trendSummary}
        </p>
      </div>
    </div>
  );
};
