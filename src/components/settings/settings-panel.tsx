'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';
import { useTheme } from '@/hooks';
import { Card, CardHeader, CardTitle, Toggle } from '@/components/ui';
import { TemperatureUnit, Theme } from '@/types';
import { Settings, Sun, Moon, Monitor, Thermometer } from 'lucide-react';

interface SettingsPanelProps {
  className?: string;
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const { settings, setTemperatureUnit } = useAppStore();
  const { theme, setTheme, toggleDevMode, devMode } = useTheme();

  const temperatureOptions = [
    { value: 'celsius' as TemperatureUnit, label: '°C' },
    { value: 'fahrenheit' as TemperatureUnit, label: '°F' },
  ];

  const themeOptions = [
    { value: 'light' as Theme, label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark' as Theme, label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system' as Theme, label: 'Auto', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </CardTitle>
      </CardHeader>

      <div className="space-y-6">
        {/* Temperature unit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Temperature Unit
            </span>
          </div>
          <Toggle
            options={temperatureOptions}
            value={settings.temperatureUnit}
            onChange={setTemperatureUnit}
            size="sm"
          />
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Theme
            </span>
          </div>
          <Toggle
            options={themeOptions}
            value={theme}
            onChange={setTheme}
            size="sm"
          />
        </div>

        {/* Dev mode toggle (hidden by default, activated via keyboard shortcut) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleDevMode}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-xl',
              'text-sm font-medium',
              'transition-colors duration-200',
              devMode
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            <span>Developer Mode</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-bold',
              devMode ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
            )}>
              {devMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}

