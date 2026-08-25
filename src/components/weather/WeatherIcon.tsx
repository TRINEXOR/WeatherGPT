import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, isDay = true, className = 'w-8 h-8 text-[#7bd0ff]' }) => {
  if (code === 0 || code === 1) {
    return <Sun className={`${className} text-amber-300`} />;
  }
  if (code === 2) {
    return <CloudSun className={className} />;
  }
  if (code === 3) {
    return <Cloud className={`${className} text-slate-300`} />;
  }
  if (code === 45 || code === 48) {
    return <CloudFog className={`${className} text-slate-400`} />;
  }
  if (code >= 51 && code <= 57) {
    return <CloudDrizzle className={`${className} text-sky-400`} />;
  }
  if (code >= 61 && code <= 67 || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-[#7bd0ff]`} />;
  }
  if (code >= 71 && code <= 77 || (code >= 85 && code <= 86)) {
    return <Snowflake className={`${className} text-blue-200`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${className} text-amber-400 animate-pulse`} />;
  }

  return <Cloud className={className} />;
};
