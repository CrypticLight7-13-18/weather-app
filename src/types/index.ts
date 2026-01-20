export * from './weather';
export * from './location';
export * from './api';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  temperatureUnit: TemperatureUnit;
  theme: Theme;
}

export interface AppState {
  currentLocation: import('./location').Location | null;
  favorites: import('./location').Location[];
  recentSearches: import('./location').Location[];
  settings: Settings;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  error: import('./api').ApiError | null;
  status: LoadingState;
}

