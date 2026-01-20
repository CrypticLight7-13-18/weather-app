'use client';

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
