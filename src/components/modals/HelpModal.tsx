import React from 'react';
import { X, HelpCircle, Bot, Mic, ShieldAlert, CloudRain, Sprout, Wind } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-light text-base text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Documentation & User Guide
              </h3>
              <p className="text-xs text-gray-400 font-light">Meteorological AI platform operational handbook</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-gray-300">
          <div className="space-y-1.5">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2 font-medium">
              <Bot className="w-3.5 h-3.5 text-gray-400" />
              1. Conversational Meteorological AI
            </h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Ask natural language weather questions in any of 11 Indian languages (English, Hindi, Marathi, Tamil, Bengali, Telugu, etc.). WeatherGPT executes real-time scientific tool calls to verify data before answering.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2 font-medium">
              <Mic className="w-3.5 h-3.5 text-gray-400" />
              2. Voice Command Capabilities
            </h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Click the microphone icon on the input bar to speak your query. You can ask queries like <em>"Will it rain in Pune today?"</em> or <em>"मुंबई में आज मौसम कैसा रहेगा?"</em>.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
              3. Official Warning Bulletins
            </h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Red, Orange, and Yellow alerts follow standard meteorological criteria with actionable safety directives, cyclone coordinates, and marine advisories.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2 font-medium">
              <Sprout className="w-3.5 h-3.5 text-gray-400" />
              4. Agricultural Intelligence
            </h4>
            <p className="text-xs text-gray-400 font-light leading-relaxed">
              Select your specific crop (Paddy, Cotton, Wheat, Sugarcane) to receive customized irrigation recommendations, soil moisture stress indicators, and spray feasibility windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
