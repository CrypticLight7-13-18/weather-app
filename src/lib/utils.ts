import { type ClassValue, clsx } from 'clsx';
import { TemperatureUnit, WindSpeedUnit, PressureUnit, PrecipitationUnit } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ============ Temperature Conversions ============
// Data is always stored in Celsius

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return celsiusToFahrenheit(celsius);
  }
  return celsius;
}

export function formatTemperature(temp: number, unit: TemperatureUnit = 'celsius'): string {
  const converted = convertTemperature(temp, unit);
  const rounded = Math.round(converted);
  return `${rounded}°${unit === 'celsius' ? 'C' : 'F'}`;
}

export function formatTemperatureShort(temp: number, unit: TemperatureUnit = 'celsius'): string {
  const converted = convertTemperature(temp, unit);
  return `${Math.round(converted)}°`;
}

export function formatTemperatureValue(temp: number, unit: TemperatureUnit = 'celsius'): number {
  return Math.round(convertTemperature(temp, unit));
}

// ============ Wind Speed Conversions ============
// Data is always stored in km/h

export function convertWindSpeed(kmh: number, unit: WindSpeedUnit): number {
  switch (unit) {
    case 'mph':
      return kmh * 0.621371;
    case 'ms':
      return kmh / 3.6;
    case 'knots':
      return kmh * 0.539957;
    default:
      return kmh;
  }
}

export function formatWindSpeed(speed: number, unit: WindSpeedUnit = 'kmh'): string {
  const converted = convertWindSpeed(speed, unit);
  const rounded = Math.round(converted);
  const unitLabels: Record<WindSpeedUnit, string> = {
    kmh: 'km/h',
    mph: 'mph',
    ms: 'm/s',
    knots: 'kn',
  };
  return `${rounded} ${unitLabels[unit]}`;
}

// ============ Pressure Conversions ============
// Data is always stored in hPa

export function convertPressure(hpa: number, unit: PressureUnit): number {
  switch (unit) {
    case 'inhg':
      return hpa * 0.02953;
    case 'mmhg':
      return hpa * 0.750062;
    default:
      return hpa;
  }
}

export function formatPressure(pressure: number, unit: PressureUnit = 'hpa'): string {
  const converted = convertPressure(pressure, unit);
  const unitLabels: Record<PressureUnit, string> = {
    hpa: 'hPa',
    inhg: 'inHg',
    mmhg: 'mmHg',
  };
  
  if (unit === 'inhg') {
    return `${converted.toFixed(2)} ${unitLabels[unit]}`;
  }
  return `${Math.round(converted)} ${unitLabels[unit]}`;
}

// ============ Precipitation Conversions ============
// Data is always stored in mm

export function convertPrecipitation(mm: number, unit: PrecipitationUnit): number {
  if (unit === 'inch') {
    return mm * 0.0393701;
  }
  return mm;
}

export function formatPrecipitation(mm: number, unit: PrecipitationUnit = 'mm'): string {
  const converted = convertPrecipitation(mm, unit);
  const unitLabel = unit === 'mm' ? 'mm' : 'in';
  return `${converted.toFixed(unit === 'inch' ? 2 : 1)} ${unitLabel}`;
}

// ============ Other Formatters ============

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatHour(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
}

export function formatDay(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDayShort(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tmrw';
  }

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function getUVIndexLevel(uv: number): { level: string; color: string } {
  if (uv <= 2) return { level: 'Low', color: 'text-green-500' };
  if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
  if (uv <= 7) return { level: 'High', color: 'text-orange-500' };
  if (uv <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
