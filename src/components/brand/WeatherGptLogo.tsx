import React from 'react';

interface WeatherGptLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const WeatherGptLogo: React.FC<WeatherGptLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Visual Logo Mark */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/20 p-0.5 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-all overflow-hidden shrink-0`}>
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-emerald-500/10 blur-sm rounded-xl" />
        
        {/* SVG Graphic */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1 relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radar circle */}
          <circle cx="20" cy="20" r="16" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 3" />
          <circle cx="20" cy="20" r="10" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.4" />
          
          {/* Cloud Body */}
          <path
            d="M27 24C28.8 24 30.2 22.6 30.2 20.8C30.2 19.1 28.9 17.7 27.2 17.5C27 14.1 24.2 11.5 20.8 11.5C18 11.5 15.6 13.2 14.7 15.7C14.3 15.5 13.9 15.4 13.5 15.4C10.9 15.4 8.8 17.5 8.8 20.1C8.8 22.7 10.9 24.8 13.5 24.8H27"
            fill="white"
          />
          
          {/* AI Energy Spark / Lightning */}
          <path
            d="M20 18L15 25H20L18 31L25 23H21L23 18H20Z"
            fill="#FACC15"
          />
        </svg>

        {/* Live scanning pulse dot */}
        <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-serif font-light text-white tracking-tight ${titleSizes[size]}`} style={{ fontFamily: "'Georgia', serif" }}>
            Weather
          </span>
          <span className={`font-mono font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 ${titleSizes[size]}`}>
            GPT
          </span>
        </div>
        {showSubtitle && (
          <span className="font-mono text-[9px] sm:text-[10px] text-gray-400 tracking-[0.18em] uppercase -mt-0.5 font-medium">
            Meteorological Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
