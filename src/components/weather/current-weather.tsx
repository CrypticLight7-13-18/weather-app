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
import { TemperatureUnit } from '@/types';
import { Card } from '@/components/ui';
import { WeatherIconHero } from './weather-icon';
import {
  Droplets,
  Wind,
  Thermometer,
  Eye,
  Gauge,
  Sun,
  Sunrise,
  Sunset,
  Star,
  StarOff,
} from 'lucide-react';
import { useFavorites } from '@/hooks';
import { IconButton } from '@/components/ui/button';

interface CurrentWeatherProps {
  weather: WeatherData;
  location: Location;
  unit: TemperatureUnit;
  className?: string;
}

export function CurrentWeather({
  weather,
  location,
  unit,
  className,
}: CurrentWeatherProps) {
  const { current, daily } = weather;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isLocationFavorite = isFavorite(location.id);

  const todayForecast = daily[0];

  const toggleFavorite = () => {
    if (isLocationFavorite) {
      removeFavorite(location.id);
    } else {
      addFavorite(location);
    }
  };

  return (
    <Card
      variant="glass"
      padding="lg"
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br',
        condition.gradient,
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className={cn('text-2xl md:text-3xl font-bold mb-1', condition.textColor)}>
              {location.name}
            </h1>
            <p className={cn('text-sm opacity-80', condition.textColor)}>
              {location.country}
              {location.state && `, ${location.state}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              label={isLocationFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={toggleFavorite}
              className={cn(
                'bg-white/20 hover:bg-white/30',
                condition.textColor
              )}
            >
              {isLocationFavorite ? (
                <Star className="h-5 w-5 fill-current" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </IconButton>
          </div>
        </div>

        {/* Main temperature and icon */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className={cn('text-7xl md:text-8xl font-light tracking-tight', condition.textColor)}>
              {formatTemperatureShort(current.temperature)}
            </div>
            <p className={cn('text-lg mt-2', condition.textColor)}>
              {condition.label}
            </p>
            <p className={cn('text-sm opacity-70', condition.textColor)}>
              Feels like {formatTemperature(current.feelsLike, unit)}
            </p>
          </div>
          <WeatherIconHero
            code={current.weatherCode}
            isDay={current.isDay}
            className="mr-4"
          />
        </div>

        {/* High/Low temperatures */}
        {todayForecast && (
          <div className={cn('flex gap-4 mb-6 text-sm', condition.textColor)}>
            <span className="flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              H: {formatTemperatureShort(todayForecast.temperatureMax)}
            </span>
            <span className="opacity-70">
              L: {formatTemperatureShort(todayForecast.temperatureMin)}
            </span>
          </div>
        )}

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStat
            icon={<Droplets className="h-4 w-4" />}
            label="Humidity"
            value={formatPercentage(current.humidity)}
            textColor={condition.textColor}
          />
          <QuickStat
            icon={<Wind className="h-4 w-4" />}
            label="Wind"
            value={`${formatWindSpeed(current.windSpeed, unit)} ${getWindDirection(current.windDirection)}`}
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
            value={formatPressure(current.pressure)}
            textColor={condition.textColor}
          />
        </div>

        {/* Sunrise/Sunset */}
        {todayForecast && (
          <div className={cn('flex gap-6 mt-6 pt-6 border-t border-white/20', condition.textColor)}>
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4" />
              <span className="text-sm">{formatTime(todayForecast.sunrise)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sunset className="h-4 w-4" />
              <span className="text-sm">{formatTime(todayForecast.sunset)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

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
    <div className={cn('flex flex-col gap-1', textColor)}>
      <div className="flex items-center gap-1.5 opacity-70">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

