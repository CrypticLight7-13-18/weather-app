'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Location } from '@/types/location';
import { Settings, TemperatureUnit, Theme } from '@/types';

interface AppState {
  // Favorites
  favorites: Location[];
  addFavorite: (location: Location) => void;
  removeFavorite: (locationId: string) => void;
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  isFavorite: (locationId: string) => boolean;

  // Recent searches
  recentSearches: Location[];
  addRecentSearch: (location: Location) => void;
  clearRecentSearches: () => void;

  // Settings
  settings: Settings;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setTheme: (theme: Theme) => void;

  // Selected location (for viewing)
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;

  // Dev mode
  devMode: boolean;
  toggleDevMode: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  temperatureUnit: 'celsius',
  theme: 'system',
};

const MAX_RECENT_SEARCHES = 5;
const MAX_FAVORITES = 10;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      
      addFavorite: (location) => {
        const { favorites } = get();
        if (favorites.length >= MAX_FAVORITES) {
          return; // Don't add if at max
        }
        if (favorites.some((f) => f.id === location.id)) {
          return; // Already exists
        }
        set({ favorites: [...favorites, location] });
      },

      removeFavorite: (locationId) => {
        set({
          favorites: get().favorites.filter((f) => f.id !== locationId),
        });
      },

      reorderFavorites: (fromIndex, toIndex) => {
        const { favorites } = get();
        const newFavorites = [...favorites];
        const [removed] = newFavorites.splice(fromIndex, 1);
        newFavorites.splice(toIndex, 0, removed);
        set({ favorites: newFavorites });
      },

      isFavorite: (locationId) => {
        return get().favorites.some((f) => f.id === locationId);
      },

      // Recent searches
      recentSearches: [],
      
      addRecentSearch: (location) => {
        const { recentSearches } = get();
        // Remove if already exists
        const filtered = recentSearches.filter((r) => r.id !== location.id);
        // Add to beginning and limit
        const updated = [location, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        set({ recentSearches: updated });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      // Settings
      settings: DEFAULT_SETTINGS,
      
      setTemperatureUnit: (unit) => {
        set({
          settings: { ...get().settings, temperatureUnit: unit },
        });
      },

      setTheme: (theme) => {
        set({
          settings: { ...get().settings, theme },
        });
      },

      // Selected location
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),

      // Dev mode
      devMode: false,
      toggleDevMode: () => set({ devMode: !get().devMode }),
    }),
    {
      name: 'weather-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        settings: state.settings,
        devMode: state.devMode,
      }),
    }
  )
);

