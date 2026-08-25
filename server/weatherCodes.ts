export interface WeatherCodeInfo {
  description: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  icon: string;
}

export const WMO_WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { description: 'Clear sky', category: 'clear', icon: 'sun' },
  1: { description: 'Mainly clear', category: 'clear', icon: 'sun' },
  2: { description: 'Partly cloudy', category: 'cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', category: 'cloudy', icon: 'cloud' },
  45: { description: 'Foggy', category: 'fog', icon: 'cloud-fog' },
  48: { description: 'Depositing rime fog', category: 'fog', icon: 'cloud-fog' },
  51: { description: 'Light drizzle', category: 'drizzle', icon: 'cloud-drizzle' },
  53: { description: 'Moderate drizzle', category: 'drizzle', icon: 'cloud-drizzle' },
  55: { description: 'Dense drizzle', category: 'drizzle', icon: 'cloud-drizzle' },
  56: { description: 'Light freezing drizzle', category: 'drizzle', icon: 'cloud-snow' },
  57: { description: 'Dense freezing drizzle', category: 'drizzle', icon: 'cloud-snow' },
  61: { description: 'Slight rain', category: 'rain', icon: 'cloud-rain' },
  63: { description: 'Moderate rain', category: 'rain', icon: 'cloud-rain' },
  65: { description: 'Heavy rain', category: 'rain', icon: 'cloud-rain-heavy' },
  66: { description: 'Light freezing rain', category: 'rain', icon: 'cloud-snow' },
  67: { description: 'Heavy freezing rain', category: 'rain', icon: 'cloud-snow' },
  71: { description: 'Slight snow fall', category: 'snow', icon: 'snowflake' },
  73: { description: 'Moderate snow fall', category: 'snow', icon: 'snowflake' },
  75: { description: 'Heavy snow fall', category: 'snow', icon: 'snowflake' },
  77: { description: 'Snow grains', category: 'snow', icon: 'snowflake' },
  80: { description: 'Slight rain showers', category: 'rain', icon: 'cloud-rain' },
  81: { description: 'Moderate rain showers', category: 'rain', icon: 'cloud-rain' },
  82: { description: 'Violent rain showers', category: 'rain', icon: 'cloud-rain-heavy' },
  85: { description: 'Slight snow showers', category: 'snow', icon: 'snowflake' },
  86: { description: 'Heavy snow showers', category: 'snow', icon: 'snowflake' },
  95: { description: 'Thunderstorm', category: 'thunderstorm', icon: 'cloud-lightning' },
  96: { description: 'Thunderstorm with slight hail', category: 'thunderstorm', icon: 'cloud-lightning' },
  99: { description: 'Thunderstorm with heavy hail', category: 'thunderstorm', icon: 'cloud-lightning' },
};

export function getWeatherDescription(code: number): string {
  return WMO_WEATHER_CODES[code]?.description || 'Partly cloudy';
}

export function getWeatherCategory(code: number): WeatherCodeInfo['category'] {
  return WMO_WEATHER_CODES[code]?.category || 'cloudy';
}
