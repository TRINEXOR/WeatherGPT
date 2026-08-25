import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { WeatherAlert } from '../../types';

interface AlertBannerProps {
  alerts: WeatherAlert[];
  onViewAllAlerts?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onViewAllAlerts }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const primaryAlert = alerts[0];
  const isExpanded = expandedId === primaryAlert.id;

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'emergency':
        return {
          bg: 'bg-red-950/25 border-red-500/30 text-red-200',
          iconBg: 'bg-red-500 text-white',
          title: 'text-red-300 font-serif',
          badge: 'text-red-300 bg-red-950/60 border-red-500/30',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/20 border-amber-500/30 text-amber-200',
          iconBg: 'bg-amber-400 text-black font-bold',
          title: 'text-amber-300 font-serif',
          badge: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
        };
      case 'advisory':
        return {
          bg: 'bg-yellow-950/15 border-yellow-500/30 text-yellow-200',
          iconBg: 'bg-yellow-400 text-black font-bold',
          title: 'text-yellow-300 font-serif',
          badge: 'text-yellow-300 bg-yellow-950/60 border-yellow-500/30',
        };
      default:
        return {
          bg: 'bg-white/[0.03] border-white/15 text-gray-200',
          iconBg: 'bg-white text-black',
          title: 'text-white font-serif',
          badge: 'text-gray-300 bg-white/5 border-white/15',
        };
    }
  };

  const style = getSeverityStyle(primaryAlert.severity);

  return (
    <div className={`w-full ${style.bg} border rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3.5 flex-1">
          {/* Warning Icon Badge */}
          <div className={`w-9 h-9 rounded-full ${style.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-light text-base sm:text-lg ${style.title}`} style={{ fontFamily: "'Georgia', serif" }}>
                {primaryAlert.event || primaryAlert.headline}
              </h3>
              {alerts.length > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">
                  +{alerts.length - 1} ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-light leading-relaxed">
              {primaryAlert.headline || primaryAlert.description}
            </p>
          </div>
        </div>

        {/* Right Badge & Details Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border ${style.badge}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{primaryAlert.source.includes('IMD') ? 'IMD METEOROLOGICAL' : 'OFFICIAL BULLETIN'}</span>
          </div>

          <button
            onClick={() => setExpandedId(isExpanded ? null : primaryAlert.id)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Toggle safety instruction details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Instructions & Emergency Details */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-300 space-y-2.5">
          {primaryAlert.description && (
            <div>
              <span className="text-gray-500 uppercase font-mono text-[10px] tracking-[0.2em] block mb-0.5">METEOROLOGICAL TELEMETRY:</span>
              <p className="text-gray-300 font-light leading-relaxed">{primaryAlert.description}</p>
            </div>
          )}
          {primaryAlert.instruction && (
            <div className="bg-black/40 p-3 rounded-xl border border-white/10">
              <span className="text-amber-300 uppercase font-mono text-[10px] tracking-wider flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> SAFETY PRECAUTION & PROTOCOL:
              </span>
              <p className="mt-1 text-gray-200 font-light">{primaryAlert.instruction}</p>
            </div>
          )}
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
            <span>AREA: {primaryAlert.area}</span>
            {onViewAllAlerts && (
              <button
                onClick={onViewAllAlerts}
                className="underline hover:text-white text-gray-300 uppercase tracking-wider transition-colors"
              >
                View Full Alert Matrix →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
