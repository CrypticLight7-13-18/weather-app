'use client';

import { cn } from '@/lib/utils';
import { formatTemperatureShort, formatHour, formatPercentage } from '@/lib/utils';
import { HourlyForecast as HourlyForecastType } from '@/types/weather';
import { TemperatureUnit } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { WeatherIcon } from './weather-icon';
import { Droplets, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HourlyForecastProps {
  hourly: HourlyForecastType[];
  temperatureUnit?: TemperatureUnit;
  className?: string;
}

export function HourlyForecast({ hourly, temperatureUnit = 'celsius', className }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const next24Hours = hourly.slice(0, 24);

  // Find min/max temps for the gradient indicator
  const temps = next24Hours.map(h => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <CardTitle>Hourly Forecast</CardTitle>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              canScrollLeft
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              canScrollRight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </CardHeader>

      {/* Scrollable container with fade edges */}
      <div className="relative">
        {/* Left fade */}
        <div 
          className={cn(
            'absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none',
            'bg-linear-to-r from-white to-transparent dark:from-slate-800 dark:to-transparent',
            'transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />
        
        {/* Right fade */}
        <div 
          className={cn(
            'absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none',
            'bg-linear-to-l from-white to-transparent dark:from-slate-800 dark:to-transparent',
            'transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto px-1 pb-3 pt-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {next24Hours.map((hour, index) => (
            <HourlyItem 
              key={hour.time} 
              hour={hour} 
              isNow={index === 0} 
              index={index}
              temperatureUnit={temperatureUnit}
              tempPosition={(hour.temperature - minTemp) / tempRange}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function HourlyItem({
  hour,
  isNow,
  index,
  temperatureUnit,
  tempPosition,
}: {
  hour: HourlyForecastType;
  isNow: boolean;
  index: number;
  temperatureUnit: TemperatureUnit;
  tempPosition: number;
}) {
  // Color based on temperature position (0 = cold/blue, 1 = hot/orange)
  const getTempTextColor = () => {
    if (tempPosition < 0.3) return 'text-blue-600 dark:text-blue-400';
    if (tempPosition < 0.6) return 'text-emerald-600 dark:text-emerald-400';
    if (tempPosition < 0.8) return 'text-amber-600 dark:text-amber-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.02,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: 1.03,
        y: -2,
      }}
      className={cn(
        'relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[68px]',
        'transition-all duration-200 cursor-default',
        isNow
          ? cn(
              // Glassmorphism for "Now"
              'bg-linear-to-b from-blue-500/30 to-blue-600/20',
              'backdrop-blur-md',
              'border border-blue-300/50 dark:border-blue-500/30',
              'shadow-[0_4px_16px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]',
              'dark:shadow-[0_4px_16px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]'
            )
          : cn(
              // Soft glass effect
              'bg-linear-to-b from-white/40 to-white/20',
              'dark:from-white/10 dark:to-white/5',
              'backdrop-blur-sm',
              'border border-white/40 dark:border-white/10',
              'shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]',
              'dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
              'hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]',
              'dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]'
            )
      )}
    >
      {/* Now indicator dot */}
      {isNow && (
        <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
        </span>
      )}

      {/* Time */}
      <span
        className={cn(
          'text-[10px] font-semibold tracking-wide',
          isNow ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {isNow ? 'NOW' : formatHour(hour.time)}
      </span>

      {/* Weather icon */}
      <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size="md" />

      {/* Temperature */}
      <span className={cn(
        'text-md font-bold',
        isNow ? 'text-blue-700 dark:text-blue-300' : getTempTextColor()
      )}>
        {formatTemperatureShort(hour.temperature, temperatureUnit)}
      </span>

      {/* Precipitation indicator */}
      {hour.precipitationProbability > 0 && (
        <div 
          className={cn(
            'flex items-center gap-0.5',
            hour.precipitationProbability > 50 
              ? 'text-blue-600 dark:text-blue-300' 
              : 'text-blue-500/80 dark:text-blue-400/80'
          )}
        >
          <Droplets className="h-2.5 w-2.5" />
          <span className="text-[9px] font-semibold">
            {formatPercentage(hour.precipitationProbability)}
          </span>
        </div>
      )}
    </motion.div>
  );
}
