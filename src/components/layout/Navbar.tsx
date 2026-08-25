import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Thermometer, User, Compass, X, Loader2 } from 'lucide-react';
import { WeatherLocation } from '../../types';
import { searchIndianLocations } from '../../data/indiaLocations';
import { WeatherGptLogo } from '../brand/WeatherGptLogo';

interface NavbarProps {
  currentLocation: WeatherLocation;
  onSelectLocation: (loc: WeatherLocation) => void;
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  onOpenSettings: () => void;
  onOpenThermostat: () => void;
  onOpenStateCityModal: () => void;
  onLocateUser: () => void;
  isLocating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  tempUnit,
  onToggleUnit,
  onOpenSettings,
  onOpenThermostat,
  onOpenStateCityModal,
  onLocateUser,
  isLocating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Instant local Indian cities/states match
    const localMatches = searchIndianLocations(searchQuery);
    if (localMatches.length > 0) {
      setResults(localMatches);
      setIsOpen(true);
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const apiData: WeatherLocation[] = await res.json();
          // Merge local Indian locations and API results without duplicates
          const seen = new Set<string>();
          const merged: WeatherLocation[] = [];

          for (const item of [...localMatches, ...apiData]) {
            const key = `${item.name.toLowerCase()}-${item.latitude.toFixed(2)}-${item.longitude.toFixed(2)}`;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }

          setResults(merged);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 sm:h-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 sm:px-8 z-50 transition-all">
      {/* Brand & Search */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div 
          onClick={() => window.location.hash = '#home'}
          className="cursor-pointer select-none group"
        >
          <WeatherGptLogo size="md" />
        </div>

        {/* Location Search Bar */}
        <div className="relative hidden md:block" ref={dropdownRef}>
          <div className="flex items-center bg-white/5 hover:bg-white/[0.08] focus-within:bg-white/10 rounded-full px-3.5 py-1.5 border border-white/10 focus-within:border-white/30 transition-all w-60 lg:w-72">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setIsOpen(true); }}
              placeholder="Search all Indian cities, states, UTs..."
              className="bg-transparent border-none focus:outline-none text-xs sm:text-sm text-gray-100 placeholder-gray-500 w-full font-light"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-white animate-spin shrink-0 ml-1" />
            ) : searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-[#111111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              <div className="px-3.5 py-2 text-[10px] font-mono text-gray-400 border-b border-white/10 uppercase tracking-[0.2em] flex items-center justify-between bg-black/40">
                <span>IMD & Observation Stations</span>
                <span className="text-emerald-400">{results.length} found</span>
              </div>
              {results.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.latitude}-${idx}`}
                  onClick={() => {
                    onSelectLocation(loc);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-none transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white shrink-0" />
                    <div>
                      <span className="font-normal text-white">{loc.name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">
                        {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 group-hover:text-gray-400">
                    {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Current Location Trigger */}
        <button
          onClick={onOpenStateCityModal}
          title="Click to change location or view all 36 States & UTs"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-light text-gray-200 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[110px] sm:max-w-[170px]">
            {currentLocation.name}{currentLocation.admin1 ? `, ${currentLocation.admin1}` : ''}
          </span>
        </button>

        {/* GPS Locate Button */}
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          title="Detect GPS location"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Compass className="w-4 h-4" />
          )}
        </button>

        {/* Celsius / Fahrenheit Switch */}
        <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
          <button
            onClick={() => { if (tempUnit !== 'C') onToggleUnit(); }}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              tempUnit === 'C'
                ? 'bg-white text-[#0A0A0A] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => { if (tempUnit !== 'F') onToggleUnit(); }}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all ${
              tempUnit === 'F'
                ? 'bg-white text-[#0A0A0A] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            °F
          </button>
        </div>

        {/* Quick Thermostat trigger */}
        <button
          onClick={onOpenThermostat}
          title="Atmospheric metrics"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
        >
          <Thermometer className="w-4 h-4" />
        </button>

        {/* Settings & Info trigger */}
        <button
          onClick={onOpenSettings}
          title="Settings & Multilingual configuration"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
