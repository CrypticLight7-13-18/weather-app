'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWeather, useHistoricalWeather, useGeolocation, useFavorites } from '@/hooks';
import { useAppStore, useWeatherStore } from '@/stores';
import { reverseGeocode } from '@/lib/api';
import { Location } from '@/types/location';

// Components
import { Header } from '@/components/layout';
import { SearchDialog } from '@/components/search';
import { FavoritesPanel } from '@/components/favorites';
import { SettingsPanel } from '@/components/settings';
import { ErrorSimulationPanel } from '@/components/dev';
import {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherDetails,
  HistoricalChart,
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
  const { weather, location, status, error, isLoading, loadWeather, refresh } = useWeather();
  const { data: historicalData, status: historicalStatus } = useHistoricalWeather();
  const { getCurrentPosition, loading: geoLoading, error: geoError } = useGeolocation();
  const { favorites } = useFavorites();
  const { settings, devMode } = useAppStore();
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

  // Save location when it changes
  useEffect(() => {
    if (location) {
      localStorage.setItem('weather-last-location', JSON.stringify(location));
    }
  }, [location]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
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
              <p className="text-center text-sm text-slate-500 mt-4">
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
                unit={settings.temperatureUnit}
              />

              <HourlyForecast hourly={weather.hourly} />

              <DailyForecast daily={weather.daily} />

              <WeatherDetails
                current={weather.current}
                unit={settings.temperatureUnit}
              />

              {/* Historical chart */}
              {historicalData && historicalStatus === 'success' && (
                <HistoricalChart
                  data={historicalData}
                  unit={settings.temperatureUnit}
                />
              )}
              {historicalStatus === 'loading' && (
                <Card>
                  <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4 skeleton-shimmer" />
                  <SkeletonChart />
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Favorites */}
              <FavoritesPanel onSelect={handleSelectLocation} />

              {/* Settings */}
              <SettingsPanel />

              {/* Dev panel (only shown in dev mode) */}
              {devMode && <ErrorSimulationPanel />}
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
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SkeletonWeatherCard className="h-80" />

        <Card>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 skeleton-shimmer" />
          <SkeletonHourlyForecast />
        </Card>

        <Card>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4 skeleton-shimmer" />
          <SkeletonDailyForecast />
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4 skeleton-shimmer" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl skeleton-shimmer"
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4 skeleton-shimmer" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded skeleton-shimmer" />
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg skeleton-shimmer" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
