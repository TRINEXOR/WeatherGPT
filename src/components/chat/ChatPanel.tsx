import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  User,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  Droplets,
  Wind,
  ShieldCheck,
  Sprout,
  Car,
  ChevronDown,
  Cpu,
  Zap,
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { cleanTextForSpeech, detectLanguageAndVoice } from '../../utils/speechService';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClose?: () => void;
  tempUnit: 'C' | 'F';
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onClose,
  tempUnit,
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-fetch browser speech synthesis voices to ensure instant native language playback
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Auto-scroll to the newest message whenever messages or isLoading changes
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    // Whenever a new message arrives or loading state changes, smoothly auto-scroll
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  // Monitor user scroll position to toggle the "Scroll to newest" quick button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 80);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // 1. Detect language and appropriate voice
    const { lang, voice } = detectLanguageAndVoice(text);
    const isDevanagari = lang === 'hi-IN' || lang === 'mr-IN';

    // 2. Clean markdown and transform units into natural words (e.g. °C -> डिग्री सेल्सियस)
    const spokenContent = cleanTextForSpeech(text, isDevanagari);
    if (!spokenContent) return;

    const utterance = new SpeechSynthesisUtterance(spokenContent);
    utterance.lang = lang;
    if (voice) {
      utterance.voice = voice;
    }

    // Set natural pacing and pitch for clear meteorological articulation
    utterance.rate = isDevanagari ? 0.92 : 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const followUpSuggestions = [
    'What about tomorrow evening?',
    'Explain today\'s weather in Hindi',
    'मुंबईत उद्या पाऊस पडेल का?',
    'Should I irrigate my crops tomorrow?',
    'Is there any active cyclone warning?',
    'Compare weather across all Indian metro cities',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 bg-[#141414] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/15">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#141414] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-light tracking-wide text-sm text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
                Meteorological Intelligence
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wider uppercase">
                <Zap className="w-2.5 h-2.5" />
                Live Grounded
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
              Satellite Radar & IMD Ground Telemetry
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages List with Motion Animations */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-white/5 border border-white/15 flex items-center justify-center shrink-0 mt-1 shadow-sm"
                  >
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                    isUser
                      ? 'bg-white text-[#0A0A0A] font-normal shadow-md ml-auto'
                      : 'bg-white/[0.04] border border-white/10 text-gray-200 shadow-lg backdrop-blur-sm'
                  }`}
                >
                  {/* Main Content Markdown */}
                  <div
                    className={`max-w-none text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'text-[#0A0A0A] font-normal'
                        : 'text-gray-200'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className={`text-base font-semibold mt-3 mb-2 pb-1 border-b flex items-center gap-2 ${isUser ? 'text-[#0A0A0A] border-black/15' : 'text-white border-white/10'}`}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className={`text-sm font-semibold mt-3 mb-1.5 pb-1 border-b flex items-center gap-2 font-serif ${isUser ? 'text-[#0A0A0A] border-black/15' : 'text-white border-white/10'}`}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className={`text-xs sm:text-sm font-semibold mt-3 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-wide ${isUser ? 'text-black' : 'text-emerald-400'}`}>
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className={`text-xs font-semibold mt-2.5 mb-1 font-mono tracking-wide flex items-center gap-1 ${isUser ? 'text-gray-800' : 'text-gray-200'}`}>
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="my-1.5 leading-relaxed text-xs sm:text-sm">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className={`space-y-1.5 my-2 pl-4 list-disc text-xs sm:text-sm leading-relaxed ${isUser ? 'marker:text-black' : 'marker:text-emerald-400 text-gray-200'}`}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className={`space-y-1.5 my-2 pl-4 list-decimal text-xs sm:text-sm leading-relaxed ${isUser ? 'marker:text-black' : 'marker:text-emerald-400 text-gray-200'}`}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-relaxed pl-0.5">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className={`font-semibold ${isUser ? 'text-black' : 'text-white'}`}>
                            {children}
                          </strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className={`my-2.5 p-3 rounded-xl border-l-2 text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? 'bg-black/5 border-black/30 text-gray-900'
                              : 'bg-white/[0.04] border-emerald-400 text-gray-200'
                          }`}>
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="my-3 overflow-x-auto rounded-xl border border-white/10 shadow-sm">
                            <table className="w-full text-xs text-left border-collapse">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-white/10 text-white font-mono uppercase tracking-wider text-[11px] border-b border-white/10">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="px-3 py-2 font-semibold text-white">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-3 py-2 border-b border-white/5 font-mono text-gray-300">
                            {children}
                          </td>
                        ),
                        hr: () => <hr className={`my-3 ${isUser ? 'border-black/10' : 'border-white/10'}`} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Weather Snapshot badge if present */}
                  {!isUser && msg.weatherSnapshot && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-medium text-white">
                          {msg.weatherSnapshot.location}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                          {msg.weatherSnapshot.condition}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="font-serif text-lg font-light text-white"
                          style={{ fontFamily: "'Georgia', serif" }}
                        >
                          {tempUnit === 'F'
                            ? `${Math.round((msg.weatherSnapshot.temp * 9) / 5 + 32)}°F`
                            : `${msg.weatherSnapshot.temp}°C`}
                        </span>
                        <p className="text-[10px] font-mono text-gray-500">
                          Rain: {msg.weatherSnapshot.rainProb}%
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Advisory Snapshot if present */}
                  {!isUser && msg.advisorySnapshot && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-300 uppercase tracking-wider mb-1">
                        {msg.advisorySnapshot.type === 'agriculture' ? (
                          <Sprout className="w-3.5 h-3.5" />
                        ) : (
                          <Car className="w-3.5 h-3.5" />
                        )}
                        <span>Advisory Directive</span>
                      </div>
                      <ul className="text-xs text-amber-100/80 space-y-1 pl-3.5 list-disc">
                        {msg.advisorySnapshot.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Message footer with timestamp and audio readout */}
                  <div
                    className={`flex items-center justify-between mt-2.5 pt-2 border-t ${
                      isUser
                        ? 'border-black/10 text-gray-600'
                        : 'border-white/10 text-gray-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-white transition-colors p-1 text-gray-400"
                        title={speakingId === msg.id ? 'Stop audio' : 'Read aloud'}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-red-400 text-[10px] font-mono">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono">Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-1"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading state with pulsing wave animation */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/15 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-gray-300 flex items-center gap-3 shadow-lg">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-white font-light">
                    Synthesizing meteorological model data...
                  </p>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                  Analyzing satellite radar & ground observation feeds
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Anchor element for smooth automated scrolling */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Floating Jump to Latest button when user scrolled up */}
      {!isAtBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-16 right-5 bg-white text-black text-xs font-mono px-3 py-1.5 rounded-full shadow-2xl border border-white flex items-center gap-1.5 hover:bg-gray-200 transition-all z-20 active:scale-95"
        >
          <span>Jump to Latest</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Suggested Follow-ups */}
      <div className="px-4 py-2.5 bg-black/70 border-t border-white/10 overflow-x-auto flex gap-2 no-scrollbar">
        {followUpSuggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(sug)}
            className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-gray-300 hover:text-white rounded-full whitespace-nowrap transition-all font-light active:scale-95"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
};
