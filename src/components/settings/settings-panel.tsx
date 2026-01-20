'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';
import { useTheme } from '@/hooks';
import { Card, CardHeader, CardTitle, Toggle } from '@/components/ui';
import { TemperatureUnit, WindSpeedUnit, PressureUnit, PrecipitationUnit, Theme } from '@/types';
import { Settings, Sun, Moon, Monitor, Thermometer, Wind, Gauge, Droplets } from 'lucide-react';

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const {
    settings,
    setTemperatureUnit,
    setWindSpeedUnit,
    setPressureUnit,
    setPrecipitationUnit,
    devMode,
    toggleDevMode,
  } = useAppStore();
  const { theme, setTheme } = useTheme();

  const temperatureOptions = [
    { value: 'celsius' as TemperatureUnit, label: '°C' },
    { value: 'fahrenheit' as TemperatureUnit, label: '°F' },
  ];

  const windSpeedOptions = [
    { value: 'kmh' as WindSpeedUnit, label: 'km/h' },
    { value: 'mph' as WindSpeedUnit, label: 'mph' },
    { value: 'ms' as WindSpeedUnit, label: 'm/s' },
    { value: 'knots' as WindSpeedUnit, label: 'kn' },
  ];

  const pressureOptions = [
    { value: 'hpa' as PressureUnit, label: 'hPa' },
    { value: 'inhg' as PressureUnit, label: 'inHg' },
    { value: 'mmhg' as PressureUnit, label: 'mmHg' },
  ];

  const precipitationOptions = [
    { value: 'mm' as PrecipitationUnit, label: 'mm' },
    { value: 'inch' as PrecipitationUnit, label: 'in' },
  ];

  const themeOptions = [
    { value: 'light' as Theme, label: <Sun className="h-4 w-4" /> },
    { value: 'dark' as Theme, label: <Moon className="h-4 w-4" /> },
    { value: 'system' as Theme, label: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </CardTitle>
      </CardHeader>

      <div className="space-y-5">
        {/* Temperature unit */}
        <SettingRow
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperature"
        >
          <Toggle
            options={temperatureOptions}
            value={settings.temperatureUnit}
            onChange={setTemperatureUnit}
            size="sm"
          />
        </SettingRow>

        {/* Wind speed unit */}
        <SettingRow
          icon={<Wind className="h-4 w-4" />}
          label="Wind Speed"
        >
          <Toggle
            options={windSpeedOptions}
            value={settings.windSpeedUnit}
            onChange={setWindSpeedUnit}
            size="sm"
          />
        </SettingRow>

        {/* Pressure unit */}
        <SettingRow
          icon={<Gauge className="h-4 w-4" />}
          label="Pressure"
        >
          <Toggle
            options={pressureOptions}
            value={settings.pressureUnit}
            onChange={setPressureUnit}
            size="sm"
          />
        </SettingRow>

        {/* Precipitation unit */}
        <SettingRow
          icon={<Droplets className="h-4 w-4" />}
          label="Precipitation"
        >
          <Toggle
            options={precipitationOptions}
            value={settings.precipitationUnit}
            onChange={setPrecipitationUnit}
            size="sm"
          />
        </SettingRow>

        {/* Theme */}
        <SettingRow
          icon={<Sun className="h-4 w-4" />}
          label="Theme"
        >
          <Toggle
            options={themeOptions}
            value={theme}
            onChange={setTheme}
            size="sm"
          />
        </SettingRow>

        {/* Dev mode toggle */}
        <div className={cn(
          'pt-4 border-t',
          'border-slate-200 dark:border-slate-700'
        )}>
          <button
            onClick={toggleDevMode}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl',
              'text-sm font-medium',
              'transition-colors duration-200',
              devMode
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            )}
          >
            <span>Developer Mode</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-bold',
              devMode 
                ? 'bg-amber-500 text-white' 
                : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
            )}>
              {devMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}

function SettingRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-slate-500 dark:text-slate-400 shrink-0">{icon}</span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
          {label}
        </span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
