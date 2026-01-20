'use client';

import { useCallback, useEffect } from 'react';
import { useWeatherStore } from '@/stores';
import { fetchWeatherData, fetchHistoricalData } from '@/lib/api';
import { Location } from '@/types/location';
import { ApiError } from '@/types/api';

export function useWeather() {
  const {
    currentWeather,
    currentLocation,
    weatherStatus,
    weatherError,
    setCurrentWeather,
    setWeatherStatus,
    setWeatherError,
    getCachedWeather,
    cacheWeather,
  } = useWeatherStore();

  const loadWeather = useCallback(
    async (location: Location, skipCache = false) => {
      const locationId = location.id;

      // Check cache first
      if (!skipCache) {
        const cached = getCachedWeather(locationId);
        if (cached) {
          setCurrentWeather(cached.data, cached.location);
          return;
        }
      }

      setWeatherStatus('loading');
      setWeatherError(null);

      try {
        // Always fetch in metric units - conversion happens in display
        const data = await fetchWeatherData({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        setCurrentWeather(data, location);
        cacheWeather(locationId, data, location);
      } catch (error) {
        setWeatherError(error as ApiError);
      }
    },
    [
      getCachedWeather,
      setCurrentWeather,
      setWeatherStatus,
      setWeatherError,
      cacheWeather,
    ]
  );

  const refresh = useCallback(() => {
    if (currentLocation) {
      loadWeather(currentLocation, true);
    }
  }, [currentLocation, loadWeather]);

  return {
    weather: currentWeather,
    location: currentLocation,
    status: weatherStatus,
    error: weatherError,
    isLoading: weatherStatus === 'loading',
    loadWeather,
    refresh,
  };
}

export function useHistoricalWeather() {
  const {
    historicalData,
    historicalStatus,
    historicalError,
    setHistoricalData,
    setHistoricalStatus,
    setHistoricalError,
    getCachedHistorical,
    cacheHistorical,
  } = useWeatherStore();

  const { location: currentLocation } = useWeather();

  const loadHistoricalData = useCallback(
    async (location: Location, days = 30, skipCache = false) => {
      const locationId = location.id;

      // Check cache first
      if (!skipCache) {
        const cached = getCachedHistorical(locationId);
        if (cached) {
          setHistoricalData(cached.data);
          return;
        }
      }

      setHistoricalStatus('loading');
      setHistoricalError(null);

      try {
        // Always fetch in metric units - conversion happens in display
        const data = await fetchHistoricalData({
          latitude: location.latitude,
          longitude: location.longitude,
          days,
        });

        setHistoricalData(data);
        cacheHistorical(locationId, data, location);
      } catch (error) {
        setHistoricalError(error as ApiError);
      }
    },
    [
      getCachedHistorical,
      setHistoricalData,
      setHistoricalStatus,
      setHistoricalError,
      cacheHistorical,
    ]
  );

  // Auto-load when location changes
  useEffect(() => {
    if (currentLocation) {
      loadHistoricalData(currentLocation);
    }
  }, [currentLocation?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: historicalData,
    status: historicalStatus,
    error: historicalError,
    isLoading: historicalStatus === 'loading',
    loadHistoricalData,
  };
}
