import React, { useState } from 'react';
import { Droplets, Wind, Droplet, Gauge, Sun, Eye, ChevronDown, ChevronUp, ShieldCheck, Share2, Check } from 'lucide-react';
import { CurrentWeather, AirQualityData } from '../../types';
import { WeatherIcon } from './WeatherIcon';
import { ShareWeatherModal } from '../modals/ShareWeatherModal';

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  airQuality?: AirQualityData | null;
  tempUnit: 'C' | 'F';
  locationName: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  airQuality,
  tempUnit,
  locationName,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);

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

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentDateStr = new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const snapshotText =
      `🌤️ Weather Report for ${locationName}\n` +
      `📅 ${currentDateStr}\n\n` +
      `🌡️ Temperature: ${displayTemp(weather.temperature)}°${tempUnit} (Feels like ${displayTemp(weather.apparentTemperature)}°${tempUnit})\n` +
      `☁️ Condition: ${weather.weatherDescription}\n` +
      `🌧️ Rain Probability: ${weather.precipitationProbability}%\n` +
      `💧 Humidity: ${weather.relativeHumidity}%\n` +
      `💨 Wind: ${displayWind(weather.windSpeed)}\n` +
      (airQuality ? `🍃 Air Quality: AQI ${airQuality.aqi} (${airQuality.status})\n` : '') +
      `☀️ UV Index: ${weather.uvIndex} / 11 | 🧭 Pressure: ${weather.surfacePressure} hPa\n\n` +
      `Live updates on WeatherGPT: ${typeof window !== 'undefined' ? window.location.href : ''}`;

    const shareData = {
      title: `Weather in ${locationName}`,
      text: snapshotText,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        setShareSuccessToast(true);
        setTimeout(() => setShareSuccessToast(false), 2500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // If native share fails or permissions error, open snapshot dialog
          setShowShareModal(true);
        }
      }
    } else {
      // Fallback to share modal with copy feature
      setShowShareModal(true);
    }
  };

  return (
    <div className="rounded-2xl p-6 sm:p-7 flex flex-col justify-between border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent shadow-2xl relative overflow-hidden transition-all hover:border-white/20">
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.3em]">
                OBSERVATION • {locationName}
              </p>
            </div>
            <div className="flex items-end gap-4 mt-3">
              <h2
                className="text-6xl sm:text-7xl font-light text-white leading-none tracking-tight font-serif"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {displayTemp(weather.temperature)}
                <span className="text-3xl sm:text-4xl opacity-50 font-light">°{tempUnit}</span>
              </h2>
              <div className="mb-1 space-y-0.5">
                <p className="text-xs sm:text-sm font-light text-gray-300">
                  Feels like {displayTemp(weather.apparentTemperature)}°
                </p>
                <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider capitalize">
                  {weather.weatherDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Snapshot Button */}
            <button
              onClick={handleShareClick}
              title="Share Weather Snapshot (Web Share API)"
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-center text-gray-300 hover:text-white transition-all shadow-sm active:scale-95 group"
            >
              {shareSuccessToast ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Weather Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner shrink-0 text-white">
              <WeatherIcon code={weather.weatherCode} isDay={weather.isDay} className="w-8 h-8 sm:w-10 sm:h-10 text-gray-200" />
            </div>
          </div>
        </div>

        {/* 3 Main Highlights (Rain Prob, Humidity, Wind) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-400">
              <Droplets className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span
              className="font-light text-2xl sm:text-3xl text-white font-serif"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {weather.precipitationProbability}
              <span className="text-sm opacity-50 font-sans">%</span>
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-[0.25em]">
              RAIN PROB
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-400">
              <Droplet className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span
              className="font-light text-2xl sm:text-3xl text-white font-serif"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {weather.relativeHumidity}
              <span className="text-sm opacity-50 font-sans">%</span>
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-[0.25em]">
              HUMIDITY
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-gray-400">
              <Wind className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <span
              className="font-light text-2xl sm:text-3xl text-white font-serif"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {weather.windSpeed}
              <span className="text-xs opacity-50 font-mono ml-0.5">KM/H</span>
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-[0.25em]">
              WIND VELOCITY
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Atmospheric Detail drawer */}
      {showMore && (
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-gray-400" />
              <span>Pressure</span>
            </div>
            <p className="font-mono text-xs font-semibold text-white mt-1">
              {weather.surfacePressure} hPa
            </p>
          </div>

          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <Sun className="w-3.5 h-3.5 text-gray-400" />
              <span>UV Index</span>
            </div>
            <p className="font-mono text-xs font-semibold text-white mt-1">
              {weather.uvIndex} / 11
            </p>
          </div>

          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span>Visibility</span>
            </div>
            <p className="font-mono text-xs font-semibold text-white mt-1">
              {weather.visibility} km
            </p>
          </div>

          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Air Quality</span>
            </div>
            <p className="font-mono text-xs font-semibold text-emerald-300 mt-1 truncate">
              {airQuality ? `AQI ${airQuality.aqi} • ${airQuality.status}` : 'AQI 65 • Mod'}
            </p>
          </div>
        </div>
      )}

      {/* Toggle Details button */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="mt-4 pt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white font-light tracking-wide transition-colors w-full border-t border-white/5"
      >
        <span>{showMore ? 'Collapse Telemetry' : 'Expand Advanced Instrumentation'}</span>
        {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Share Snapshot Modal */}
      {showShareModal && (
        <ShareWeatherModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          weather={weather}
          airQuality={airQuality}
          locationName={locationName}
          tempUnit={tempUnit}
        />
      )}
    </div>
  );
};
