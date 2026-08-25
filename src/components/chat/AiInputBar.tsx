import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  CloudRain,
  Thermometer,
  AlertTriangle,
  Wind,
  Sprout,
  Globe,
  Map as MapIcon,
  Loader2,
} from 'lucide-react';

interface AiInputBarProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentLocationName: string;
  onSelectActionTab: (tab: 'home' | 'forecast' | 'map' | 'alerts' | 'cyclone' | 'farming' | 'climate') => void;
}

export const AiInputBar: React.FC<AiInputBarProps> = ({
  onSendMessage,
  isLoading,
  currentLocationName,
  onSelectActionTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSpeechSupported(true);
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!speechSupported) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          onSendMessage(transcript);
          setInputText('');
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickActions = [
    {
      id: 'rain',
      label: 'Rain',
      icon: CloudRain,
      query: `Will it rain in ${currentLocationName} over the next 24 hours?`,
      tabAction: null,
    },
    {
      id: 'temp',
      label: 'Temperature',
      icon: Thermometer,
      query: `What is the current temperature and 48-hour thermal trend for ${currentLocationName}?`,
      tabAction: 'forecast' as const,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      query: `Are there any active weather warnings or severe squall alerts for ${currentLocationName}?`,
      tabAction: 'alerts' as const,
    },
    {
      id: 'cyclone',
      label: 'Cyclone',
      icon: Wind,
      query: `Is there any active cyclonic storm or deep depression near the Indian coast?`,
      tabAction: 'cyclone' as const,
    },
    {
      id: 'farming',
      label: 'Farming',
      icon: Sprout,
      query: `Give me an agricultural weather advisory and soil moisture guidance for ${currentLocationName}.`,
      tabAction: 'farming' as const,
    },
    {
      id: 'climate',
      label: 'Climate',
      icon: Globe,
      query: `Show 10-year historical rainfall trends and monsoon averages for ${currentLocationName}.`,
      tabAction: 'climate' as const,
    },
    {
      id: 'map',
      label: 'Map',
      icon: MapIcon,
      query: `Open live radar and weather map for ${currentLocationName}.`,
      tabAction: 'map' as const,
    },
  ];

  return (
    <div className="flex flex-col justify-end gap-4 w-full">
      {/* Quick Action Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => {
                if (action.tabAction && window.innerWidth < 768) {
                  onSelectActionTab(action.tabAction);
                } else {
                  onSendMessage(action.query);
                }
              }}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 hover:border-white/30 text-xs font-mono tracking-wider text-gray-300 hover:text-white flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-gray-400" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Input Container */}
      <div className="w-full bg-[#111111] rounded-2xl p-2 border border-white/10 shadow-2xl backdrop-blur-md focus-within:border-white/30 transition-all">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#0A0A0A] p-2 sm:p-2.5 rounded-xl border border-white/10">
          {/* Sparkles Icon */}
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask WeatherGPT: "Will it rain in ${currentLocationName} tomorrow?"`}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-gray-100 placeholder-gray-500 p-0 disabled:opacity-50 font-light"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            title={isListening ? 'Stop Listening' : 'Voice Query'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            title="Send query"
            className="w-9 h-9 rounded-full bg-white hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-all shrink-0 shadow-md disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
