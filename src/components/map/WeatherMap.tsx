import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  CloudRain,
  Thermometer,
  Wind,
  Cloud,
  Radio,
  Crosshair,
  RefreshCw,
  Info,
  Layers,
} from 'lucide-react';
import { CurrentWeather, WeatherLocation, CycloneInfo } from '../../types';
import { WindStreamCanvas } from './WindStreamCanvas';
import { ThermalZonesLayer, formatTemperature } from './ThermalZonesLayer';
import { WindStationsLayer } from './WindStationsLayer';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Dynamic Re-center controller
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 7);
  }, [coords, map]);
  return null;
}

interface WeatherMapProps {
  location: WeatherLocation;
  currentWeather: CurrentWeather;
  cyclones?: CycloneInfo[];
  tempUnit: 'C' | 'F';
  onSelectLocation?: (loc: WeatherLocation) => void;
}

export type MapLayerType = 'rain' | 'temp' | 'wind' | 'clouds';

export const WeatherMap: React.FC<WeatherMapProps> = ({
  location,
  currentWeather,
  cyclones = [],
  tempUnit,
  onSelectLocation,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('rain');
  const [radarTimestamp, setRadarTimestamp] = useState<number | null>(null);
  const [satelliteTimestamp, setSatelliteTimestamp] = useState<number | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  // Fetch verified RainViewer timestamps from backend proxy
  const fetchMapTimestamps = async () => {
    setIsLoadingMetadata(true);
    try {
      const res = await fetch('/api/weather/radar-maps');
      if (res.ok) {
        const data = await res.json();
        if (data.radar?.past && data.radar.past.length > 0) {
          const latestRadar = data.radar.past[data.radar.past.length - 1];
          setRadarTimestamp(latestRadar.time);
        }
        if (data.satellite?.infrared && data.satellite.infrared.length > 0) {
          const latestSat = data.satellite.infrared[data.satellite.infrared.length - 1];
          setSatelliteTimestamp(latestSat.time);
        }
      }
    } catch (err) {
      console.warn('Fallback timestamp generator in use:', err);
      const nowSec = Math.floor(Date.now() / 1000);
      const rounded = Math.floor(nowSec / 600) * 600;
      setRadarTimestamp(rounded);
      setSatelliteTimestamp(rounded);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  useEffect(() => {
    fetchMapTimestamps();
  }, []);

  const position: [number, number] = [location.latitude, location.longitude];

  // Custom active station pin
  const customMarkerIcon = L.divIcon({
    className: 'custom-weather-marker',
    html: `
      <div style="
        background: #0A0A0A;
        color: #ffffff;
        font-weight: 700;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11.5px;
        border-radius: 9999px;
        padding: 4px 10px;
        border: 2px solid #10b981;
        box-shadow: 0 4px 16px rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        <span style="width: 7px; height: 7px; border-radius: 9999px; background: #10b981; display: inline-block;"></span>
        <span>${location.name}: ${formatTemperature(currentWeather.temperature, tempUnit)}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2
            className="text-2xl font-light text-white font-serif tracking-tight flex items-center gap-2.5"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
            <span>Doppler Radar & Geospatial Telemetry</span>
          </h2>
          <p className="text-xs text-gray-400 font-light mt-0.5">
            Active Multi-Spectral Atmospheric Observation centered on{' '}
            <span className="text-white font-medium">{location.name}</span>
          </p>
        </div>

        {/* Layer Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/10 shadow-sm">
          {/* 1. Doppler Radar */}
          <button
            onClick={() => setActiveLayer('rain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeLayer === 'rain'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Doppler Radar</span>
          </button>

          {/* 2. Thermal Zones */}
          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeLayer === 'temp'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Thermal Zones</span>
          </button>

          {/* 3. Wind Stream */}
          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeLayer === 'wind'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Stream</span>
          </button>

          {/* 4. Satellite IR */}
          <button
            onClick={() => setActiveLayer('clouds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeLayer === 'clouds'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Satellite IR</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="w-full h-[540px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#0A0A0A]">
        {/* Top Info Banner Overlay */}
        <div className="absolute top-3 left-3 z-[1000] bg-[#0A0A0A]/90 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-xl pointer-events-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] text-gray-300">
            {activeLayer === 'rain' && (
              <>
                <strong className="text-white">Rainfall Scan:</strong> {currentWeather.precipitationProbability}% prob • {currentWeather.weatherDescription}
              </>
            )}
            {activeLayer === 'temp' && (
              <>
                <strong className="text-white">Thermal Grid:</strong> {formatTemperature(currentWeather.temperature, tempUnit)} (Feels {formatTemperature(currentWeather.apparentTemperature, tempUnit)})
              </>
            )}
            {activeLayer === 'wind' && (
              <>
                <strong className="text-white">Wind Stream:</strong> {currentWeather.windSpeed} km/h • Gusts {currentWeather.windGusts} km/h • {currentWeather.windDirection || 240}°
              </>
            )}
            {activeLayer === 'clouds' && (
              <>
                <strong className="text-white">Satellite IR:</strong> Multi-spectral Cloud Cover & IR Thermal Shading
              </>
            )}
          </span>
          <button
            onClick={fetchMapTimestamps}
            title="Refresh Scan Timestamps"
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingMetadata ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <MapContainer
          center={position}
          zoom={7}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#0A0A0A' }}
        >
          <ChangeMapView coords={position} />

          {/* CartoDB Dark Matter Base Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* LAYER 1: DOPPLER RADAR */}
          {activeLayer === 'rain' && (
            <>
              {/* RainViewer Doppler Radar TileLayer */}
              {radarTimestamp && (
                <TileLayer
                  attribution='&copy; <a href="https://www.rainviewer.com">RainViewer Doppler Radar</a>'
                  url={`https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
                  opacity={0.85}
                  maxNativeZoom={7}
                  maxZoom={18}
                />
              )}

              {/* Doppler Radar Range Rings & Station Scan Indicator */}
              <Circle
                center={position}
                radius={50000} // 50 km
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.05,
                  weight: 1,
                  dashArray: '4, 4',
                }}
              />
              <Circle
                center={position}
                radius={120000} // 120 km
                pathOptions={{
                  color: '#06b6d4',
                  fillOpacity: 0.02,
                  weight: 1,
                  dashArray: '6, 6',
                }}
              />
              <Circle
                center={position}
                radius={220000} // 220 km
                pathOptions={{
                  color: '#3b82f6',
                  fillOpacity: 0.01,
                  weight: 0.8,
                  dashArray: '8, 8',
                }}
              />

              {/* High Precipitation Detection Area if rain prob elevated */}
              {currentWeather.precipitationProbability >= 40 && (
                <Circle
                  center={position}
                  radius={35000}
                  pathOptions={{
                    color: '#38bdf8',
                    fillColor: '#0284c7',
                    fillOpacity: 0.28,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <p className="font-bold text-sky-600">Elevated Precipitation Zone</p>
                      <p className="font-mono">Probability: {currentWeather.precipitationProbability}%</p>
                      <p className="font-mono">Humidity: {currentWeather.relativeHumidity}%</p>
                    </div>
                  </Popup>
                </Circle>
              )}
            </>
          )}

          {/* LAYER 2: THERMAL ZONES */}
          {activeLayer === 'temp' && (
            <ThermalZonesLayer
              currentLocation={location}
              currentWeather={currentWeather}
              tempUnit={tempUnit}
              onSelectStation={onSelectLocation}
            />
          )}

          {/* LAYER 3: WIND STREAM */}
          {activeLayer === 'wind' && (
            <>
              {/* Dynamic HTML5 Canvas Wind Streamline Overlay */}
              <WindStreamCanvas
                windSpeedKmh={currentWeather.windSpeed}
                windDirectionDeg={currentWeather.windDirection || 240}
                opacity={0.88}
              />
              {/* Regional Wind Telemetry Stations */}
              <WindStationsLayer
                currentLocation={location}
                currentWeather={currentWeather}
                onSelectStation={onSelectLocation}
              />
            </>
          )}

          {/* LAYER 4: SATELLITE IR */}
          {activeLayer === 'clouds' && (
            <>
              {satelliteTimestamp && (
                <TileLayer
                  attribution='&copy; <a href="https://www.rainviewer.com">RainViewer Satellite IR</a>'
                  url={`https://tilecache.rainviewer.com/v2/satellite/${satelliteTimestamp}/256/{z}/{x}/{y}/0/0_0.png`}
                  opacity={0.75}
                  maxNativeZoom={6}
                  maxZoom={18}
                />
              )}
              {/* Cloud Density Rings around target location */}
              <Circle
                center={position}
                radius={80000}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#cbd5e1',
                  fillOpacity: 0.15,
                  weight: 1,
                  dashArray: '2, 4',
                }}
              />
            </>
          )}

          {/* Active Station Pin (Shown on standard, rain, clouds) */}
          {activeLayer !== 'temp' && activeLayer !== 'wind' && (
            <Marker position={position} icon={customMarkerIcon}>
              <Popup className="custom-popup">
                <div className="p-2 text-xs font-sans text-slate-900 min-w-[170px]">
                  <p className="font-bold text-sm text-slate-900">{location.name}</p>
                  <p className="text-slate-600 capitalize">{currentWeather.weatherDescription}</p>
                  <div className="mt-1.5 font-mono text-slate-800 space-y-0.5 border-t pt-1 border-slate-200">
                    <p>Temp: {formatTemperature(currentWeather.temperature, tempUnit)} (Feels {formatTemperature(currentWeather.apparentTemperature, tempUnit)})</p>
                    <p>Rain Probability: {currentWeather.precipitationProbability}%</p>
                    <p>Wind Speed: {currentWeather.windSpeed} km/h</p>
                    <p>Relative Humidity: {currentWeather.relativeHumidity}%</p>
                    <p>Pressure: {currentWeather.surfacePressure} hPa</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Tropical Cyclones Tracks on Map */}
          {cyclones.map((cyc) => {
            const trackPoints: [number, number][] = cyc.track.map((t) => [t.lat, t.lon]);
            const currentPos: [number, number] = [cyc.currentLat, cyc.currentLon];

            return (
              <React.Fragment key={cyc.id}>
                <Polyline
                  positions={trackPoints}
                  pathOptions={{ color: '#ef4444', weight: 2.5, dashArray: '6, 6' }}
                />
                <Circle
                  center={currentPos}
                  radius={50000}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#991b1b',
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <p className="font-bold text-red-600">{cyc.name}</p>
                      <p className="text-slate-700">{cyc.intensity}</p>
                      <p className="font-mono">Max Wind: {cyc.maxWindSpeedKmh} km/h</p>
                      <p className="font-mono">Pressure: {cyc.centralPressureHpa} hPa</p>
                      <p className="font-mono">Motion: {cyc.movementDirection} @ {cyc.movementSpeedKmh} km/h</p>
                    </div>
                  </Popup>
                </Circle>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Dynamic Context Legend Overlay (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 bg-[#0A0A0A]/95 backdrop-blur-md border border-white/15 p-3 rounded-xl z-[1000] text-xs shadow-2xl pointer-events-auto min-w-[200px]">
          {activeLayer === 'rain' && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-[0.2em]">
                Radar Reflectivity (dBZ)
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
                <span className="w-3.5 h-2 rounded-sm bg-sky-400"></span> 15 (Light)
                <span className="w-3.5 h-2 rounded-sm bg-blue-500"></span> 30
                <span className="w-3.5 h-2 rounded-sm bg-amber-400"></span> 45
                <span className="w-3.5 h-2 rounded-sm bg-red-600"></span> 60+ (Severe)
              </div>
            </div>
          )}

          {activeLayer === 'temp' && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-[0.2em]">
                Thermal Zones Scale
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-gray-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#38bdf8]"></span> &lt;10°C (Cold)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#06b6d4]"></span> 10-20°C (Cool)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#10b981]"></span> 20-27°C (Mild)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#f59e0b]"></span> 28-34°C (Warm)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#ea580c]"></span> 35-39°C (Hot)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 rounded-sm bg-[#dc2626]"></span> 40°C+ (Extreme)
                </div>
              </div>
            </div>
          )}

          {activeLayer === 'wind' && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-[0.2em]">
                Wind Velocity & Streams
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-300">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded-sm bg-[#34d399]"></span> &lt;20 km/h
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded-sm bg-[#38bdf8]"></span> 20-35
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded-sm bg-[#f59e0b]"></span> 35-50
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2 rounded-sm bg-[#ef4444]"></span> &gt;50 (Gale)
                </div>
              </div>
            </div>
          )}

          {activeLayer === 'clouds' && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 font-semibold mb-1.5 uppercase tracking-[0.2em]">
                Satellite Cloud Top Temp
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300">
                <span className="w-3 h-2 rounded-sm bg-white"></span> -70°C (Deep Convective)
                <span className="w-3 h-2 rounded-sm bg-cyan-300"></span> -40°C
                <span className="w-3 h-2 rounded-sm bg-gray-400"></span> 0°C (Low)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
