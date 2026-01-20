'use client';

import { useState, useCallback } from 'react';
import { GeoLocation, GeolocationError, GEOLOCATION_ERROR_MESSAGES } from '@/types/location';

interface UseGeolocationReturn {
  position: GeoLocation | null;
  error: string | null;
  errorType: GeolocationError | null;
  loading: boolean;
  getCurrentPosition: () => Promise<GeoLocation | null>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = useCallback(async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      const errType: GeolocationError = 'NOT_SUPPORTED';
      setErrorType(errType);
      setError(GEOLOCATION_ERROR_MESSAGES[errType]);
      return null;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location: GeoLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setPosition(location);
          setLoading(false);
          resolve(location);
        },
        (err) => {
          let errType: GeolocationError;
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errType = 'PERMISSION_DENIED';
              break;
            case err.POSITION_UNAVAILABLE:
              errType = 'POSITION_UNAVAILABLE';
              break;
            case err.TIMEOUT:
              errType = 'TIMEOUT';
              break;
            default:
              errType = 'POSITION_UNAVAILABLE';
          }

          setErrorType(errType);
          setError(GEOLOCATION_ERROR_MESSAGES[errType]);
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, []);

  return {
    position,
    error,
    errorType,
    loading,
    getCurrentPosition,
  };
}

