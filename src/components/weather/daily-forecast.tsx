'use client';

import { cn } from '@/lib/utils';
import { formatTemperatureShort, formatDayShort, formatPercentage } from '@/lib/utils';
import { DailyForecast as DailyForecastType } from '@/types/weather';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { WeatherIcon } from './weather-icon';
import { Droplets } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastType[];
  className?: string;
}

export function DailyForecast({ daily, className }: DailyForecastProps) {
  // Get the min and max across all days for the temperature bar
  const allTemps = daily.flatMap((d) => [d.temperatureMin, d.temperatureMax]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>7-Day Forecast</CardTitle>
      </CardHeader>

      <div className="space-y-1">
        {daily.map((day, index) => (
          <DailyItem
            key={day.date}
            day={day}
            isToday={index === 0}
            minTemp={minTemp}
            tempRange={tempRange}
          />
        ))}
      </div>
    </Card>
  );
}

function DailyItem({
  day,
  isToday,
  minTemp,
  tempRange,
}: {
  day: DailyForecastType;
  isToday: boolean;
  minTemp: number;
  tempRange: number;
}) {
  // Calculate position percentages for the temperature bar
  const lowPercent = ((day.temperatureMin - minTemp) / tempRange) * 100;
  const highPercent = ((day.temperatureMax - minTemp) / tempRange) * 100;

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 px-2 rounded-xl',
        'transition-all duration-200',
        isToday
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      {/* Day name */}
      <span
        className={cn(
          'w-12 text-sm font-medium',
          isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
        )}
      >
        {formatDayShort(day.date)}
      </span>

      {/* Weather icon */}
      <div className="w-8 flex justify-center">
        <WeatherIcon code={day.weatherCode} size="sm" />
      </div>

      {/* Precipitation chance */}
      <div className="w-12 flex items-center justify-center">
        {day.precipitationProbability > 0 ? (
          <div className="flex items-center gap-0.5 text-blue-500">
            <Droplets className="h-3 w-3" />
            <span className="text-xs">{formatPercentage(day.precipitationProbability)}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>

      {/* Low temp */}
      <span className="w-10 text-right text-sm text-slate-500 dark:text-slate-400">
        {formatTemperatureShort(day.temperatureMin)}
      </span>

      {/* Temperature bar */}
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-orange-400"
          style={{
            left: `${lowPercent}%`,
            right: `${100 - highPercent}%`,
          }}
        />
      </div>

      {/* High temp */}
      <span className="w-10 text-sm font-medium text-slate-900 dark:text-white">
        {formatTemperatureShort(day.temperatureMax)}
      </span>
    </div>
  );
}

