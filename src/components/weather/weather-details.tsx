'use client';

import { cn } from '@/lib/utils';
import {
  formatPercentage,
  formatPressure,
  formatWindSpeed,
  getWindDirection,
  getUVIndexLevel,
} from '@/lib/utils';
import { CurrentWeather } from '@/types/weather';
import { TemperatureUnit } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Eye,
  Cloud,
  Compass,
} from 'lucide-react';

interface WeatherDetailsProps {
  current: CurrentWeather;
  unit: TemperatureUnit;
  className?: string;
}

export function WeatherDetails({ current, unit, className }: WeatherDetailsProps) {
  const uvInfo = getUVIndexLevel(current.uvIndex);

  const details = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: formatPercentage(current.humidity),
      subtext: getHumidityLevel(current.humidity),
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: formatWindSpeed(current.windSpeed, unit),
      subtext: getWindLevel(current.windSpeed, unit),
    },
    {
      icon: Compass,
      label: 'Wind Direction',
      value: getWindDirection(current.windDirection),
      subtext: `${current.windDirection}°`,
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: formatPressure(current.pressure),
      subtext: getPressureLevel(current.pressure),
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: current.uvIndex.toString(),
      subtext: uvInfo.level,
      valueColor: uvInfo.color,
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: formatPercentage(current.cloudCover),
      subtext: getCloudLevel(current.cloudCover),
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Weather Details</CardTitle>
      </CardHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {details.map((detail) => (
          <DetailCard key={detail.label} {...detail} />
        ))}
      </div>
    </Card>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  subtext,
  valueColor,
}: {
  icon: typeof Droplets;
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div>
        <span className={cn('text-xl font-semibold', valueColor || 'text-slate-900 dark:text-white')}>
          {value}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}

function getHumidityLevel(humidity: number): string {
  if (humidity < 30) return 'Dry';
  if (humidity < 60) return 'Comfortable';
  if (humidity < 80) return 'Humid';
  return 'Very humid';
}

function getWindLevel(speed: number, unit: TemperatureUnit): string {
  // Convert to km/h for comparison if needed
  const kmh = unit === 'fahrenheit' ? speed * 1.60934 : speed;
  if (kmh < 5) return 'Calm';
  if (kmh < 20) return 'Light breeze';
  if (kmh < 40) return 'Moderate';
  if (kmh < 60) return 'Strong';
  return 'Very strong';
}

function getPressureLevel(pressure: number): string {
  if (pressure < 1000) return 'Low';
  if (pressure < 1020) return 'Normal';
  return 'High';
}

function getCloudLevel(cloudCover: number): string {
  if (cloudCover < 20) return 'Clear';
  if (cloudCover < 50) return 'Partly cloudy';
  if (cloudCover < 80) return 'Mostly cloudy';
  return 'Overcast';
}

