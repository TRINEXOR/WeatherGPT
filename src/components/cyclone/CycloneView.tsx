import React, { useState, useEffect } from 'react';
import {
  Wind,
  AlertTriangle,
  Compass,
  Gauge,
  MapPin,
  Clock,
  Radio,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { CycloneInfo } from '../../types';

export const CycloneView: React.FC = () => {
  const [cyclones, setCyclones] = useState<CycloneInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cyclones')
      .then((res) => res.json())
      .then((data) => {
        setCyclones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch cyclone info:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#7bd0ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-gray-400" />
          <h2
            className="text-2xl sm:text-3xl font-light text-white font-serif tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Tropical Cyclone & Depression Monitor
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">
          Active cyclonic disturbances, sea surface vortex tracking, and gale warnings across oceanic sectors.
        </p>
      </div>

      {cyclones.map((cyc) => (
        <div
          key={cyc.id}
          className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-6 shadow-2xl"
        >
          {/* Top Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-red-950/40 text-red-300 border border-red-500/30 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                  {cyc.status.toUpperCase()}
                </span>
                <h3 className="text-xl font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                  {cyc.name}
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-light mt-1">{cyc.basin}</p>
            </div>

            <div className="text-[10px] font-mono text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 self-start sm:self-center uppercase tracking-wider">
              Source: {cyc.source}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <Wind className="w-3.5 h-3.5 text-gray-400" />
                <span>Max Sustained Wind</span>
              </div>
              <p className="text-2xl font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
                {cyc.maxWindSpeedKmh} <span className="text-xs font-mono opacity-50 font-normal">km/h</span>
              </p>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                Gusts: {cyc.maxWindSpeedKmh + 15} km/h
              </p>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                <span>Central Pressure</span>
              </div>
              <p className="text-2xl font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
                {cyc.centralPressureHpa} <span className="text-xs font-mono opacity-50 font-normal">hPa</span>
              </p>
              <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                Deep oceanic vortex
              </p>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-gray-400" />
                <span>Current Trajectory</span>
              </div>
              <p className="text-base font-light text-white font-serif mt-2" style={{ fontFamily: "'Georgia', serif" }}>
                {cyc.movementDirection}
              </p>
              <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                Speed: {cyc.movementSpeedKmh} km/h
              </p>
            </div>

            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Vortex Coordinates</span>
              </div>
              <p className="text-base font-light text-white font-mono mt-2">
                {cyc.currentLat}°N, {cyc.currentLon}°E
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                Marine Sector
              </p>
            </div>
          </div>

          {/* Affected Areas & Safety Advisory */}
          <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2">
            <h4 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Coastal Alert & Marine Directives:
            </h4>
            <p className="text-xs text-gray-300 font-light leading-relaxed">
              Mariners and coastal operators are advised to suspend deep-water operations in <span className="text-white font-medium">{cyc.basin}</span>. Squally conditions with wind speeds reaching {cyc.maxWindSpeedKmh} km/h and elevated swells expected.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 self-center">Coastal Sectors:</span>
              {cyc.affectedAreas.map((area, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded-full text-[11px] font-mono">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Track Progression Timeline */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Projected Track Progression Sequence
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 pb-2 text-[10px] uppercase tracking-wider">
                    <th className="py-2 font-normal">Time (UTC)</th>
                    <th className="py-2 font-normal">Coordinates</th>
                    <th className="py-2 font-normal">Intensity Stage</th>
                    <th className="py-2 font-normal">Est. Wind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {cyc.track.map((pt, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-gray-400">{pt.time}</td>
                      <td className="py-2.5">{pt.lat}°N, {pt.lon}°E</td>
                      <td className="py-2.5 font-sans font-light text-white">{pt.stage}</td>
                      <td className="py-2.5 text-amber-300 font-mono">{pt.windSpeedKmh} km/h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
