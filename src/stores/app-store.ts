'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Location } from '@/types/location';
import { Settings, TemperatureUnit, WindSpeedUnit, PressureUnit, PrecipitationUnit, Theme } from '@/types';

interface HistoryEntry {
  location: Location;
  timestamp: number;
  weatherSummary?: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
  };
}

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

  // Browsing history
  browsingHistory: HistoryEntry[];
  addToHistory: (location: Location, weatherSummary?: HistoryEntry['weatherSummary']) => void;
  removeFromHistory: (locationId: string) => void;
  clearHistory: () => void;

  // Settings
  settings: Settings;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  setPressureUnit: (unit: PressureUnit) => void;
  setPrecipitationUnit: (unit: PrecipitationUnit) => void;
  setTheme: (theme: Theme) => void;

  // Selected location (for viewing)
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;

  // Dev mode
  devMode: boolean;
  toggleDevMode: () => void;

  // Reset all data
  resetAllData: () => void;

  // First time user flag
  isFirstTimeUser: boolean;
  setFirstTimeUser: (value: boolean) => void;
}

const DEFAULT_SETTINGS: Settings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  pressureUnit: 'hpa',
  precipitationUnit: 'mm',
  theme: 'system',
};

const MAX_RECENT_SEARCHES = 5;
const MAX_FAVORITES = 10;
const MAX_HISTORY = 20;

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

      // Browsing history
      browsingHistory: [],

      addToHistory: (location, weatherSummary) => {
        const { browsingHistory } = get();
        // Remove if already exists (to move to top)
        const filtered = browsingHistory.filter((h) => h.location.id !== location.id);
        // Create new entry
        const newEntry: HistoryEntry = {
          location,
          timestamp: Date.now(),
          weatherSummary,
        };
        // Add to beginning and limit
        const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
        set({ browsingHistory: updated });
      },

      removeFromHistory: (locationId) => {
        set({
          browsingHistory: get().browsingHistory.filter((h) => h.location.id !== locationId),
        });
      },

      clearHistory: () => set({ browsingHistory: [] }),

      // Settings
      settings: DEFAULT_SETTINGS,
      
      setTemperatureUnit: (unit) => {
        set({
          settings: { ...get().settings, temperatureUnit: unit },
        });
      },

      setWindSpeedUnit: (unit) => {
        set({
          settings: { ...get().settings, windSpeedUnit: unit },
        });
      },

      setPressureUnit: (unit) => {
        set({
          settings: { ...get().settings, pressureUnit: unit },
        });
      },

      setPrecipitationUnit: (unit) => {
        set({
          settings: { ...get().settings, precipitationUnit: unit },
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

      // Reset all data
      resetAllData: () => {
        // Clear localStorage
        localStorage.removeItem('weather-app-storage');
        localStorage.removeItem('weather-last-location');
        
        // Reset all state to defaults
        set({
          favorites: [],
          recentSearches: [],
          browsingHistory: [],
          settings: DEFAULT_SETTINGS,
          selectedLocation: null,
          devMode: false,
          isFirstTimeUser: true,
        });

        // Reload the page to fully reset
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },

      // First time user
      isFirstTimeUser: true,
      setFirstTimeUser: (value) => set({ isFirstTimeUser: value }),
    }),
    {
      name: 'weather-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentSearches: state.recentSearches,
        browsingHistory: state.browsingHistory,
        settings: state.settings,
        devMode: state.devMode,
        isFirstTimeUser: state.isFirstTimeUser,
      }),
    }
  )
);
