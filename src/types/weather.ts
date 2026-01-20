// Weather condition codes from Open-Meteo API
export type WeatherCode =
  | 0 // Clear sky
  | 1 | 2 | 3 // Mainly clear, partly cloudy, overcast
  | 45 | 48 // Fog and depositing rime fog
  | 51 | 53 | 55 // Drizzle: Light, moderate, dense
  | 56 | 57 // Freezing Drizzle: Light, dense
  | 61 | 63 | 65 // Rain: Slight, moderate, heavy
  | 66 | 67 // Freezing Rain: Light, heavy
  | 71 | 73 | 75 // Snow fall: Slight, moderate, heavy
  | 77 // Snow grains
  | 80 | 81 | 82 // Rain showers: Slight, moderate, violent
  | 85 | 86 // Snow showers: Slight, heavy
  | 95 // Thunderstorm: Slight or moderate
  | 96 | 99; // Thunderstorm with hail: Slight, heavy

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherCode: WeatherCode;
  isDay: boolean;
  cloudCover: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: WeatherCode;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  windSpeedMax: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: WeatherCode;
  windSpeed: number;
  isDay: boolean;
}

export interface HistoricalData {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitationSum: number;
  weatherCode: WeatherCode;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
  timezoneAbbreviation: string;
}

export interface WeatherCondition {
  label: string;
  icon: string;
  gradient: string;
  textColor: string;
}

export const WEATHER_CONDITIONS: Record<WeatherCode, WeatherCondition> = {
  0: { label: 'Clear sky', icon: 'sun', gradient: 'from-amber-400 to-orange-500', textColor: 'text-amber-900' },
  1: { label: 'Mainly clear', icon: 'sun', gradient: 'from-amber-300 to-orange-400', textColor: 'text-amber-900' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun', gradient: 'from-blue-300 to-blue-500', textColor: 'text-blue-900' },
  3: { label: 'Overcast', icon: 'cloud', gradient: 'from-slate-400 to-slate-600', textColor: 'text-slate-100' },
  45: { label: 'Fog', icon: 'cloud-fog', gradient: 'from-slate-300 to-slate-500', textColor: 'text-slate-900' },
  48: { label: 'Rime fog', icon: 'cloud-fog', gradient: 'from-slate-200 to-slate-400', textColor: 'text-slate-900' },
  51: { label: 'Light drizzle', icon: 'cloud-drizzle', gradient: 'from-blue-400 to-blue-600', textColor: 'text-blue-100' },
  53: { label: 'Moderate drizzle', icon: 'cloud-drizzle', gradient: 'from-blue-500 to-blue-700', textColor: 'text-blue-100' },
  55: { label: 'Dense drizzle', icon: 'cloud-drizzle', gradient: 'from-blue-600 to-blue-800', textColor: 'text-blue-100' },
  56: { label: 'Light freezing drizzle', icon: 'cloud-drizzle', gradient: 'from-cyan-400 to-blue-600', textColor: 'text-cyan-100' },
  57: { label: 'Dense freezing drizzle', icon: 'cloud-drizzle', gradient: 'from-cyan-500 to-blue-700', textColor: 'text-cyan-100' },
  61: { label: 'Slight rain', icon: 'cloud-rain', gradient: 'from-blue-500 to-indigo-600', textColor: 'text-blue-100' },
  63: { label: 'Moderate rain', icon: 'cloud-rain', gradient: 'from-blue-600 to-indigo-700', textColor: 'text-blue-100' },
  65: { label: 'Heavy rain', icon: 'cloud-rain', gradient: 'from-blue-700 to-indigo-800', textColor: 'text-blue-100' },
  66: { label: 'Light freezing rain', icon: 'cloud-rain', gradient: 'from-cyan-500 to-indigo-600', textColor: 'text-cyan-100' },
  67: { label: 'Heavy freezing rain', icon: 'cloud-rain', gradient: 'from-cyan-600 to-indigo-700', textColor: 'text-cyan-100' },
  71: { label: 'Slight snow', icon: 'snowflake', gradient: 'from-slate-200 to-blue-300', textColor: 'text-slate-800' },
  73: { label: 'Moderate snow', icon: 'snowflake', gradient: 'from-slate-300 to-blue-400', textColor: 'text-slate-800' },
  75: { label: 'Heavy snow', icon: 'snowflake', gradient: 'from-slate-400 to-blue-500', textColor: 'text-slate-100' },
  77: { label: 'Snow grains', icon: 'snowflake', gradient: 'from-slate-200 to-slate-400', textColor: 'text-slate-800' },
  80: { label: 'Slight rain showers', icon: 'cloud-rain', gradient: 'from-blue-400 to-blue-600', textColor: 'text-blue-100' },
  81: { label: 'Moderate rain showers', icon: 'cloud-rain', gradient: 'from-blue-500 to-blue-700', textColor: 'text-blue-100' },
  82: { label: 'Violent rain showers', icon: 'cloud-rain', gradient: 'from-blue-700 to-slate-800', textColor: 'text-blue-100' },
  85: { label: 'Slight snow showers', icon: 'cloud-snow', gradient: 'from-slate-300 to-blue-400', textColor: 'text-slate-800' },
  86: { label: 'Heavy snow showers', icon: 'cloud-snow', gradient: 'from-slate-400 to-blue-500', textColor: 'text-slate-100' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning', gradient: 'from-slate-600 to-purple-800', textColor: 'text-purple-100' },
  96: { label: 'Thunderstorm with hail', icon: 'cloud-lightning', gradient: 'from-slate-700 to-purple-900', textColor: 'text-purple-100' },
  99: { label: 'Heavy thunderstorm with hail', icon: 'cloud-lightning', gradient: 'from-slate-800 to-purple-950', textColor: 'text-purple-100' },
};

export function getWeatherCondition(code: WeatherCode, isDay: boolean = true): WeatherCondition {
  const condition = WEATHER_CONDITIONS[code] || WEATHER_CONDITIONS[0];
  
  // Adjust for night time
  if (!isDay && [0, 1, 2].includes(code)) {
    return {
      ...condition,
      icon: code === 2 ? 'cloud-moon' : 'moon',
      gradient: 'from-indigo-800 to-slate-900',
      textColor: 'text-indigo-100',
    };
  }
  
  return condition;
}

