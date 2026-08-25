import React from 'react';
import {
  X,
  Thermometer,
  Gauge,
  Droplet,
  Sun,
  Eye,
  Wind,
  ShieldCheck,
  Compass,
  Activity,
} from 'lucide-react';
import { CurrentWeather, AirQualityData } from '../../types';

interface ThermostatModalProps {
  weather: CurrentWeather;
  airQuality?: AirQualityData | null;
  locationName: string;
  tempUnit: 'C' | 'F';
  onClose: () => void;
}

export const ThermostatModal: React.FC<ThermostatModalProps> = ({
  weather,
  airQuality,
  locationName,
  tempUnit,
  onClose,
}) => {
  const displayTemp = (c: number) => (tempUnit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-light text-base text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Atmospheric Instrumentation
              </h3>
              <p className="text-xs text-gray-400 font-light">{locationName} Meteorological Station</p>
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
        <div className="p-6 space-y-6">
          {/* Main Thermometer Gauge */}
          <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-2xl">
            <div>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Ambient Reading</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                  {displayTemp(weather.temperature)}°{tempUnit}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  (Feels {displayTemp(weather.apparentTemperature)}°)
                </span>
              </div>
              <p className="text-xs text-gray-400 capitalize mt-1 font-light">
                {weather.weatherDescription}
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Dew Point</span>
              <p className="text-xl font-light text-white font-serif mt-1" style={{ fontFamily: "'Georgia', serif" }}>
                {displayTemp(weather.temperature - ((100 - weather.relativeHumidity) / 5))}°{tempUnit}
              </p>
              <span className="text-[10px] font-mono text-emerald-400">Stable Boundary</span>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Droplet className="w-3.5 h-3.5 text-gray-400" />
                <span>Humidity</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>{weather.relativeHumidity}%</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                <span>Pressure</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>{weather.surfacePressure} <span className="text-[10px] font-mono text-gray-400 font-normal">hPa</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Wind className="w-3.5 h-3.5 text-gray-400" />
                <span>Wind Velocity</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                {weather.windSpeed} <span className="text-[10px] font-mono text-gray-400 font-normal">km/h</span>
              </p>
              <span className="text-[10px] font-mono text-gray-500">Gusts: {weather.windGusts} km/h</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>UV Index</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>{weather.uvIndex} <span className="text-[10px] font-mono text-gray-400 font-normal">/ 11</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-gray-400" />
                <span>Visibility</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>{weather.visibility} <span className="text-[10px] font-mono text-gray-400 font-normal">km</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[10px] font-mono uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-gray-400" />
                <span>Cloud Cover</span>
              </div>
              <p className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>{weather.cloudCover}%</p>
            </div>
          </div>

          {/* Air Quality Index Breakdown */}
          {airQuality && (
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gray-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Air Quality Index (AQI)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AQI {airQuality.aqi} • {airQuality.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center font-mono text-xs">
                <div>
                  <span className="text-[10px] text-gray-500">PM2.5</span>
                  <p className="font-semibold text-white">{airQuality.pm2_5} <span className="text-[9px] text-gray-500">µg</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">PM10</span>
                  <p className="font-semibold text-white">{airQuality.pm10} <span className="text-[9px] text-gray-500">µg</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">NO2</span>
                  <p className="font-semibold text-white">{airQuality.no2} <span className="text-[9px] text-gray-500">ppb</span></p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">Ozone</span>
                  <p className="font-semibold text-white">{airQuality.ozone} <span className="text-[9px] text-gray-500">ppb</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
