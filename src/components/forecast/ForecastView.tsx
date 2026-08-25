import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
  Umbrella,
} from 'lucide-react';
import { HourlyForecastItem, DailyForecastItem } from '../../types';
import { WeatherIcon } from '../weather/WeatherIcon';

interface ForecastViewProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  tempUnit: 'C' | 'F';
  locationName: string;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  hourly,
  daily,
  tempUnit,
  locationName,
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const chartData = hourly.slice(0, 24).map((h) => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: 'numeric' }),
    temperature: displayTemp(h.temperature),
    rainProb: h.precipitationProbability,
    rainMm: h.precipitation,
    humidity: h.relativeHumidity,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-light text-white font-serif tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Meteorological Forecast
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-light mt-0.5">
            High-resolution projections for <span className="text-white font-medium">{locationName}</span>
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'hourly'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>48-Hour Hourly</span>
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Extended</span>
          </button>
        </div>
      </div>

      {activeTab === 'hourly' ? (
        <div className="space-y-6">
          {/* Temperature & Rain Chart */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-[0.2em] font-mono text-gray-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>24-Hour Temperature & Rain Probability Curve</span>
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-white"></span> Temp (°{tempUnit})
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Rain Prob (%)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#666666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="temperature" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
                  <Area type="monotone" dataKey="rainProb" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#rainGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Horizontal Scroller of Hourly Cards */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] font-mono text-gray-500 mb-3">
              Hourly Sequence (Next 48 Hours)
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
              {hourly.map((item, idx) => {
                const dateObj = new Date(item.time);
                const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const isNow = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`min-w-[130px] p-4 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                      isNow
                        ? 'bg-white/10 border-white/30 shadow-lg'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                      {isNow ? 'CURRENT' : timeStr}
                    </span>
                    <div className="my-2.5">
                      <WeatherIcon code={item.weatherCode} className="w-8 h-8 text-gray-200" />
                    </div>
                    <span
                      className="text-xl font-light text-white font-serif"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {displayTemp(item.temperature)}°
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 mt-1.5">
                      <Droplets className="w-3 h-3 text-gray-400" />
                      <span>{item.precipitationProbability}%</span>
                    </div>
                    {item.precipitation > 0 && (
                      <span className="text-[9px] text-blue-300 font-mono mt-0.5">
                        {item.precipitation} mm
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 7-Day Extended Forecast */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daily.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent hover:border-white/25 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className="text-base font-light text-white flex items-center gap-2 font-serif"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    <span>{item.dayName}</span>
                    <span className="text-xs font-mono text-gray-500 font-normal">
                      ({new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })})
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400 capitalize mt-0.5 font-light">
                    {item.weatherDescription}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <WeatherIcon code={item.weatherCode} className="w-6 h-6 text-gray-200" />
                </div>
              </div>

              {/* High / Low Bar & Rain */}
              <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">MAX / MIN</span>
                  <div className="flex items-center gap-1.5 text-sm font-light text-white font-serif mt-0.5" style={{ fontFamily: "'Georgia', serif" }}>
                    <span className="text-gray-200 flex items-center"><ArrowUp className="w-3 h-3 text-red-400" />{displayTemp(item.tempMax)}°</span>
                    <span className="text-gray-400 flex items-center"><ArrowDown className="w-3 h-3 text-blue-400" />{displayTemp(item.tempMin)}°</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">RAIN PROB</span>
                  <div className="flex items-center gap-1 text-xs font-mono text-gray-300 mt-0.5">
                    <Umbrella className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.precipitationSum} mm ({item.precipitationProbabilityMax}%)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">PEAK WIND</span>
                  <div className="flex items-center gap-1 text-xs font-mono text-gray-300 mt-0.5">
                    <Wind className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.windSpeedMax} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
