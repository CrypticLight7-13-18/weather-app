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
import { Settings } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import {
  Droplets,
  Wind,
  Gauge,
  Sun,
  Cloud,
  Compass,
} from 'lucide-react';

interface WeatherDetailsProps {
  current: CurrentWeather;
  settings: Settings;
  className?: string;
}

export function WeatherDetails({ current, settings, className }: WeatherDetailsProps) {
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
      value: formatWindSpeed(current.windSpeed, settings.windSpeedUnit),
      subtext: getWindLevel(current.windSpeed),
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
      value: formatPressure(current.pressure, settings.pressureUnit),
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
    <div className={cn(
      'flex flex-col gap-2 p-3 rounded-xl',
      'bg-slate-50/80 border border-slate-100',
      'dark:bg-slate-800/50 dark:border-slate-700/50'
    )}>
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div>
        <span className={cn(
          'text-xl font-semibold',
          valueColor || 'text-slate-900 dark:text-white'
        )}>
          {value}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtext}
        </p>
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

// Wind speed is always in km/h internally
function getWindLevel(speedKmh: number): string {
  if (speedKmh < 5) return 'Calm';
  if (speedKmh < 20) return 'Light breeze';
  if (speedKmh < 40) return 'Moderate';
  if (speedKmh < 60) return 'Strong';
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
