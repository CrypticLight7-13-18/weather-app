import { apiClient, checkSimulatedError } from './client';
import {
  OpenMeteoResponse,
  OpenMeteoHistoricalResponse,
  createApiError,
} from '@/types/api';
import {
  WeatherData,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  HistoricalData,
  WeatherCode,
} from '@/types/weather';
import { format, subDays } from 'date-fns';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const OPEN_METEO_ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1';

interface FetchWeatherParams {
  latitude: number;
  longitude: number;
  timezone?: string;
}

// Always fetch in metric units (Celsius, km/h, hPa, mm)
// Conversion to user's preferred units happens in the display layer
export async function fetchWeatherData({
  latitude,
  longitude,
  timezone = 'auto',
}: FetchWeatherParams): Promise<WeatherData> {
  checkSimulatedError();

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'uv_index_max',
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone,
    forecast_days: '7',
  });

  const url = `${OPEN_METEO_BASE_URL}/forecast?${params}`;

  const response = await apiClient<OpenMeteoResponse>(url, {
    next: { revalidate: 900 }, // Cache for 15 minutes
  });

  return transformWeatherResponse(response);
}

export async function fetchHistoricalData({
  latitude,
  longitude,
  days = 30,
}: FetchWeatherParams & { days?: number }): Promise<HistoricalData[]> {
  checkSimulatedError();

  const endDate = subDays(new Date(), 1);
  const startDate = subDays(endDate, days - 1);

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'temperature_2m_mean',
      'precipitation_sum',
    ].join(','),
    temperature_unit: 'celsius',
    precipitation_unit: 'mm',
    timezone: 'auto',
  });

  const url = `${OPEN_METEO_ARCHIVE_URL}/archive?${params}`;

  const response = await apiClient<OpenMeteoHistoricalResponse>(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  return transformHistoricalResponse(response);
}

function transformWeatherResponse(response: OpenMeteoResponse): WeatherData {
  const { current, hourly, daily, timezone, timezone_abbreviation } = response;

  if (!current || !hourly || !daily) {
    throw createApiError('INVALID_DATA', 'Missing weather data in response');
  }

  const currentWeather: CurrentWeather = {
    temperature: current.temperature_2m ?? 0,
    feelsLike: current.apparent_temperature ?? current.temperature_2m ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    windDirection: current.wind_direction_10m ?? 0,
    precipitation: current.precipitation ?? 0,
    weatherCode: (current.weather_code ?? 0) as WeatherCode,
    isDay: current.is_day === 1,
    cloudCover: current.cloud_cover ?? 0,
    pressure: current.pressure_msl ?? 0,
    uvIndex: 0, // Not in current, will be fetched from daily
    visibility: 10000, // Default visibility
  };

  // Get UV index from today's daily data
  if (daily.uv_index_max?.[0] !== undefined) {
    currentWeather.uvIndex = daily.uv_index_max[0];
  }

  const hourlyForecast: HourlyForecast[] = hourly.time.slice(0, 48).map((time, index) => ({
    time,
    temperature: hourly.temperature_2m?.[index] ?? 0,
    humidity: hourly.relative_humidity_2m?.[index] ?? 0,
    precipitationProbability: hourly.precipitation_probability?.[index] ?? 0,
    precipitation: hourly.precipitation?.[index] ?? 0,
    weatherCode: (hourly.weather_code?.[index] ?? 0) as WeatherCode,
    windSpeed: hourly.wind_speed_10m?.[index] ?? 0,
    isDay: hourly.is_day?.[index] === 1,
  }));

  const dailyForecast: DailyForecast[] = daily.time.map((date, index) => ({
    date,
    temperatureMax: daily.temperature_2m_max?.[index] ?? 0,
    temperatureMin: daily.temperature_2m_min?.[index] ?? 0,
    precipitationProbability: daily.precipitation_probability_max?.[index] ?? 0,
    precipitationSum: daily.precipitation_sum?.[index] ?? 0,
    weatherCode: (daily.weather_code?.[index] ?? 0) as WeatherCode,
    sunrise: daily.sunrise?.[index] ?? '',
    sunset: daily.sunset?.[index] ?? '',
    uvIndexMax: daily.uv_index_max?.[index] ?? 0,
    windSpeedMax: daily.wind_speed_10m_max?.[index] ?? 0,
  }));

  return {
    current: currentWeather,
    hourly: hourlyForecast,
    daily: dailyForecast,
    timezone,
    timezoneAbbreviation: timezone_abbreviation,
  };
}

function transformHistoricalResponse(response: OpenMeteoHistoricalResponse): HistoricalData[] {
  const { daily } = response;

  if (!daily || !daily.time) {
    throw createApiError('INVALID_DATA', 'Missing historical data in response');
  }

  return daily.time.map((date, index) => ({
    date,
    temperatureMax: daily.temperature_2m_max?.[index] ?? 0,
    temperatureMin: daily.temperature_2m_min?.[index] ?? 0,
    temperatureMean: daily.temperature_2m_mean?.[index] ?? 0,
    precipitationSum: daily.precipitation_sum?.[index] ?? 0,
    weatherCode: (daily.weather_code?.[index] ?? 0) as WeatherCode,
  }));
}
