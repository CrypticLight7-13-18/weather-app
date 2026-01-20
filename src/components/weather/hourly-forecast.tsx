'use client';

import { cn } from '@/lib/utils';
import { formatTemperatureShort, formatHour, formatPercentage } from '@/lib/utils';
import { HourlyForecast as HourlyForecastType } from '@/types/weather';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { WeatherIcon } from './weather-icon';
import { Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface HourlyForecastProps {
  hourly: HourlyForecastType[];
  className?: string;
}

export function HourlyForecast({ hourly, className }: HourlyForecastProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const next24Hours = hourly.slice(0, 24);

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
    const scrollAmount = direction === 'left' ? -200 : 200;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Hourly Forecast</CardTitle>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canScrollLeft
                ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              canScrollRight
                ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {next24Hours.map((hour, index) => (
          <HourlyItem key={hour.time} hour={hour} isNow={index === 0} />
        ))}
      </div>
    </Card>
  );
}

function HourlyItem({
  hour,
  isNow,
}: {
  hour: HourlyForecastType;
  isNow: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl min-w-[70px]',
        'transition-all duration-200',
        isNow
          ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:ring-blue-700'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      )}
    >
      <span
        className={cn(
          'text-xs font-medium',
          isNow ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {isNow ? 'Now' : formatHour(hour.time)}
      </span>

      <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size="md" />

      <span className="text-base font-semibold text-slate-900 dark:text-white">
        {formatTemperatureShort(hour.temperature)}
      </span>

      {hour.precipitationProbability > 0 && (
        <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
          <Droplets className="h-3 w-3" />
          <span className="text-xs">{formatPercentage(hour.precipitationProbability)}</span>
        </div>
      )}
    </div>
  );
}
