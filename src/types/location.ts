export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Location extends GeoLocation {
  id: string;
  name: string;
  country: string;
  state?: string;
  displayName: string;
  timezone?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

export type GeolocationError = 
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED';

export const GEOLOCATION_ERROR_MESSAGES: Record<GeolocationError, string> = {
  PERMISSION_DENIED: 'Location access was denied. Please enable location services to use this feature.',
  POSITION_UNAVAILABLE: 'Unable to determine your location. Please try again or search for a location manually.',
  TIMEOUT: 'Location request timed out. Please check your connection and try again.',
  NOT_SUPPORTED: 'Geolocation is not supported by your browser. Please search for a location manually.',
};

