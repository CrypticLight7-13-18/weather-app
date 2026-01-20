'use client';

import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/button';
import { useTheme } from '@/hooks';
import { useAppStore } from '@/stores';
import { Search, Sun, Moon, RefreshCw, MapPin, Settings, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toggle } from '@/components/ui/toggle';
import { TemperatureUnit, WindSpeedUnit, PressureUnit, PrecipitationUnit, Theme } from '@/types';

interface HeaderProps {
  onSearchClick: () => void;
  onRefresh: () => void;
  onDetectLocation: () => void;
  isRefreshing?: boolean;
  isDetectingLocation?: boolean;
  className?: string;
}

export function Header({
  onSearchClick,
  onRefresh,
  onDetectLocation,
  isRefreshing,
  isDetectingLocation,
  className,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    settings,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setPrecipitationUnit,
  } = useAppStore();

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSettingsOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };
    if (isSettingsOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isSettingsOpen]);

  const ThemeIcon = theme === 'dark' ? Moon : Sun;
  
  // Simple toggle between light and dark only (system option only in settings)
  const toggleLightDark = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const temperatureOptions = [
    { value: 'celsius' as TemperatureUnit, label: '°C' },
    { value: 'fahrenheit' as TemperatureUnit, label: '°F' },
  ];

  const windSpeedOptions = [
    { value: 'kmh' as WindSpeedUnit, label: 'km/h' },
    { value: 'mph' as WindSpeedUnit, label: 'mph' },
    { value: 'ms' as WindSpeedUnit, label: 'm/s' },
  ];

  const pressureOptions = [
    { value: 'hpa' as PressureUnit, label: 'hPa' },
    { value: 'inhg' as PressureUnit, label: 'inHg' },
  ];

  const precipitationOptions = [
    { value: 'mm' as PrecipitationUnit, label: 'mm' },
    { value: 'inch' as PrecipitationUnit, label: 'in' },
  ];

  const themeOptions = [
    { value: 'light' as Theme, label: '☀️' },
    { value: 'dark' as Theme, label: '🌙' },
    { value: 'system' as Theme, label: '💻' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        // Neumorphic header - matches background
        'bg-[#e8eef5]/95 dark:bg-slate-900/95',
        'backdrop-blur-xl',
        'border-b border-white/50 dark:border-slate-700/30',
        'shadow-[0_4px_20px_rgba(163,177,198,0.3)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
        'px-4 py-3',
        className
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-linear-to-br from-sky-400 to-blue-600',
            'shadow-lg shadow-blue-500/30'
          )}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              Weather
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              by Open-Meteo
            </p>
          </div>
        </div>

        {/* Search bar (clickable on mobile) */}
        <button
          onClick={onSearchClick}
          className={cn(
            'flex-1 max-w-md flex items-center gap-3 px-4 py-2.5 rounded-2xl',
            // Neumorphic inset search bar
            'bg-[#e8eef5] dark:bg-slate-800',
            'shadow-[inset_3px_3px_6px_rgba(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.8)]',
            'dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.4),inset_-3px_-3px_6px_rgba(60,70,85,0.2)]',
            'text-slate-500 dark:text-slate-400',
            'hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]',
            'dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(60,70,85,0.2)]',
            'transition-all duration-200'
          )}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search for a city...</span>
          <kbd className={cn(
            'hidden md:inline-flex ml-auto px-2 py-0.5 rounded text-xs font-medium',
            'bg-white border border-slate-200 text-slate-400',
            'dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500'
          )}>
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <IconButton
            label="Detect my location"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className={cn(
              isDetectingLocation && 'animate-pulse',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <MapPin className={cn(
              'h-5 w-5',
              isDetectingLocation ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
            )} />
          </IconButton>
          
          <IconButton
            label="Refresh weather"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={cn(
              'h-5 w-5 text-slate-500 dark:text-slate-400',
              isRefreshing && 'animate-spin'
            )} />
          </IconButton>
          
          <IconButton
            label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleLightDark}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ThemeIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </IconButton>

          {/* Settings button */}
          <div className="relative">
            <IconButton
              ref={buttonRef}
              label="Settings"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={cn(
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                isSettingsOpen && 'bg-slate-100 dark:bg-slate-800'
              )}
            >
              <Settings className={cn(
                'h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform duration-200',
                isSettingsOpen && 'rotate-90'
              )} />
            </IconButton>

            {/* Settings popover */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  ref={settingsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-72 p-4 rounded-3xl',
                    // Glassmorphism
                    'bg-white/80 dark:bg-slate-900/80',
                    'backdrop-blur-2xl backdrop-saturate-200',
                    'border border-white/50 dark:border-white/10',
                    'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.5)]',
                    'dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]',
                    'z-50'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Settings</h3>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Settings content */}
                  <div className="space-y-4">
                    {/* Theme */}
                    <SettingRow label="Theme">
                      <Toggle
                        options={themeOptions}
                        value={theme}
                        onChange={setTheme}
                        size="sm"
                      />
                    </SettingRow>

                    {/* Temperature */}
                    <SettingRow label="Temperature">
                      <Toggle
                        options={temperatureOptions}
                        value={settings.temperatureUnit}
                        onChange={setTemperatureUnit}
                        size="sm"
                      />
                    </SettingRow>

                    {/* Wind Speed */}
                    <SettingRow label="Wind Speed">
                      <Toggle
                        options={windSpeedOptions}
                        value={settings.windSpeedUnit}
                        onChange={setWindSpeedUnit}
                        size="sm"
                      />
                    </SettingRow>

                    {/* Pressure */}
                    <SettingRow label="Pressure">
                      <Toggle
                        options={pressureOptions}
                        value={settings.pressureUnit}
                        onChange={setPressureUnit}
                        size="sm"
                      />
                    </SettingRow>

                    {/* Precipitation */}
                    <SettingRow label="Precipitation">
                      <Toggle
                        options={precipitationOptions}
                        value={settings.precipitationUnit}
                        onChange={setPrecipitationUnit}
                        size="sm"
                      />
                    </SettingRow>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </div>
  );
}
