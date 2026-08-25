import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { WeatherAlert, AlertSeverity } from '../../types';

interface AlertsViewProps {
  alerts: WeatherAlert[];
  locationName: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, locationName }) => {
  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'emergency':
        return {
          bg: 'bg-red-950/40 text-red-200 border-red-500/40',
          dot: 'bg-red-500',
          label: 'RED ALERT • EMERGENCY DIRECTIVE',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/30 text-amber-200 border-amber-500/40',
          dot: 'bg-amber-400',
          label: 'ORANGE ALERT • WARNING PROTOCOL',
        };
      case 'advisory':
        return {
          bg: 'bg-yellow-950/20 text-yellow-200 border-yellow-500/30',
          dot: 'bg-yellow-400',
          label: 'YELLOW ALERT • WATCH ADVISORY',
        };
      default:
        return {
          bg: 'bg-white/5 text-gray-300 border-white/15',
          dot: 'bg-white',
          label: 'GREEN • ROUTINE OBSERVATION',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
          <h2
            className="text-2xl sm:text-3xl font-light text-white font-serif tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Official Warning Matrix
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 font-light mt-1">
          Real-time severe alerts and emergency directives for <span className="text-white font-medium">{locationName}</span> and adjacent sectors.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent text-center space-y-3 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
            No Critical Severe Alerts Active
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto font-light leading-relaxed">
            Standard atmospheric parameters are currently within normal thresholds for {locationName}. No emergency warnings or red-level weather hazards are in effect.
          </p>
          <div className="pt-2 text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
            Monitoring Source: IMD & WMO Standard Global Meteorological Criteria
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alt) => {
            const badge = getSeverityBadge(alt.severity);
            return (
              <div
                key={alt.id}
                className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent space-y-4 shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-medium border flex items-center gap-1.5 uppercase tracking-wider ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-ping`} />
                      {badge.label}
                    </span>
                    <h3 className="text-base sm:text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                      {alt.event}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>{alt.source}</span>
                  </div>
                </div>

                {/* Headline & Description */}
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-200 font-sans">
                    {alt.headline}
                  </p>
                  <p className="text-xs text-gray-400 font-light leading-relaxed">
                    {alt.description}
                  </p>
                </div>

                {/* Actionable Instructions */}
                {alt.instruction && (
                  <div className="bg-black/60 p-4 rounded-xl border border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                      Immediate Safety Directives:
                    </span>
                    <p className="text-xs text-gray-300 font-light leading-relaxed">
                      {alt.instruction}
                    </p>
                  </div>
                )}

                {/* Metadata tags */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-gray-500 pt-2 border-t border-white/10 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Sector: {alt.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Valid Until: {new Date(alt.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Color Legend */}
      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
        <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500 mb-3 font-medium">
          Alert Classification Scale (IMD Standard)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="font-mono text-xs text-emerald-400 block mb-1 uppercase tracking-wider">Green (No Warning)</span>
            <p className="text-gray-400 text-[11px] font-light leading-relaxed">No adverse weather expected. Normal day-to-day operations can continue.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="font-mono text-xs text-yellow-400 block mb-1 uppercase tracking-wider">Yellow (Be Updated)</span>
            <p className="text-gray-400 text-[11px] font-light leading-relaxed">Severe weather possible. Stay aware of local meteorological developments.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="font-mono text-xs text-amber-400 block mb-1 uppercase tracking-wider">Orange (Be Prepared)</span>
            <p className="text-gray-400 text-[11px] font-light leading-relaxed">Very heavy rainfall or strong winds. Plan precautions against disruption.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="font-mono text-xs text-red-400 block mb-1 uppercase tracking-wider">Red (Take Action)</span>
            <p className="text-gray-400 text-[11px] font-light leading-relaxed">Extreme weather hazards imminent. Immediate safety precautions mandatory.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
