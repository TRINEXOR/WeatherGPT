import React from 'react';
import { X, ShieldCheck, Database, Lock, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-light text-base text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Data Infrastructure & Privacy
              </h3>
              <p className="text-xs text-gray-400 font-light">Meteorological telemetry & privacy commitments</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm text-gray-300">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-mono uppercase tracking-wider text-[11px] font-medium">
              <Database className="w-3.5 h-3.5 text-gray-400" />
              <span>Scientific Data Providers</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Real-time atmospheric models, radar scans, air quality metrics, and 10-year historical reanalyses are provided via Open-Meteo, ECMWF IFS/ERA5, NOAA, and IMD standard meteorological thresholds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono uppercase tracking-wider text-[11px] font-medium">
              <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy & Geolocation Handling</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              When you enable GPS location, coordinates are queried strictly for local meteorological calculations and are never logged, tracked, or shared with third-party advertisers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-mono uppercase tracking-wider text-[11px] font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Security & Grounding Protocol</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              All Gemini generative AI interactions run through server-side function calling with strict meteorological guards to prevent fabricated forecasts or ungrounded weather advisories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
