'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWeather, useHistoricalWeather, useGeolocation, useFavorites, useIsMobileOrTablet } from '@/hooks';
import { useAppStore, useWeatherStore } from '@/stores';
import { reverseGeocode, fetchWeatherData } from '@/lib/api';
import { Location } from '@/types/location';
import { WeatherData } from '@/types/weather';
import { cn } from '@/lib/utils';

// Components
import { Header } from '@/components/layout';
import { SearchDialog } from '@/components/search';
import { FavoritesPanel } from '@/components/favorites';
import { HistoryPanelCompact } from '@/components/history';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherDetails,
  HistoricalChart,
  WorldClock,
  MobileWeatherCarousel,
  LocationListModal,
} from '@/components/weather';
import {
  ErrorState,
  EmptyState,
  SkeletonWeatherCard,
  SkeletonHourlyForecast,
  SkeletonDailyForecast,
  SkeletonChart,
  Card,
  ToastContainer,
  useToast,
} from '@/components/ui';

// Status types for better state management
type LocationStatus = 'idle' | 'detecting' | 'geocoding' | 'success' | 'error';
type RefreshStatus = 'idle' | 'refreshing' | 'success' | 'error';

interface LocationWeatherState {
  location: Location;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  isMyLocation?: boolean;
}

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationListOpen, setIsLocationListOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>('idle');
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [mobileLocations, setMobileLocations] = useState<LocationWeatherState[]>([]);
  const [mobileSavedLocations, setMobileSavedLocations] = useState<Location[]>([]);
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [hasValidGeolocation, setHasValidGeolocation] = useState(false);
  const [mobileLocationsLoaded, setMobileLocationsLoaded] = useState(false);
  const locationToastId = useRef<string | null>(null);

  // Check if mobile/tablet
  const isMobileOrTablet = useIsMobileOrTablet();

  // Hooks
  const { weather, location, error, isLoading, loadWeather, refresh } = useWeather();
  const { data: historicalData, status: historicalStatus } = useHistoricalWeather();
  const { getCurrentPosition, error: geoError, errorType: geoErrorType } = useGeolocation();
  useFavorites(); // Initialize favorites hook for prefetching
  const { settings, addToHistory, setFirstTimeUser, isFirstTimeUser } = useAppStore();
  const { reset: resetWeather } = useWeatherStore();
  const toast = useToast();

  // Load mobile saved locations from localStorage on mount
  useEffect(() => {
    if (!isMobileOrTablet) return;
    
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('weather-mobile-locations');
        if (saved) {
          const parsed = JSON.parse(saved) as Location[];
          setMobileSavedLocations(parsed);
        }
      } catch {
        // Invalid data, ignore
      }
      setMobileLocationsLoaded(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isMobileOrTablet]);

  // Save mobile locations to localStorage when they change
  useEffect(() => {
    if (!isMobileOrTablet || !mobileLocationsLoaded) return;
    
    try {
      localStorage.setItem('weather-mobile-locations', JSON.stringify(mobileSavedLocations));
    } catch {
      // Storage error, ignore
    }
  }, [mobileSavedLocations, isMobileOrTablet, mobileLocationsLoaded]);

  // Build mobile locations array from my location + saved mobile locations
  useEffect(() => {
    if (!isMobileOrTablet || !mobileLocationsLoaded) return;
    
    const buildMobileLocations = () => {
      const locations: LocationWeatherState[] = [];

      // Add "My Location" ONLY if we have valid geolocation
      if (myLocation && hasValidGeolocation) {
        const existingMyLoc = mobileLocations.find(l => l.isMyLocation);
        locations.push({
          location: myLocation,
          weather: existingMyLoc?.weather || null,
          isLoading: existingMyLoc?.isLoading ?? true,
          error: existingMyLoc?.error || null,
          isMyLocation: true,
        });
      }

      // Add saved mobile locations (exclude if same as "My Location")
      for (const savedLoc of mobileSavedLocations) {
        // Skip if this location is the same as "My Location"
        if (myLocation && hasValidGeolocation) {
          const latDiff = Math.abs(savedLoc.latitude - myLocation.latitude);
          const lonDiff = Math.abs(savedLoc.longitude - myLocation.longitude);
          if (latDiff < 0.01 && lonDiff < 0.01) {
            continue;
          }
        }
        
        const existing = mobileLocations.find(l => l.location.id === savedLoc.id && !l.isMyLocation);
        locations.push({
          location: savedLoc,
          weather: existing?.weather || null,
          isLoading: existing?.isLoading ?? true,
          error: existing?.error || null,
          isMyLocation: false,
        });
      }

      setMobileLocations(locations);
    };

    buildMobileLocations();
    // Note: mobileLocations is intentionally excluded to preserve weather data
  }, [myLocation, hasValidGeolocation, mobileSavedLocations, isMobileOrTablet, mobileLocationsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch weather for mobile locations - triggered when locations change
  useEffect(() => {
    const fetchMobileWeather = async () => {
      if (!isMobileOrTablet || mobileLocations.length === 0) return;

      // Find locations that need weather data
      const locationsNeedingWeather = mobileLocations.filter(
        loc => !loc.weather && !loc.error && loc.isLoading
      );

      if (locationsNeedingWeather.length === 0) return;

      // Fetch weather for each location that needs it
      for (const loc of locationsNeedingWeather) {
        try {
          const weatherData = await fetchWeatherData({
            latitude: loc.location.latitude,
            longitude: loc.location.longitude,
            timezone: loc.location.timezone,
          });
          
          setMobileLocations(prev => prev.map(l => 
            l.location.id === loc.location.id && l.isMyLocation === loc.isMyLocation
              ? { ...l, weather: weatherData, isLoading: false }
              : l
          ));
        } catch {
          setMobileLocations(prev => prev.map(l => 
            l.location.id === loc.location.id && l.isMyLocation === loc.isMyLocation
              ? { ...l, error: 'Failed to load weather', isLoading: false }
              : l
          ));
        }
      }
    };

    fetchMobileWeather();
  }, [mobileLocations.length, isMobileOrTablet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-detect location on first load
  useEffect(() => {
    const initLocation = async () => {
      // For desktop: Check if we have a stored location for initial display
      if (!isMobileOrTablet) {
        const storedLocation = localStorage.getItem('weather-last-location');
        if (storedLocation) {
          try {
            const parsed = JSON.parse(storedLocation);
            loadWeather(parsed);
            // Don't set as "My Location" - it's just the last viewed location
            setIsInitialized(true);
            // Still try geolocation in background for future use
          } catch {
            // Invalid stored data, continue to geolocation
          }
        }
      }

      // Try to get user's actual location via geolocation
      setLocationStatus('detecting');
      
      // Only show toast if we don't have any stored location
      const hasStoredDesktop = !isMobileOrTablet && localStorage.getItem('weather-last-location');
      const toastId = hasStoredDesktop ? null : toast.loading('Detecting location...', 'Please wait');
      if (toastId) locationToastId.current = toastId;

      const position = await getCurrentPosition();
      
      if (position) {
        if (toastId) {
          setLocationStatus('geocoding');
          toast.update(toastId, { message: 'Finding your city...' });
        }
        
        const loc = await reverseGeocode(position.latitude, position.longitude);
        if (loc) {
          loadWeather(loc);
          setMyLocation(loc);
          setHasValidGeolocation(true);
          localStorage.setItem('weather-last-location', JSON.stringify(loc));
          localStorage.setItem('weather-my-location', JSON.stringify(loc)); // Separate key for geolocation
          setLocationStatus('success');
          if (toastId) {
            toast.update(toastId, { 
              type: 'success', 
              message: 'Location found',
              description: loc.displayName 
            });
          }
        } else {
          setLocationStatus('error');
          setHasValidGeolocation(false);
          if (toastId) {
            toast.update(toastId, { 
              type: 'error', 
              message: 'Could not find city',
              description: 'Try searching manually' 
            });
          }
        }
      } else {
        setLocationStatus('error');
        setHasValidGeolocation(false);
        
        // Show error notification
        const errorMessages: Record<string, { message: string; description: string }> = {
          PERMISSION_DENIED: { 
            message: 'Location access denied', 
            description: 'Enable in browser settings or search manually' 
          },
          POSITION_UNAVAILABLE: { 
            message: 'Location unavailable', 
            description: 'Try again or search for a city' 
          },
          TIMEOUT: { 
            message: 'Location timed out', 
            description: 'Check connection and try again' 
          },
          NOT_SUPPORTED: { 
            message: 'Location not supported', 
            description: 'Please search for a city' 
          },
        };
        const errInfo = geoErrorType 
          ? errorMessages[geoErrorType] 
          : { message: 'Location failed', description: 'Please search for a city' };
        
        if (toastId) {
          toast.update(toastId, { 
            type: 'error', 
            message: errInfo.message,
            description: errInfo.description 
          });
        } else if (isMobileOrTablet) {
          // On mobile, always show error if geolocation fails
          toast.error(errInfo.message, errInfo.description);
        }
      }
      
      setIsInitialized(true);
      locationToastId.current = null;
    };

    initLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save location when it changes and add to history
  useEffect(() => {
    if (location && weather) {
      localStorage.setItem('weather-last-location', JSON.stringify(location));
      
      addToHistory(location, {
        temperature: weather.current.temperature,
        weatherCode: weather.current.weatherCode,
        isDay: weather.current.isDay,
      });

      if (isFirstTimeUser) {
        setFirstTimeUser(false);
      }
    }
  }, [location?.id, weather?.current.temperature]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectLocation = useCallback(
    async (loc: Location) => {
      loadWeather(loc);
      setIsSearchOpen(false);
      toast.success('Location updated', loc.displayName);

      // For mobile, add the location if it doesn't exist
      if (isMobileOrTablet) {
        // Check for existing location by coordinates (within ~1km)
        const existingIndex = mobileLocations.findIndex(l => {
          const latDiff = Math.abs(l.location.latitude - loc.latitude);
          const lonDiff = Math.abs(l.location.longitude - loc.longitude);
          return latDiff < 0.01 && lonDiff < 0.01;
        });
        
        if (existingIndex >= 0) {
          // Location exists, navigate to it
          setCurrentMobileIndex(existingIndex);
        } else {
          // Generate a unique ID for persistence
          const uniqueId = `${loc.id}-${Date.now()}`;
          const newLocation: Location = { ...loc, id: uniqueId };
          
          // Add to saved locations for persistence
          setMobileSavedLocations(prev => {
            // Check if already saved (by coordinates)
            const alreadyExists = prev.some(l => {
              const latDiff = Math.abs(l.latitude - loc.latitude);
              const lonDiff = Math.abs(l.longitude - loc.longitude);
              return latDiff < 0.01 && lonDiff < 0.01;
            });
            if (alreadyExists) return prev;
            return [newLocation, ...prev];
          });
          
          // Add to display list immediately with loading state
          const hasMyLocation = mobileLocations.some(l => l.isMyLocation);
          const newIndex = hasMyLocation ? 1 : 0;
          
          setMobileLocations(prev => {
            const newLocationState: LocationWeatherState = {
              location: newLocation,
              weather: null,
              isLoading: true,
              error: null,
              isMyLocation: false,
            };
            const myLocIndex = prev.findIndex(l => l.isMyLocation);
            if (myLocIndex >= 0) {
              const newList = [...prev];
              newList.splice(myLocIndex + 1, 0, newLocationState);
              return newList;
            }
            return [newLocationState, ...prev];
          });
          
          setCurrentMobileIndex(newIndex);

          // Fetch weather for the new location
          try {
            const weatherData = await fetchWeatherData({
              latitude: loc.latitude,
              longitude: loc.longitude,
              timezone: loc.timezone,
            });
            
            setMobileLocations(prev => prev.map(l => 
              l.location.id === uniqueId
                ? { ...l, weather: weatherData, isLoading: false }
                : l
            ));
          } catch {
            setMobileLocations(prev => prev.map(l => 
              l.location.id === uniqueId
                ? { ...l, error: 'Failed to load weather', isLoading: false }
                : l
            ));
          }
        }
      }
    },
    [loadWeather, toast, isMobileOrTablet, mobileLocations]
  );

  const handleDetectLocation = useCallback(async () => {
    setLocationStatus('detecting');
    const toastId = toast.loading('Detecting location...', 'Please wait');
    
    const position = await getCurrentPosition();
    
    if (position) {
      setLocationStatus('geocoding');
      toast.update(toastId, { message: 'Finding your city...' });
      
      const loc = await reverseGeocode(position.latitude, position.longitude);
      if (loc) {
        loadWeather(loc);
        setMyLocation(loc);
        setHasValidGeolocation(true);
        localStorage.setItem('weather-my-location', JSON.stringify(loc));
        setLocationStatus('success');
        toast.update(toastId, { 
          type: 'success', 
          message: 'Location updated',
          description: loc.displayName 
        });

        // Update mobile locations - add or update "My Location"
        if (isMobileOrTablet) {
          setMobileLocations(prev => {
            const myLocIndex = prev.findIndex(l => l.isMyLocation);
            if (myLocIndex >= 0) {
              // Update existing
              const updated = [...prev];
              updated[myLocIndex] = {
                ...updated[myLocIndex],
                location: loc,
                weather: null,
                isLoading: true,
                error: null,
              };
              return updated;
            } else {
              // Add new "My Location" at start
              return [{
                location: loc,
                weather: null,
                isLoading: true,
                error: null,
                isMyLocation: true,
              }, ...prev];
            }
          });
          setCurrentMobileIndex(0);
        }
      } else {
        setLocationStatus('error');
        toast.update(toastId, { 
          type: 'error', 
          message: 'Could not find city',
          description: 'Try searching manually' 
        });
      }
    } else {
      setLocationStatus('error');
      const errorMessages: Record<string, { message: string; description: string }> = {
        PERMISSION_DENIED: { 
          message: 'Location access denied', 
          description: 'Enable in browser settings' 
        },
        POSITION_UNAVAILABLE: { 
          message: 'Location unavailable', 
          description: 'Try again later' 
        },
        TIMEOUT: { 
          message: 'Request timed out', 
          description: 'Check your connection' 
        },
        NOT_SUPPORTED: { 
          message: 'Not supported', 
          description: 'Search for a city instead' 
        },
      };
      const errInfo = geoErrorType 
        ? errorMessages[geoErrorType] 
        : { message: 'Detection failed', description: 'Try searching' };
      
      toast.update(toastId, { 
        type: 'error', 
        message: errInfo.message,
        description: errInfo.description 
      });
    }
    
    setTimeout(() => setLocationStatus('idle'), 2000);
  }, [getCurrentPosition, loadWeather, toast, geoErrorType, isMobileOrTablet]);

  const handleRefresh = useCallback(async () => {
    if (!weather && mobileLocations.length === 0) return;
    
    setRefreshStatus('refreshing');
    const toastId = toast.loading('Refreshing...', 'Fetching latest data');
    
    try {
      if (isMobileOrTablet && mobileLocations.length > 0) {
        // Refresh current mobile location
        const currentLoc = mobileLocations[currentMobileIndex];
        if (currentLoc) {
          const weatherData = await fetchWeatherData({
            latitude: currentLoc.location.latitude,
            longitude: currentLoc.location.longitude,
            timezone: currentLoc.location.timezone,
          });
          setMobileLocations(prev => {
            const updated = [...prev];
            updated[currentMobileIndex] = {
              ...updated[currentMobileIndex],
              weather: weatherData,
              isLoading: false,
              error: null,
            };
            return updated;
          });
        }
      } else {
        await refresh();
      }
      
      setRefreshStatus('success');
      toast.update(toastId, { 
        type: 'success', 
        message: 'Updated',
        description: 'Weather data refreshed' 
      });
    } catch {
      setRefreshStatus('error');
      toast.update(toastId, { 
        type: 'error', 
        message: 'Refresh failed',
        description: 'Please try again' 
      });
    }
    
    setTimeout(() => setRefreshStatus('idle'), 2000);
  }, [weather, refresh, toast, isMobileOrTablet, mobileLocations, currentMobileIndex]);

  const handleRemoveMobileLocation = useCallback((locationId: string) => {
    // Find the location to get its coordinates for matching
    const locationToRemove = mobileLocations.find(l => l.location.id === locationId && !l.isMyLocation);
    if (!locationToRemove) return;
    
    // Remove from saved locations (match by coordinates for robustness)
    setMobileSavedLocations(prev => prev.filter(l => {
      const latDiff = Math.abs(l.latitude - locationToRemove.location.latitude);
      const lonDiff = Math.abs(l.longitude - locationToRemove.location.longitude);
      return latDiff >= 0.01 || lonDiff >= 0.01; // Keep if coordinates differ
    }));
    
    // Remove from display list
    setMobileLocations(prev => {
      const index = prev.findIndex(l => l.location.id === locationId && !l.isMyLocation);
      if (index === -1) return prev;
      
      const newList = prev.filter(l => l.location.id !== locationId || l.isMyLocation);
      
      // Adjust current index if needed
      if (currentMobileIndex >= newList.length) {
        setCurrentMobileIndex(Math.max(0, newList.length - 1));
      } else if (currentMobileIndex > index) {
        setCurrentMobileIndex(currentMobileIndex - 1);
      }
      
      return newList;
    });
    
    toast.success('Location removed');
  }, [currentMobileIndex, toast, mobileLocations]);

  const handleReorderMobileLocations = useCallback((fromIndex: number, toIndex: number) => {
    setMobileLocations(prev => {
      const newList = [...prev];
      const [removed] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, removed);
      
      // Update saved locations order (excluding My Location)
      const savedOrder = newList
        .filter(l => !l.isMyLocation)
        .map(l => l.location);
      setMobileSavedLocations(savedOrder);
      
      // Adjust current index to follow the moved item if it was selected
      if (currentMobileIndex === fromIndex) {
        setCurrentMobileIndex(toIndex);
      } else if (fromIndex < currentMobileIndex && toIndex >= currentMobileIndex) {
        setCurrentMobileIndex(currentMobileIndex - 1);
      } else if (fromIndex > currentMobileIndex && toIndex <= currentMobileIndex) {
        setCurrentMobileIndex(currentMobileIndex + 1);
      }
      
      return newList;
    });
  }, [currentMobileIndex]);

  const showLoading = !isInitialized || (isLoading && !weather);
  const showError = error && !weather;
  const showEmpty = isInitialized && !weather && !isLoading && !error;
  const showContent = weather && location;

  const isDetectingLocation = locationStatus === 'detecting' || locationStatus === 'geocoding';
  const isRefreshing = refreshStatus === 'refreshing' || (isLoading && !!weather);

  // Get weather condition for background gradient
  const getBackgroundGradient = () => {
    if (!weather) return 'from-slate-800 to-slate-900';
    
    const code = weather.current.weatherCode;
    const isDay = weather.current.isDay;
    
    // Clear/Sunny
    if ([0, 1].includes(code)) {
      return isDay 
        ? 'from-sky-400 via-blue-500 to-blue-600' 
        : 'from-indigo-900 via-slate-900 to-slate-950';
    }
    // Partly cloudy
    if (code === 2) {
      return isDay 
        ? 'from-blue-400 via-slate-400 to-slate-500' 
        : 'from-slate-700 via-slate-800 to-slate-900';
    }
    // Cloudy
    if (code === 3) {
      return 'from-slate-500 via-slate-600 to-slate-700';
    }
    // Rain
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return 'from-slate-600 via-slate-700 to-slate-800';
    }
    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return 'from-slate-300 via-slate-400 to-slate-500';
    }
    // Thunderstorm
    if ([95, 96, 99].includes(code)) {
      return 'from-slate-700 via-purple-900 to-slate-900';
    }
    
    return 'from-slate-700 to-slate-800';
  };

  // Mobile/Tablet View
  if (isMobileOrTablet) {
    const currentWeather = mobileLocations[currentMobileIndex]?.weather;
    const mobileGradient = currentWeather 
      ? getBackgroundGradient() 
      : 'from-slate-800 to-slate-900';

  return (
      <div className={cn(
        'min-h-screen transition-all duration-700 relative',
        'bg-linear-to-b',
        mobileGradient
      )}>
        <ToastContainer />

        {/* Mobile header - simplified */}
        <div className="fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between">
          <button
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className={cn(
              'p-2 rounded-full transition-colors',
              'bg-white/10 hover:bg-white/20',
              isDetectingLocation && 'animate-pulse'
            )}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="pt-16">
          {mobileLocations.length > 0 ? (
            <MobileWeatherCarousel
              locations={mobileLocations}
              currentIndex={currentMobileIndex}
              onIndexChange={setCurrentMobileIndex}
              onAddLocation={() => setIsSearchOpen(true)}
              onShowLocationList={() => setIsLocationListOpen(true)}
              settings={settings}
              historicalData={historicalData}
              historicalStatus={historicalStatus}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
              {showLoading ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
                  <div className="w-40 h-6 bg-white/10 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-white mb-2">No Location</h2>
                  <p className="text-white/60 mb-6 max-w-xs">
                    Search for a city or detect your location to see weather
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className={cn(
                        'px-5 py-2.5 rounded-xl font-medium transition-colors',
                        'bg-white/20 text-white hover:bg-white/30'
                      )}
                    >
                      Detect Location
                    </button>
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="px-5 py-2.5 rounded-xl font-medium bg-white text-slate-800 hover:bg-white/90 transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Location list modal */}
        <LocationListModal
          isOpen={isLocationListOpen}
          onClose={() => setIsLocationListOpen(false)}
          locations={mobileLocations}
          currentIndex={currentMobileIndex}
          onSelectLocation={setCurrentMobileIndex}
          onRemoveLocation={handleRemoveMobileLocation}
          onReorderLocations={handleReorderMobileLocations}
          onAddLocation={() => {
            setIsLocationListOpen(false);
            setIsSearchOpen(true);
          }}
          settings={settings}
        />

        {/* Search dialog */}
        {isSearchOpen && (
          <SearchDialog
            onSelect={handleSelectLocation}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>
    );
  }

  // Desktop View (original)
  return (
    <div className={cn(
      'min-h-screen transition-colors duration-500 relative',
      'bg-[#e8eef5] dark:bg-slate-900'
    )}>
      <ToastContainer />

      {/* Subtle ambient lighting effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-white/30 dark:bg-slate-800/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/40 dark:bg-slate-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Header
          onSearchClick={() => setIsSearchOpen(true)}
          onRefresh={handleRefresh}
          onDetectLocation={handleDetectLocation}
          isRefreshing={isRefreshing}
          isDetectingLocation={isDetectingLocation}
          locationStatus={locationStatus}
          refreshStatus={refreshStatus}
        />

        <main className="max-w-6xl mx-auto px-4 py-6">
          {showLoading && <LoadingSkeleton />}

          {showError && (
            <div className="max-w-lg mx-auto py-12">
              <ErrorState
                error={error}
                onRetry={() => {
                  resetWeather();
                  handleDetectLocation();
                }}
              />
              {geoError && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                  {geoError}
                </p>
              )}
            </div>
          )}

          {showEmpty && (
            <div className="max-w-lg mx-auto py-12">
              <EmptyState
                variant="location"
                action={{
                  label: 'Search for a location',
                  onClick: () => setIsSearchOpen(true),
                }}
                secondaryAction={{
                  label: 'Detect my location',
                  onClick: handleDetectLocation,
                }}
              />
        </div>
          )}

          {showContent && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content column */}
              <div className="lg:col-span-2 space-y-6">
                <CurrentWeather
                  weather={weather}
                  location={location}
                  settings={settings}
                />

                <HourlyForecast
                  hourly={weather.hourly}
                  temperatureUnit={settings.temperatureUnit}
                />

                <DailyForecast
                  daily={weather.daily}
                  temperatureUnit={settings.temperatureUnit}
                />

                <WeatherDetails
                  current={weather.current}
                  settings={settings}
                />

                {historicalData && historicalStatus === 'success' && (
                  <HistoricalChart
                    data={historicalData}
                    settings={settings}
                  />
                )}
                {historicalStatus === 'loading' && (
                  <Card>
                    <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
                    <SkeletonChart />
                  </Card>
                )}
              </div>

              {/* Sidebar - Desktop only */}
              <div className="space-y-6">
                <WorldClock />
                <FavoritesPanel onSelect={handleSelectLocation} />
                <HistoryPanelCompact onSelect={handleSelectLocation} />
              </div>
        </div>
          )}
      </main>

        {isSearchOpen && (
          <SearchDialog
            onSelect={handleSelectLocation}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SkeletonWeatherCard className="h-80" />

        <Card>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <SkeletonHourlyForecast />
        </Card>

        <Card>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <SkeletonDailyForecast />
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
