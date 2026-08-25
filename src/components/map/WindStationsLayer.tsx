import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { REGIONAL_WEATHER_STATIONS } from '../../data/regionalWeatherStations';
import { WeatherLocation, CurrentWeather } from '../../types';

interface WindStationsLayerProps {
  currentLocation: WeatherLocation;
  currentWeather: CurrentWeather;
  onSelectStation?: (loc: WeatherLocation) => void;
}

export const getWindSpeedColor = (kmh: number): string => {
  if (kmh > 50) return '#ef4444'; // Red (Gale)
  if (kmh > 35) return '#f59e0b'; // Amber (Strong)
  if (kmh > 20) return '#38bdf8'; // Cyan (Moderate)
  return '#34d399'; // Emerald (Gentle)
};

export const WindStationsLayer: React.FC<WindStationsLayerProps> = ({
  currentLocation,
  currentWeather,
  onSelectStation,
}) => {
  const currentSpeed = currentWeather.windSpeed;
  const currentDir = currentWeather.windDirection || 240;

  const stationsWithWind = REGIONAL_WEATHER_STATIONS.map((st) => {
    const isCurrent =
      Math.abs(st.lat - currentLocation.latitude) < 0.1 &&
      Math.abs(st.lon - currentLocation.longitude) < 0.1;

    const speed = isCurrent ? currentSpeed : Math.round(st.baseWindSpeed + (currentSpeed - 15) * 0.3);
    const dir = isCurrent ? currentDir : st.baseWindDir;

    return {
      ...st,
      speed,
      dir,
      isCurrent,
      color: getWindSpeedColor(speed),
    };
  });

  return (
    <>
      {stationsWithWind.map((st) => {
        // Arrow points in direction wind is blowing towards (dir + 180 or dir)
        const arrowRotation = st.dir;

        const markerIcon = L.divIcon({
          className: 'wind-station-badge',
          html: `
            <div style="
              background: #0A0A0A;
              color: white;
              border: 1.5px solid ${st.color};
              border-radius: 9999px;
              padding: 3px 7px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 10.5px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <span style="
                display: inline-block;
                transform: rotate(${arrowRotation}deg);
                font-size: 11px;
                color: ${st.color};
                line-height: 1;
              ">↑</span>
              <span>${st.name}</span>
              <span style="color: ${st.color}">${st.speed} <span style="font-size:9px; font-weight:normal; opacity:0.8;">km/h</span></span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        return (
          <Marker key={`wind-${st.id}`} position={[st.lat, st.lon]} icon={markerIcon}>
            <Popup className="custom-popup">
              <div className="p-2.5 text-xs font-sans text-slate-900 min-w-[180px]">
                <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-slate-200">
                  <span className="font-bold text-sm text-slate-900">{st.name} Wind Telemetry</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {st.state}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-slate-700">
                  <p className="flex justify-between">
                    <span>Sustained Velocity:</span>
                    <strong className="text-slate-900">{st.speed} km/h</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Wind Direction:</span>
                    <span className="text-slate-900">{st.dir}°</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Classification:</span>
                    <span style={{ color: st.color }} className="font-semibold">
                      {st.speed > 50 ? 'Gale / High' : st.speed > 35 ? 'Strong Breeze' : st.speed > 20 ? 'Moderate' : 'Light Air'}
                    </span>
                  </p>
                </div>
                {onSelectStation && !st.isCurrent && (
                  <button
                    onClick={() => {
                      onSelectStation({
                        name: st.name,
                        country: 'India',
                        latitude: st.lat,
                        longitude: st.lon,
                        admin1: st.state,
                      });
                    }}
                    className="mt-2.5 w-full py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-medium transition-colors"
                  >
                    Center on Station
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
