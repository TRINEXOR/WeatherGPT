import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { REGIONAL_WEATHER_STATIONS, RegionalStation } from '../../data/regionalWeatherStations';
import { WeatherLocation, CurrentWeather } from '../../types';

interface ThermalZonesLayerProps {
  currentLocation: WeatherLocation;
  currentWeather: CurrentWeather;
  tempUnit: 'C' | 'F';
  onSelectStation?: (loc: WeatherLocation) => void;
}

export const getThermalColor = (celsius: number): { hex: string; label: string; textClass: string } => {
  if (celsius < 10) return { hex: '#38bdf8', label: 'Cold', textClass: 'text-sky-300' };
  if (celsius < 20) return { hex: '#06b6d4', label: 'Cool', textClass: 'text-cyan-300' };
  if (celsius < 27) return { hex: '#10b981', label: 'Pleasant', textClass: 'text-emerald-300' };
  if (celsius < 33) return { hex: '#f59e0b', label: 'Warm', textClass: 'text-amber-300' };
  if (celsius < 38) return { hex: '#ea580c', label: 'Hot', textClass: 'text-orange-400' };
  return { hex: '#dc2626', label: 'Severe Heat', textClass: 'text-red-400' };
};

export const formatTemperature = (celsius: number, unit: 'C' | 'F'): string => {
  if (unit === 'F') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

export const ThermalZonesLayer: React.FC<ThermalZonesLayerProps> = ({
  currentLocation,
  currentWeather,
  tempUnit,
  onSelectStation,
}) => {
  // Compute regional adjusted temperatures relative to current weather delta
  const currentTemp = currentWeather.temperature;
  const stationsWithLiveTemps = REGIONAL_WEATHER_STATIONS.map((st) => {
    // If it is the current station, use the exact current reading
    const isCurrent =
      Math.abs(st.lat - currentLocation.latitude) < 0.1 &&
      Math.abs(st.lon - currentLocation.longitude) < 0.1;

    const temp = isCurrent
      ? currentTemp
      : Math.round((st.baseTemp + (currentTemp - 29) * 0.4) * 10) / 10;

    return {
      ...st,
      temp,
      isCurrent,
      colorInfo: getThermalColor(temp),
    };
  });

  return (
    <>
      {/* Interpolated Thermal Gradient Circles for Regional Zones */}
      {stationsWithLiveTemps.map((st) => (
        <Circle
          key={`zone-${st.id}`}
          center={[st.lat, st.lon]}
          radius={st.isCurrent ? 75000 : 55000}
          pathOptions={{
            color: st.colorInfo.hex,
            fillColor: st.colorInfo.hex,
            fillOpacity: st.isCurrent ? 0.35 : 0.22,
            weight: st.isCurrent ? 2 : 1,
            dashArray: st.isCurrent ? undefined : '3, 4',
          }}
        />
      ))}

      {/* Regional Temperature Badges */}
      {stationsWithLiveTemps.map((st) => {
        const markerIcon = L.divIcon({
          className: 'thermal-station-badge',
          html: `
            <div style="
              background: #0A0A0A;
              color: white;
              border: 1.5px solid ${st.colorInfo.hex};
              border-radius: 9999px;
              padding: 3px 8px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 14px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:${st.colorInfo.hex};"></span>
              <span>${st.name}</span>
              <span style="color:${st.colorInfo.hex}">${formatTemperature(st.temp, tempUnit)}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        return (
          <Marker key={`marker-${st.id}`} position={[st.lat, st.lon]} icon={markerIcon}>
            <Popup className="custom-popup">
              <div className="p-2.5 text-xs font-sans text-slate-900 min-w-[180px]">
                <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-slate-200">
                  <span className="font-bold text-sm text-slate-900">{st.name}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {st.state}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-slate-700">
                  <p className="flex justify-between">
                    <span>Temperature:</span>
                    <strong className="text-slate-900">{formatTemperature(st.temp, tempUnit)}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Thermal Status:</span>
                    <span style={{ color: st.colorInfo.hex }} className="font-semibold">
                      {st.colorInfo.label}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Elevation:</span>
                    <span>{st.elevationM} m</span>
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
                    Select Station
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
