'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeather, useHistoricalWeather, useGeolocation, useFavorites } from '@/hooks';
import { useAppStore, useWeatherStore } from '@/stores';
import { reverseGeocode } from '@/lib/api';
import { Location } from '@/types/location';
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
} from '@/components/weather';
import {
  ErrorState,
  EmptyState,
  SkeletonWeatherCard,
  SkeletonHourlyForecast,
  SkeletonDailyForecast,
  SkeletonChart,
  Card,
} from '@/components/ui';

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hooks
  const { weather, location, error, isLoading, loadWeather, refresh } = useWeather();
  const { data: historicalData, status: historicalStatus } = useHistoricalWeather();
  const { getCurrentPosition, loading: geoLoading, error: geoError } = useGeolocation();
  useFavorites(); // Initialize favorites hook for prefetching
  const { settings, addToHistory, setFirstTimeUser, isFirstTimeUser } = useAppStore();
  const { reset: resetWeather } = useWeatherStore();

  // Auto-detect location on first load
  useEffect(() => {
    const initLocation = async () => {
      // Check if we have a stored location
      const storedLocation = localStorage.getItem('weather-last-location');
      if (storedLocation) {
        try {
          const parsed = JSON.parse(storedLocation);
          loadWeather(parsed);
          setIsInitialized(true);
          return;
        } catch {
          // Invalid stored data, continue to geolocation
        }
      }

      // Try to get user's location
      const position = await getCurrentPosition();
      if (position) {
        const loc = await reverseGeocode(position.latitude, position.longitude);
        if (loc) {
          loadWeather(loc);
          localStorage.setItem('weather-last-location', JSON.stringify(loc));
        }
      }
      setIsInitialized(true);
    };

    initLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save location when it changes and add to history
  useEffect(() => {
    if (location && weather) {
      localStorage.setItem('weather-last-location', JSON.stringify(location));
      
      // Add to browsing history with weather summary
      addToHistory(location, {
        temperature: weather.current.temperature,
        weatherCode: weather.current.weatherCode,
        isDay: weather.current.isDay,
      });

      // Mark as not first time user
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
    (loc: Location) => {
      loadWeather(loc);
      setIsSearchOpen(false);
    },
    [loadWeather]
  );

  const handleDetectLocation = useCallback(async () => {
    const position = await getCurrentPosition();
    if (position) {
      const loc = await reverseGeocode(position.latitude, position.longitude);
      if (loc) {
        loadWeather(loc);
      }
    }
  }, [getCurrentPosition, loadWeather]);

  const showLoading = !isInitialized || (isLoading && !weather);
  const showError = error && !weather;
  const showEmpty = isInitialized && !weather && !isLoading && !error;
  const showContent = weather && location;

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-500 relative',
      // Neumorphic background - clean, soft gray that matches shadows
      'bg-[#e8eef5] dark:bg-slate-900'
    )}>
      {/* Subtle ambient lighting effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-white/30 dark:bg-slate-800/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/40 dark:bg-slate-700/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
      <Header
        onSearchClick={() => setIsSearchOpen(true)}
        onRefresh={refresh}
        onDetectLocation={handleDetectLocation}
        isRefreshing={isLoading && !!weather}
        isDetectingLocation={geoLoading}
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

              {/* Historical chart */}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* World Clock */}
              <WorldClock />

              {/* Favorites */}
              <FavoritesPanel onSelect={handleSelectLocation} />

              {/* Recently Viewed History */}
              <HistoryPanelCompact onSelect={handleSelectLocation} />
            </div>
          </div>
        )}
      </main>

      {/* Search dialog */}
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
