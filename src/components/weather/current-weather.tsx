'use client';

import { cn } from '@/lib/utils';
import {
  formatTemperature,
  formatTemperatureShort,
  formatWindSpeed,
  formatPercentage,
  formatPressure,
  formatTime,
  getWindDirection,
  getUVIndexLevel,
} from '@/lib/utils';
import { WeatherData, getWeatherCondition } from '@/types/weather';
import { Location } from '@/types/location';
import { Settings } from '@/types';
import { Card } from '@/components/ui';
import { WeatherIconHero } from './weather-icon';
import {
  Droplets,
  Wind,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Star,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useFavorites } from '@/hooks';
import { IconButton } from '@/components/ui/button';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface CurrentWeatherProps {
  weather: WeatherData;
  location: Location;
  settings: Settings;
  className?: string;
}

// Hook to get current time that updates every minute
function useCurrentTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Calculate time until next minute boundary for precise updates
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    
    // Initial timeout to sync with minute boundary
    const timeout = setTimeout(() => {
      setNow(new Date());
      
      // Then update every minute
      const interval = setInterval(() => {
        setNow(new Date());
      }, 60000);
      
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return now;
}

// Format time for a specific timezone
function formatTimeForTimezone(date: Date, timezone: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
      ...options,
    }).format(date);
  } catch {
    return 'Time unavailable';
  }
}

// Get timezone abbreviation
function getTimezoneAbbr(date: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
      timeZone: timezone,
    }).formatToParts(date);
    
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || '';
  } catch {
    return '';
  }
}

// Format full date
function formatFullDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    }).format(date);
  } catch {
    return format(date, 'EEEE, MMMM d');
  }
}

// Get user's local timezone
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function CurrentWeather({
  weather,
  location,
  settings,
  className,
}: CurrentWeatherProps) {
  const { current, daily, timezone: locationTimezone, timezoneAbbreviation } = weather;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const now = useCurrentTime();
  
  // Compute isFavorite reactively based on favorites array
  const isLocationFavorite = useMemo(
    () => favorites.some((f) => f.id === location.id),
    [favorites, location.id]
  );

  const todayForecast = daily[0];

  const toggleFavorite = useCallback(() => {
    if (isLocationFavorite) {
      removeFavorite(location.id);
    } else {
      addFavorite(location);
    }
  }, [isLocationFavorite, location, addFavorite, removeFavorite]);

  // Time calculations
  const userTimezone = useMemo(() => getUserTimezone(), []);
  const isSameTimezone = userTimezone === locationTimezone;
  
  const locationTime = formatTimeForTimezone(now, locationTimezone);
  const locationTimezoneAbbr = timezoneAbbreviation || getTimezoneAbbr(now, locationTimezone);
  const localTime = formatTimeForTimezone(now, userTimezone);
  const localTimezoneAbbr = getTimezoneAbbr(now, userTimezone);
  const dateAtLocation = formatFullDate(now, locationTimezone);

  return (
    <Card
      variant="glass"
      padding="lg"
      className={cn(
        'relative overflow-hidden',
        'bg-linear-to-br',
        condition.gradient,
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Header with location and time */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className={cn('h-4 w-4 shrink-0', condition.textColor, 'opacity-70')} />
              <h1 className={cn('text-2xl md:text-3xl font-bold truncate', condition.textColor)}>
                {location.name}
              </h1>
            </div>
            <p className={cn('text-sm opacity-70 ml-6', condition.textColor)}>
              {location.country}
              {location.state && `, ${location.state}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <IconButton
              label={isLocationFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={toggleFavorite}
              className={cn(
                'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
                condition.textColor
              )}
            >
              <Star 
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isLocationFavorite ? 'fill-yellow-400 text-yellow-400' : ''
                )} 
              />
            </IconButton>
          </div>
        </div>

        {/* Date and Time Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-6 p-3 rounded-xl',
            'bg-white/10 backdrop-blur-sm',
            'border border-white/10'
          )}
        >
          {/* Date */}
          <div className={cn('flex items-center gap-2 mb-2', condition.textColor)}>
            <Calendar className="h-4 w-4 opacity-70" />
            <span className="text-sm font-medium">{dateAtLocation}</span>
          </div>
          
          {/* Time display */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Location time */}
            <div className={cn('flex items-center gap-2', condition.textColor)}>
              <Clock className="h-4 w-4 opacity-70" />
              <div className="flex items-baseline gap-1.5">
                <motion.span 
                  key={locationTime}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold tabular-nums"
                >
                  {locationTime}
                </motion.span>
                <span className="text-xs opacity-70">{locationTimezoneAbbr}</span>
                {!isSameTimezone && (
                  <span className="text-xs opacity-50 ml-1">(Local)</span>
                )}
              </div>
            </div>

            {/* Your time (if different timezone) */}
            {!isSameTimezone && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn('flex items-center gap-2 pl-4 border-l border-white/20', condition.textColor)}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs opacity-50">Your time:</span>
                  <motion.span 
                    key={localTime}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium tabular-nums"
                  >
                    {localTime}
                  </motion.span>
                  <span className="text-xs opacity-50">{localTimezoneAbbr}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main temperature and icon */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.div 
              key={`${current.temperature}-${settings.temperatureUnit}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn('text-7xl md:text-8xl font-light tracking-tight', condition.textColor)}
            >
              {formatTemperatureShort(current.temperature, settings.temperatureUnit)}
            </motion.div>
            <p className={cn('text-lg mt-2', condition.textColor)}>
              {condition.label}
            </p>
            <p className={cn('text-sm opacity-70', condition.textColor)}>
              Feels like {formatTemperature(current.feelsLike, settings.temperatureUnit)}
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <WeatherIconHero
              code={current.weatherCode}
              isDay={current.isDay}
              className="mr-4"
            />
          </motion.div>
        </div>

        {/* High/Low temperatures */}
        {todayForecast && (
          <div className={cn('flex gap-4 mb-6 text-sm', condition.textColor)}>
            <span className="flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              H: {formatTemperatureShort(todayForecast.temperatureMax, settings.temperatureUnit)}
            </span>
            <span className="opacity-70">
              L: {formatTemperatureShort(todayForecast.temperatureMin, settings.temperatureUnit)}
            </span>
          </div>
        )}

        {/* Quick stats grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          <QuickStat
            icon={<Droplets className="h-4 w-4" />}
            label="Humidity"
            value={formatPercentage(current.humidity)}
            textColor={condition.textColor}
          />
          <QuickStat
            icon={<Wind className="h-4 w-4" />}
            label="Wind"
            value={`${formatWindSpeed(current.windSpeed, settings.windSpeedUnit)} ${getWindDirection(current.windDirection)}`}
            textColor={condition.textColor}
          />
          <QuickStat
            icon={<Eye className="h-4 w-4" />}
            label="UV Index"
            value={`${current.uvIndex} ${getUVIndexLevel(current.uvIndex).level}`}
            textColor={condition.textColor}
          />
          <QuickStat
            icon={<Gauge className="h-4 w-4" />}
            label="Pressure"
            value={formatPressure(current.pressure, settings.pressureUnit)}
            textColor={condition.textColor}
          />
        </motion.div>

        {/* Sunrise/Sunset */}
        {todayForecast && (
          <div className={cn('flex gap-6 mt-6 pt-6 border-t border-white/20', condition.textColor)}>
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-xs opacity-60">Sunrise</span>
                <span className="text-sm font-medium">{formatTime(todayForecast.sunrise)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-xs opacity-60">Sunset</span>
                <span className="text-sm font-medium">{formatTime(todayForecast.sunset)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const quickStatVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

function QuickStat({
  icon,
  label,
  value,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  textColor: string;
}) {
  return (
    <motion.div 
      variants={quickStatVariants}
      className={cn(
        'flex flex-col gap-1 p-2.5 rounded-lg',
        'bg-white/10 backdrop-blur-sm',
        textColor
      )}
    >
      <div className="flex items-center gap-1.5 opacity-70">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </motion.div>
  );
}
