import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  MapPin,
  Building2,
  Globe2,
  Compass,
  Check,
  Navigation,
} from 'lucide-react';
import { ALL_INDIAN_STATES_AND_UTS, StateOrUT } from '../../data/indiaLocations';
import { WeatherLocation } from '../../types';

interface StateCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: WeatherLocation) => void;
  currentLocation: WeatherLocation;
}

export const StateCityModal: React.FC<StateCityModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'state' | 'ut'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);

  const filteredStates = useMemo(() => {
    return ALL_INDIAN_STATES_AND_UTS.filter((item) => {
      if (filterType === 'state' && item.type !== 'state') return false;
      if (filterType === 'ut' && item.type !== 'ut') return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const stateMatch = item.name.toLowerCase().includes(q) || item.capital.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
      const cityMatch = item.cities.some((c) => c.name.toLowerCase().includes(q));

      return stateMatch || cityMatch;
    });
  }, [filterType, searchQuery]);

  // If user searched for a city, or state changed, find the active state
  const activeState = useMemo(() => {
    if (selectedStateCode) {
      const found = ALL_INDIAN_STATES_AND_UTS.find((s) => s.code === selectedStateCode);
      if (found) return found;
    }
    return filteredStates[0] || ALL_INDIAN_STATES_AND_UTS[0];
  }, [selectedStateCode, filteredStates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-light text-base sm:text-lg text-white font-serif tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                All India Meteorological Directory
              </h3>
              <p className="text-xs text-gray-400 font-light">
                28 States • 8 Union Territories • 250+ Observation Stations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-4 sm:p-6 pb-3 border-b border-white/10 space-y-3 bg-[#0A0A0A]">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city, state, or UT..."
                className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/10 focus:border-white/30 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none transition-all font-light"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All (36)
              </button>
              <button
                onClick={() => setFilterType('state')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  filterType === 'state'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                28 States
              </button>
              <button
                onClick={() => setFilterType('ut')}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  filterType === 'ut'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                8 UTs
              </button>
            </div>
          </div>
        </div>

        {/* Master-Detail Explorer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: State / UT List */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto max-h-60 md:max-h-none p-3 space-y-1.5 bg-black/40">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 py-1">
              Regions ({filteredStates.length})
            </div>
            {filteredStates.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 font-mono">
                No matching state or UT found
              </div>
            ) : (
              filteredStates.map((st) => {
                const isSelected = activeState?.code === st.code;
                return (
                  <button
                    key={st.code}
                    onClick={() => setSelectedStateCode(st.code)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-white/10 border-white/30 text-white font-medium shadow-md'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono flex items-center justify-center text-gray-300">
                        {st.code}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-100">{st.name}</p>
                        <p className="text-[10px] text-gray-400 font-light">Cap: {st.capital}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase">
                      {st.type === 'ut' ? 'UT' : 'State'}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Cities inside selected State/UT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0A0A0A]">
            {activeState && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        {activeState.type === 'ut' ? 'Union Territory' : 'Indian State'}
                      </span>
                      <h4 className="text-lg font-light text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                        {activeState.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 font-light mt-0.5">
                      Capital & Administrative Center: <span className="text-white font-normal">{activeState.capital}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-500">
                    {activeState.cities.length} Observational Stations
                  </span>
                </div>

                {/* Cities Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeState.cities.map((city) => {
                    const isCurrent =
                      currentLocation.name.toLowerCase() === city.name.toLowerCase() ||
                      (currentLocation.latitude.toFixed(2) === city.latitude.toFixed(2) &&
                        currentLocation.longitude.toFixed(2) === city.longitude.toFixed(2));

                    return (
                      <button
                        key={`${city.name}-${city.latitude}`}
                        onClick={() => {
                          onSelectLocation(city);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                          isCurrent
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-black' : 'text-gray-400 group-hover:text-white'}`} />
                          <div>
                            <p className={`text-xs sm:text-sm font-normal ${isCurrent ? 'text-black font-semibold' : 'text-white'}`}>
                              {city.name}
                            </p>
                            <p className={`text-[10px] font-mono ${isCurrent ? 'text-black/70' : 'text-gray-500'}`}>
                              {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Select Station →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-gray-400">
          <span>Official IMD Observation Network Telemetry Grounding</span>
          <span>Coverage: All 28 States & 8 Union Territories</span>
        </div>
      </div>
    </div>
  );
};
