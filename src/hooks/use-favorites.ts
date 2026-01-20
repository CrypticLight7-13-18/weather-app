'use client';

import { useCallback, useEffect } from 'react';
import { useAppStore, useWeatherStore } from '@/stores';
import { fetchWeatherData } from '@/lib/api';
import { Location } from '@/types/location';
import { WeatherData } from '@/types/weather';

export function useFavorites() {
  const {
    favorites,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    isFavorite,
    settings,
  } = useAppStore();

  const { cacheWeather, getCachedWeather } = useWeatherStore();

  // Optimistic add with prefetch
  const addFavoriteOptimistic = useCallback(
    async (location: Location) => {
      // Optimistically add to favorites
      addFavorite(location);

      // Prefetch weather data in background
      try {
        const data = await fetchWeatherData({
          latitude: location.latitude,
          longitude: location.longitude,
          temperatureUnit: settings.temperatureUnit,
        });
        cacheWeather(location.id, data, location);
      } catch {
        // Silently fail prefetch - will retry when user views
      }
    },
    [addFavorite, cacheWeather, settings.temperatureUnit]
  );

  // Optimistic remove
  const removeFavoriteOptimistic = useCallback(
    (locationId: string) => {
      removeFavorite(locationId);
    },
    [removeFavorite]
  );

  // Get cached weather for a favorite
  const getFavoriteWeather = useCallback(
    (locationId: string): WeatherData | null => {
      const cached = getCachedWeather(locationId);
      return cached?.data || null;
    },
    [getCachedWeather]
  );

  // Prefetch all favorites on mount
  useEffect(() => {
    const prefetchFavorites = async () => {
      for (const favorite of favorites) {
        // Skip if already cached
        if (getCachedWeather(favorite.id)) continue;

        try {
          const data = await fetchWeatherData({
            latitude: favorite.latitude,
            longitude: favorite.longitude,
            temperatureUnit: settings.temperatureUnit,
          });
          cacheWeather(favorite.id, data, favorite);
        } catch {
          // Silently fail
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    if (favorites.length > 0) {
      prefetchFavorites();
    }
  }, [favorites.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    favorites,
    addFavorite: addFavoriteOptimistic,
    removeFavorite: removeFavoriteOptimistic,
    reorderFavorites,
    isFavorite,
    getFavoriteWeather,
  };
}

