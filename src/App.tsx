import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { CurrentWeatherCard } from './components/weather/CurrentWeatherCard';
import { AlertBanner } from './components/weather/AlertBanner';
import { AiInputBar } from './components/chat/AiInputBar';
import { ChatPanel } from './components/chat/ChatPanel';
import { ForecastView } from './components/forecast/ForecastView';
import { WeatherMap } from './components/map/WeatherMap';
import { AlertsView } from './components/alerts/AlertsView';
import { CycloneView } from './components/cyclone/CycloneView';
import { ClimateView } from './components/climate/ClimateView';
import { AgricultureView } from './components/agriculture/AgricultureView';
import { ThermostatModal } from './components/modals/ThermostatModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { HelpModal } from './components/modals/HelpModal';
import { PrivacyModal } from './components/modals/PrivacyModal';
import { StateCityModal } from './components/locations/StateCityModal';
import {
  WeatherData,
  WeatherLocation,
  ChatMessage,
  UserPreferences,
  CycloneInfo,
} from './types';
import {
  Loader2,
  Home as HomeIcon,
  LineChart,
  Map as MapIcon,
  AlertTriangle,
  Wind,
  Sprout,
  BarChart3,
  Bot,
} from 'lucide-react';

const DEFAULT_LOCATION: WeatherLocation = {
  name: 'Mumbai',
  latitude: 19.076,
  longitude: 72.8777,
  country: 'India',
  admin1: 'Maharashtra',
  timezone: 'Asia/Kolkata',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  tempUnit: 'C',
  windSpeedUnit: 'kmh',
  precipitationUnit: 'mm',
  language: 'en',
  defaultLocation: DEFAULT_LOCATION,
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentLocation, setCurrentLocation] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cyclones, setCyclones] = useState<CycloneInfo[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isLocating, setIsLocating] = useState(false);

  // Modals state
  const [showThermostat, setShowThermostat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showStateCityModal, setShowStateCityModal] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  // Fetch weather for location
  const fetchWeather = useCallback(async (loc: WeatherLocation) => {
    setIsLoadingWeather(true);
    try {
      const res = await fetch(
        `/api/weather/current?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}`
      );
      if (res.ok) {
        const data: WeatherData = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Fetch cyclones
  const fetchCyclones = useCallback(async () => {
    try {
      const res = await fetch('/api/cyclones');
      if (res.ok) {
        const data = await res.json();
        setCyclones(data);
      }
    } catch (err) {
      console.error('Failed to load cyclones:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWeather(currentLocation);
    fetchCyclones();

    // Welcome message in chat
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 **Welcome to WeatherGPT.**\n\nI am your meteorological intelligence assistant with live satellite radar and official IMD ground telemetry.\n\n*Currently monitoring:* **${currentLocation.name}, ${currentLocation.admin1 || 'India'}**.\n\nYou can query rainfall probabilities, cyclonic tracks, agricultural directives, or search weather across Indian states and cities at any time.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Refresh when location changes
  const handleSelectLocation = (newLoc: WeatherLocation) => {
    setCurrentLocation(newLoc);
    fetchWeather(newLoc);
  };

  // Locate User GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const locData = await res.json();
            const newLoc: WeatherLocation = {
              name: locData.name || 'Current Location',
              latitude,
              longitude,
              country: locData.country || 'India',
              admin1: locData.admin1 || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
            };
            setCurrentLocation(newLoc);
            fetchWeather(newLoc);
          }
        } catch (err) {
          console.error('Failed to reverse geocode user:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation access error:', err);
        setIsLocating(false);
        alert('Could not retrieve device location. Please enable location permissions or search manually.');
      },
      { timeout: 10000 }
    );
  };

  // Send message to Gemini AI Weather Assistant
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);
    setShowChatDrawer(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentLocation: {
            name: currentLocation.name,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          },
          language: preferences.language,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error('Weather reasoning service temporarily busy');
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content || data.reply || 'Meteorological telemetry updated.',
        timestamp: new Date().toISOString(),
        toolCalls: data.toolCalls || [],
        weatherSnapshot: data.weatherSnapshot,
        advisorySnapshot: data.advisorySnapshot,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error during AI chat:', err);
      const fallbackMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ Weather data is temporarily unavailable from the provider. I could not verify live meteorological parameters for this query. Please check back shortly.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Reset conversation
  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-new-${Date.now()}`,
        role: 'assistant',
        content: `✨ Started a fresh meteorological briefing for **${currentLocation.name}**.\n\nAsk any question regarding precipitation probabilities, wind squalls, cyclone tracks, or crop advice across all Indian states and Union Territories.`,
        timestamp: new Date().toISOString(),
      },
    ]);
    setActiveTab('home');
    setShowChatDrawer(true);
  };

  // Time greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans antialiased flex flex-col selection:bg-white/20 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        tempUnit={preferences.tempUnit}
        onToggleUnit={() =>
          setPreferences((p) => ({
            ...p,
            tempUnit: p.tempUnit === 'C' ? 'F' : 'C',
          }))
        }
        onOpenSettings={() => setShowSettings(true)}
        onOpenThermostat={() => setShowThermostat(true)}
        onOpenStateCityModal={() => setShowStateCityModal(true)}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-1 pt-16 sm:pt-20">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'settings') {
              setShowSettings(true);
            } else {
              setActiveTab(tab);
            }
          }}
          onNewChat={handleNewChat}
          onOpenHelp={() => setShowHelp(true)}
          onOpenPrivacy={() => setShowPrivacy(true)}
          alertCount={weatherData?.alerts?.length || 0}
        />

        {/* Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full mb-16 lg:mb-0">
          {isLoadingWeather && !weatherData ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="font-mono text-xs sm:text-sm text-gray-400">
                Grounding Observation Telemetry for {currentLocation.name}...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: HOME */}
              {activeTab === 'home' && weatherData && (
                <div className="space-y-6">
                  {/* Greeting & Location Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-white/5">
                    <div>
                      <h1
                        className="text-3xl sm:text-4xl font-light tracking-tight text-white font-serif"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {getGreeting()},{' '}
                        <span className="text-white font-normal underline decoration-white/30 decoration-1 underline-offset-8">
                          {currentLocation.name}
                        </span>
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-400 mt-2">
                        <span>
                          {new Date().toLocaleDateString('en-IN', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          Coordinates: {currentLocation.latitude.toFixed(2)}°N,{' '}
                          {currentLocation.longitude.toFixed(2)}°E
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Heavy Rain Warning / Top Alert Banner */}
                  {weatherData.alerts && weatherData.alerts.length > 0 && (
                    <AlertBanner
                      alerts={weatherData.alerts}
                      onViewAllAlerts={() => setActiveTab('alerts')}
                    />
                  )}

                  {/* 2-Column Responsive Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Current Weather Card + Hourly snapshot */}
                    <div className="lg:col-span-5 space-y-4">
                      <CurrentWeatherCard
                        weather={weatherData.current}
                        airQuality={weatherData.airQuality}
                        tempUnit={preferences.tempUnit}
                        locationName={currentLocation.name}
                      />

                      {/* Quick 6-Hour Mini Scroller */}
                      <div className="bg-[#111111] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="font-mono text-gray-400 uppercase font-medium tracking-wider">
                            Upcoming 6-Hour Outlook
                          </span>
                          <button
                            onClick={() => setActiveTab('forecast')}
                            className="text-gray-300 hover:text-white transition-colors"
                          >
                            Full 48h Forecast →
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                          {weatherData.hourly.slice(1, 7).map((h, i) => (
                            <div
                              key={i}
                              className="bg-white/[0.02] hover:bg-white/5 p-2 rounded-xl border border-white/10 transition-colors"
                            >
                              <span className="text-[10px] font-mono text-gray-500 block">
                                {new Date(h.time).toLocaleTimeString([], { hour: 'numeric' })}
                              </span>
                              <span className="text-sm font-light font-mono text-white block my-1">
                                {preferences.tempUnit === 'F'
                                  ? `${Math.round((h.temperature * 9) / 5 + 32)}°`
                                  : `${Math.round(h.temperature)}°`}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                {h.precipitationProbability}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: AI Conversation Stream & Prompt Assistant */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div className="h-[460px] w-full">
                        <ChatPanel
                          messages={messages}
                          isLoading={isChatLoading}
                          onSendMessage={handleSendMessage}
                          tempUnit={preferences.tempUnit}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Input Bar with Quick Action Chips */}
                  <div className="pt-2">
                    <AiInputBar
                      onSendMessage={handleSendMessage}
                      isLoading={isChatLoading}
                      currentLocationName={currentLocation.name}
                      onSelectActionTab={(tab) => setActiveTab(tab)}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FORECAST */}
              {activeTab === 'forecast' && weatherData && (
                <ForecastView
                  hourly={weatherData.hourly}
                  daily={weatherData.daily}
                  tempUnit={preferences.tempUnit}
                  locationName={currentLocation.name}
                />
              )}

              {/* TAB 3: MAP */}
              {activeTab === 'map' && weatherData && (
                <WeatherMap
                  location={currentLocation}
                  currentWeather={weatherData.current}
                  cyclones={cyclones}
                  tempUnit={preferences.tempUnit}
                  onSelectLocation={handleSelectLocation}
                />
              )}

              {/* TAB 4: ALERTS */}
              {activeTab === 'alerts' && weatherData && (
                <AlertsView
                  alerts={weatherData.alerts || []}
                  locationName={currentLocation.name}
                />
              )}

              {/* TAB 5: CYCLONE */}
              {activeTab === 'cyclone' && <CycloneView />}

              {/* TAB 6: FARMING */}
              {activeTab === 'farming' && <AgricultureView location={currentLocation} />}

              {/* TAB 7: CLIMATE */}
              {activeTab === 'climate' && <ClimateView location={currentLocation} />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-40">
        {[
          { id: 'home' as ActiveTab, label: 'Home', icon: HomeIcon },
          { id: 'forecast' as ActiveTab, label: 'Forecast', icon: LineChart },
          { id: 'map' as ActiveTab, label: 'Map', icon: MapIcon },
          { id: 'alerts' as ActiveTab, label: 'Alerts', icon: AlertTriangle },
          { id: 'farming' as ActiveTab, label: 'Farming', icon: Sprout },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 p-1 transition-all ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      {showStateCityModal && (
        <StateCityModal
          isOpen={showStateCityModal}
          onClose={() => setShowStateCityModal(false)}
          onSelectLocation={handleSelectLocation}
          currentLocation={currentLocation}
        />
      )}

      {showThermostat && weatherData && (
        <ThermostatModal
          weather={weatherData.current}
          airQuality={weatherData.airQuality}
          locationName={currentLocation.name}
          tempUnit={preferences.tempUnit}
          onClose={() => setShowThermostat(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          preferences={preferences}
          onUpdatePreferences={(updated) =>
            setPreferences((prev) => ({ ...prev, ...updated }))
          }
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}

export default App;
