'use client';

import { cn } from '@/lib/utils';
import { formatTemperatureShort, formatDay, formatPercentage, convertTemperature } from '@/lib/utils';
import { DailyForecast as DailyForecastType, getWeatherCondition } from '@/types/weather';
import { TemperatureUnit } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { WeatherIcon } from './weather-icon';
import { Droplets, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DailyForecastProps {
  daily: DailyForecastType[];
  temperatureUnit?: TemperatureUnit;
  className?: string;
}

export function DailyForecast({ daily, temperatureUnit = 'celsius', className }: DailyForecastProps) {
  // Get the min and max across all days for the temperature bar (in display units)
  const allTemps = daily.flatMap((d) => [
    convertTemperature(d.temperatureMin, temperatureUnit),
    convertTemperature(d.temperatureMax, temperatureUnit),
  ]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <CardTitle>7-Day Forecast</CardTitle>
        </div>
      </CardHeader>

      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 pb-2 mb-1 border-b border-slate-100 dark:border-slate-700/50">
        <span className="w-20 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Day
        </span>
        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
          Condition
        </span>
        <span className="w-12 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
          Rain
        </span>
        <div className="flex-1 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Low
          </span>
          <span>Temperature Range</span>
          <span className="flex items-center gap-1">
            High
            <TrendingUp className="h-3 w-3" />
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {daily.map((day, index) => (
          <DailyItem
            key={day.date}
            day={day}
            isToday={index === 0}
            index={index}
            minTemp={minTemp}
            tempRange={tempRange}
            temperatureUnit={temperatureUnit}
          />
        ))}
      </div>
    </Card>
  );
}

function DailyItem({
  day,
  isToday,
  index,
  minTemp,
  tempRange,
  temperatureUnit,
}: {
  day: DailyForecastType;
  isToday: boolean;
  index: number;
  minTemp: number;
  tempRange: number;
  temperatureUnit: TemperatureUnit;
}) {
  const displayMin = convertTemperature(day.temperatureMin, temperatureUnit);
  const displayMax = convertTemperature(day.temperatureMax, temperatureUnit);
  const condition = getWeatherCondition(day.weatherCode, true);

  // Calculate position percentages for the temperature bar
  const lowPercent = ((displayMin - minTemp) / tempRange) * 100;
  const highPercent = ((displayMax - minTemp) / tempRange) * 100;

  // Determine temperature bar color based on average temp position
  const avgTempPercent = (lowPercent + highPercent) / 2;
  const getBarGradient = () => {
    if (avgTempPercent < 30) return 'from-blue-400 to-cyan-400';
    if (avgTempPercent < 50) return 'from-cyan-400 to-emerald-400';
    if (avgTempPercent < 70) return 'from-emerald-400 to-amber-400';
    return 'from-amber-400 to-orange-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className={cn(
        'flex items-center gap-3 py-3 px-3 rounded-2xl',
        'transition-all duration-200',
        isToday
          ? cn(
              // Glassmorphism for today
              'bg-linear-to-r from-blue-500/15 to-cyan-500/10',
              'backdrop-blur-sm',
              'border border-blue-200/50 dark:border-blue-500/20',
              'shadow-[0_4px_12px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]',
              'dark:shadow-[0_4px_12px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
            )
          : cn(
              // Glass hover for other days
              'hover:bg-white/50 dark:hover:bg-white/5',
              'hover:shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]',
              'dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]',
              'border border-transparent hover:border-white/40 dark:hover:border-white/10'
            )
      )}
    >
      {/* Day name and date */}
      <div className="w-20">
        <span
          className={cn(
            'block text-sm font-semibold',
            isToday 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-800 dark:text-slate-200'
          )}
        >
          {isToday ? 'Today' : formatDay(day.date).split(',')[0]}
        </span>
        {!isToday && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Weather icon and condition */}
      <div className="w-16 flex flex-col items-center">
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
          <WeatherIcon code={day.weatherCode} size="sm" />
        </motion.div>
        <span className="text-[9px] text-slate-500 dark:text-slate-400 text-center leading-tight mt-0.5 line-clamp-1">
          {condition.label}
        </span>
      </div>

      {/* Precipitation chance */}
      <div className="w-12 flex items-center justify-center">
        {day.precipitationProbability > 0 ? (
          <div 
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-md',
              day.precipitationProbability > 50 
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                : 'text-blue-500/70 dark:text-blue-400/70'
            )}
          >
            <Droplets className="h-3 w-3" />
            <span className="text-xs font-medium">{formatPercentage(day.precipitationProbability)}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
        )}
      </div>

      {/* Temperature section */}
      <div className="flex-1 flex items-center gap-3">
        {/* Low temp */}
        <div className="w-10 text-right">
          <span className={cn(
            'text-sm font-medium',
            'text-blue-500 dark:text-blue-400'
          )}>
            {formatTemperatureShort(day.temperatureMin, temperatureUnit)}
          </span>
        </div>

        {/* Temperature bar */}
        <div className="flex-1 relative">
          {/* Background track */}
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            {/* Colored range bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
              className={cn(
                'absolute h-full rounded-full origin-left',
                'bg-linear-to-r',
                getBarGradient()
              )}
              style={{
                left: `${lowPercent}%`,
                right: `${100 - highPercent}%`,
              }}
            />
          </div>
          
          {/* Min/Max indicators */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-800"
            style={{ left: `calc(${lowPercent}% - 3px)` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-800"
            style={{ left: `calc(${highPercent}% - 3px)` }}
          />
        </div>

        {/* High temp */}
        <div className="w-10">
          <span className={cn(
            'text-sm font-semibold',
            'text-orange-500 dark:text-orange-400'
          )}>
            {formatTemperatureShort(day.temperatureMax, temperatureUnit)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
