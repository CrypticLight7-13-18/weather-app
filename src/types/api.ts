export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'LOCATION_NOT_FOUND'
  | 'GEOLOCATION_DENIED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'INVALID_DATA'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
}

export const API_ERROR_MESSAGES: Record<ApiErrorType, string> = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  LOCATION_NOT_FOUND: 'Location not found. Please try a different search term.',
  GEOLOCATION_DENIED: 'Location access was denied. Please enable location services.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  INVALID_DATA: 'Received invalid data from the server. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export function createApiError(type: ApiErrorType, customMessage?: string, statusCode?: number): ApiError {
  return {
    type,
    message: customMessage || API_ERROR_MESSAGES[type],
    statusCode,
    retryable: ['NETWORK_ERROR', 'RATE_LIMITED', 'SERVER_ERROR'].includes(type),
  };
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

// Open-Meteo API response types
export interface OpenMeteoCurrentResponse {
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  current_units: Record<string, string>;
}

export interface OpenMeteoHourlyResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    is_day: number[];
  };
  hourly_units: Record<string, string>;
}

export interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
  };
  daily_units: Record<string, string>;
}

export interface OpenMeteoResponse extends OpenMeteoCurrentResponse, OpenMeteoHourlyResponse, OpenMeteoDailyResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
}

export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean: number[];
    precipitation_sum: number[];
  };
}

// Nominatim API response types
export interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

