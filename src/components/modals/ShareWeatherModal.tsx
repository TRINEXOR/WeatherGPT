import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Droplets,
  Wind,
  Droplet,
  Sun,
  ShieldCheck,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CurrentWeather, AirQualityData } from '../../types';
import { WeatherIcon } from '../weather/WeatherIcon';

interface ShareWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather;
  airQuality?: AirQualityData | null;
  locationName: string;
  tempUnit: 'C' | 'F';
}

export const ShareWeatherModal: React.FC<ShareWeatherModalProps> = ({
  isOpen,
  onClose,
  weather,
  airQuality,
  locationName,
  tempUnit,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const displayWind = (kmh: number) => {
    if (tempUnit === 'F') {
      return `${Math.round(kmh * 0.621371)} mph`;
    }
    return `${kmh} km/h`;
  };

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currentTimeStr = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateSnapshotText = () => {
    return (
      `🌤️ Weather Report for ${locationName}\n` +
      `📅 ${currentDateStr} • ${currentTimeStr}\n\n` +
      `🌡️ Temperature: ${displayTemp(weather.temperature)}°${tempUnit} (Feels like ${displayTemp(weather.apparentTemperature)}°${tempUnit})\n` +
      `☁️ Condition: ${weather.weatherDescription}\n` +
      `🌧️ Rain Probability: ${weather.precipitationProbability}%\n` +
      `💧 Humidity: ${weather.relativeHumidity}%\n` +
      `💨 Wind: ${displayWind(weather.windSpeed)}\n` +
      (airQuality ? `🍃 Air Quality: AQI ${airQuality.aqi} (${airQuality.status})\n` : '') +
      `☀️ UV Index: ${weather.uvIndex} / 11\n` +
      `🧭 Pressure: ${weather.surfacePressure} hPa\n\n` +
      `Live updates on WeatherGPT: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
  };

  const handleNativeShare = async () => {
    const text = generateSnapshotText();
    const shareData = {
      title: `Weather in ${locationName}`,
      text: text,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        setShareSuccess('Shared successfully!');
        setTimeout(() => setShareSuccess(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      const text = generateSnapshotText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShareSuccess('Snapshot copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShareSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Share Weather Snapshot
              </h2>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                Web Share API & Instant Clipboard Export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Preview Card */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {shareSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-mono">
              <Check className="w-4 h-4" />
              <span>{shareSuccess}</span>
            </div>
          )}

          {/* Visual Snapshot Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 shadow-xl relative overflow-hidden">
            {/* Location & Time */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-white text-sm">{locationName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDateStr}</span>
              </div>
            </div>

            {/* Temperature & Icon */}
            <div className="flex items-center justify-between my-5">
              <div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-5xl font-light text-white font-serif"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {displayTemp(weather.temperature)}
                  </span>
                  <span className="text-2xl font-light text-gray-400">°{tempUnit}</span>
                </div>
                <p className="text-xs font-light text-gray-300 mt-1 capitalize">
                  {weather.weatherDescription} • Feels like {displayTemp(weather.apparentTemperature)}°{tempUnit}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center">
                <WeatherIcon code={weather.weatherCode} isDay={weather.isDay} className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-center">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">Rain Prob</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {weather.precipitationProbability}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">Humidity</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {weather.relativeHumidity}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">Wind</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {displayWind(weather.windSpeed)}
                </span>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-gray-400 px-1">
              <span>UV: {weather.uvIndex}/11</span>
              <span>Pressure: {weather.surfacePressure} hPa</span>
              {airQuality && <span className="text-emerald-400">AQI: {airQuality.aqi} ({airQuality.status})</span>}
            </div>

            {/* Branding Footer inside Card */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <span>WeatherGPT Meteorological Report</span>
              <span>Live Observation</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleNativeShare}
              className="px-4 py-3 rounded-xl bg-white hover:bg-gray-200 text-[#0A0A0A] font-medium text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Native Share Dialog</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text Snapshot'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
