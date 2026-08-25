export type AlertSeverity = 'info' | 'watch' | 'advisory' | 'warning' | 'emergency';

export interface WeatherLocation {
  name: string;
  country: string;
  admin1?: string; // State / Region
  admin2?: string; // District
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  countryCode?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherDescription: string;
  relativeHumidity: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  surfacePressure: number;
  uvIndex: number;
  cloudCover: number;
  visibility: number;
  isDay: boolean;
  timestamp: string;
  source: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  relativeHumidity: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  severity: AlertSeverity;
  area: string;
  source: string;
  isOfficial: boolean;
  issuedAt: string;
  expiresAt: string;
}

export interface AirQualityData {
  aqi: number;
  usAqi: number;
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  ozone: number;
  co: number;
  status: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
}

export interface CycloneInfo {
  id: string;
  name: string;
  basin: string;
  intensity: string;
  maxWindSpeedKmh: number;
  centralPressureHpa: number;
  currentLat: number;
  currentLon: number;
  movementSpeedKmh: number;
  movementDirection: string;
  status: 'Depression' | 'Deep Depression' | 'Cyclonic Storm' | 'Severe Cyclonic Storm' | 'Very Severe Cyclonic Storm' | 'Super Cyclone' | 'Active Monitoring';
  affectedAreas: string[];
  warningLevel: AlertSeverity;
  track: Array<{
    time: string;
    lat: number;
    lon: number;
    windSpeedKmh: number;
    stage: string;
  }>;
  source: string;
  updatedAt: string;
}

export interface HistoricalYearSummary {
  year: number;
  totalRainfallMm: number;
  avgTempMaxC: number;
  avgTempMinC: number;
  anomalyPercent: number; // rainfall deviation from average
}

export interface ClimateTrend {
  locationName: string;
  period: string;
  annualData: HistoricalYearSummary[];
  averageRainfallMm: number;
  hottestYear: { year: number; temp: number };
  wettestYear: { year: number; rainfall: number };
  trendSummary: string;
}

export interface AgricultureAdvisory {
  crop: string;
  location: string;
  soilMoistureRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  irrigationAdvice: string;
  sprayingAdvice: string;
  harvestingAdvice: string;
  precautions: string[];
  forecastSummary: string;
  generatedAt: string;
}

export interface TravelAdvisory {
  origin: string;
  destination: string;
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  routeWeather: Array<{
    checkpoint: string;
    weatherDescription: string;
    temperature: number;
    rainProb: number;
    hazardAlert?: string;
  }>;
  advisoryText: string;
  recommendations: string[];
}

export interface ToolCallExecution {
  name: string;
  status: 'calling' | 'success' | 'failed';
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallExecution[];
  weatherSnapshot?: {
    location: string;
    temp: number;
    condition: string;
    feelsLike: number;
    rainProb: number;
    humidity: number;
    wind: number;
  };
  alertSnapshot?: WeatherAlert;
  advisorySnapshot?: {
    type: 'agriculture' | 'travel' | 'general';
    title: string;
    items: string[];
  };
  sources?: string[];
}

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'mr' // Marathi
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'or'; // Odia

export type LanguageOption = SupportedLanguage;

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  alerts: WeatherAlert[];
  airQuality?: AirQualityData | null;
}

export interface UserPreferences {
  tempUnit: 'C' | 'F';
  windSpeedUnit: 'kmh' | 'mph' | 'ms' | 'knots';
  precipitationUnit: 'mm' | 'inches';
  language: SupportedLanguage;
  defaultLocation: WeatherLocation;
}
