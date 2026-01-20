'use client';

import { useCallback, useEffect } from 'react';
import { useAppStore, useWeatherStore } from '@/stores';
import { fetchWeatherData } from '@/lib/api';
import { Location } from '@/types/location';
import { WeatherData } from '@/types/weather';

export function useFavorites() {
  const favorites = useAppStore((state) => state.favorites);
  const addFavoriteStore = useAppStore((state) => state.addFavorite);
  const removeFavoriteStore = useAppStore((state) => state.removeFavorite);
  const reorderFavorites = useAppStore((state) => state.reorderFavorites);

  const { cacheWeather, getCachedWeather } = useWeatherStore();

  // Create a reactive isFavorite check using the favorites array
  const isFavorite = useCallback(
    (locationId: string): boolean => {
      return favorites.some((f) => f.id === locationId);
    },
    [favorites]
  );

  // Optimistic add with prefetch
  const addFavorite = useCallback(
    async (location: Location) => {
      // Optimistically add to favorites
      addFavoriteStore(location);

      // Prefetch weather data in background
      try {
        const data = await fetchWeatherData({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        cacheWeather(location.id, data, location);
      } catch {
        // Silently fail prefetch - will retry when user views
      }
    },
    [addFavoriteStore, cacheWeather]
  );

  // Optimistic remove
  const removeFavorite = useCallback(
    (locationId: string) => {
      removeFavoriteStore(locationId);
    },
    [removeFavoriteStore]
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
    addFavorite,
    removeFavorite,
    reorderFavorites,
    isFavorite,
    getFavoriteWeather,
  };
}
