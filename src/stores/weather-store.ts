'use client';

import { create } from 'zustand';
import { WeatherData, HistoricalData } from '@/types/weather';
import { Location } from '@/types/location';
import { ApiError } from '@/types/api';
import { LoadingState } from '@/types';

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  location: Location;
}

interface HistoricalCache {
  data: HistoricalData[];
  timestamp: number;
  location: Location;
}

interface WeatherState {
  // Current weather state
  currentWeather: WeatherData | null;
  currentLocation: Location | null;
  weatherStatus: LoadingState;
  weatherError: ApiError | null;

  // Historical data state
  historicalData: HistoricalData[] | null;
  historicalStatus: LoadingState;
  historicalError: ApiError | null;

  // Cache for prefetched favorites
  weatherCache: Map<string, WeatherCache>;
  historicalCache: Map<string, HistoricalCache>;

  // Actions
  setCurrentWeather: (weather: WeatherData, location: Location) => void;
  setWeatherStatus: (status: LoadingState) => void;
  setWeatherError: (error: ApiError | null) => void;
  
  setHistoricalData: (data: HistoricalData[]) => void;
  setHistoricalStatus: (status: LoadingState) => void;
  setHistoricalError: (error: ApiError | null) => void;

  // Cache management
  cacheWeather: (locationId: string, data: WeatherData, location: Location) => void;
  getCachedWeather: (locationId: string) => WeatherCache | undefined;
  cacheHistorical: (locationId: string, data: HistoricalData[], location: Location) => void;
  getCachedHistorical: (locationId: string) => HistoricalCache | undefined;
  clearCache: () => void;

  // Reset
  reset: () => void;
}

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: null,
  currentLocation: null,
  weatherStatus: 'idle',
  weatherError: null,

  historicalData: null,
  historicalStatus: 'idle',
  historicalError: null,

  weatherCache: new Map(),
  historicalCache: new Map(),

  setCurrentWeather: (weather, location) =>
    set({
      currentWeather: weather,
      currentLocation: location,
      weatherStatus: 'success',
      weatherError: null,
    }),

  setWeatherStatus: (status) => set({ weatherStatus: status }),
  
  setWeatherError: (error) =>
    set({
      weatherError: error,
      weatherStatus: error ? 'error' : get().weatherStatus,
    }),

  setHistoricalData: (data) =>
    set({
      historicalData: data,
      historicalStatus: 'success',
      historicalError: null,
    }),

  setHistoricalStatus: (status) => set({ historicalStatus: status }),
  
  setHistoricalError: (error) =>
    set({
      historicalError: error,
      historicalStatus: error ? 'error' : get().historicalStatus,
    }),

  cacheWeather: (locationId, data, location) => {
    const newCache = new Map(get().weatherCache);
    newCache.set(locationId, {
      data,
      timestamp: Date.now(),
      location,
    });
    set({ weatherCache: newCache });
  },

  getCachedWeather: (locationId) => {
    const cached = get().weatherCache.get(locationId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return undefined;
  },

  cacheHistorical: (locationId, data, location) => {
    const newCache = new Map(get().historicalCache);
    newCache.set(locationId, {
      data,
      timestamp: Date.now(),
      location,
    });
    set({ historicalCache: newCache });
  },

  getCachedHistorical: (locationId) => {
    const cached = get().historicalCache.get(locationId);
    // Historical data is valid for 24 hours
    if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached;
    }
    return undefined;
  },

  clearCache: () =>
    set({
      weatherCache: new Map(),
      historicalCache: new Map(),
    }),

  reset: () =>
    set({
      currentWeather: null,
      currentLocation: null,
      weatherStatus: 'idle',
      weatherError: null,
      historicalData: null,
      historicalStatus: 'idle',
      historicalError: null,
    }),
}));

