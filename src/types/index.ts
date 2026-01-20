export * from './weather';
export * from './location';
export * from './api';

// Unit types
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms' | 'knots';
export type PressureUnit = 'hpa' | 'inhg' | 'mmhg';
export type PrecipitationUnit = 'mm' | 'inch';

export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  pressureUnit: PressureUnit;
  precipitationUnit: PrecipitationUnit;
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
