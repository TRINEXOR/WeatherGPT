import React from 'react';
import {
  X,
  Settings,
  Languages,
  Thermometer,
  ShieldCheck,
  Check,
  Globe,
  Radio,
} from 'lucide-react';
import { UserPreferences, LanguageOption } from '../../types';

interface SettingsModalProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  const languages: { code: LanguageOption; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-light text-base text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Preferences & System Settings
              </h3>
              <p className="text-xs text-gray-400 font-light">Multilingual reasoning and telemetry units</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Multilingual Selection */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-300 mb-3 font-medium">
              <Languages className="w-3.5 h-3.5 text-gray-400" />
              <span>AI Response Language (11 Regional Indian Languages)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((lang) => {
                const isSelected = preferences.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onUpdatePreferences({ language: lang.code })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-white text-black border-white font-semibold shadow-md'
                        : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{lang.native}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-gray-400'}`}>
                        {lang.label}
                      </p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Settings */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-300 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-gray-400" />
              <span>Measurement Units</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-xs font-medium text-gray-200">Temperature Scale</p>
                <p className="text-[11px] text-gray-400 font-light">Select preferred thermal metric</p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => onUpdatePreferences({ tempUnit: 'C' })}
                  className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all ${
                    preferences.tempUnit === 'C'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  °C (Celsius)
                </button>
                <button
                  onClick={() => onUpdatePreferences({ tempUnit: 'F' })}
                  className={`px-3 py-1 text-[11px] font-mono rounded-md transition-all ${
                    preferences.tempUnit === 'F'
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  °F (Fahrenheit)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-xs font-medium text-gray-200">Wind Velocity Unit</p>
                <p className="text-[11px] text-gray-400 font-light">Speed measurement scale</p>
              </div>
              <select
                value={preferences.windSpeedUnit}
                onChange={(e) => onUpdatePreferences({ windSpeedUnit: e.target.value as any })}
                className="bg-[#0A0A0A] text-xs font-mono text-gray-200 px-3 py-1.5 rounded-lg border border-white/15 focus:outline-none"
              >
                <option value="kmh">km/h (Kilometers/hr)</option>
                <option value="mph">mph (Miles/hr)</option>
                <option value="ms">m/s (Meters/sec)</option>
                <option value="knots">knots (Nautical)</option>
              </select>
            </div>
          </div>

          {/* Meteorological Data Verification Transparency */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-gray-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Scientific Data & AI Safety Transparency</span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              WeatherGPT utilizes Gemini generative AI grounded exclusively in high-precision telemetry and Open-Meteo European Centre for Medium-Range Weather Forecasts (ECMWF) and IMD bulletins. Weather hallucinations are blocked through server-side tool orchestration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
