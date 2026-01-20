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
  Navigation,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherDetailsProps {
  current: CurrentWeather;
  settings: Settings;
  className?: string;
}

export function WeatherDetails({ current, settings, className }: WeatherDetailsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-400" />
          <CardTitle>Weather Details</CardTitle>
        </div>
      </CardHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Humidity */}
        <HumidityCard humidity={current.humidity} />
        
        {/* Wind */}
        <WindCard 
          speed={current.windSpeed} 
          direction={current.windDirection}
          windSpeedUnit={settings.windSpeedUnit}
        />
        
        {/* UV Index */}
        <UVIndexCard uvIndex={current.uvIndex} />
        
        {/* Pressure */}
        <PressureCard 
          pressure={current.pressure}
          pressureUnit={settings.pressureUnit}
        />
        
        {/* Cloud Cover */}
        <CloudCoverCard cloudCover={current.cloudCover} />
        
        {/* Visibility/Feel */}
        <FeelsLikeCard 
          humidity={current.humidity}
          windSpeed={current.windSpeed}
          cloudCover={current.cloudCover}
        />
      </div>
    </Card>
  );
}

// Humidity Card with water droplet fill effect
function HumidityCard({ humidity }: { humidity: number }) {
  const level = getHumidityLevel(humidity);
  const color = humidity < 30 ? 'text-amber-500' : humidity < 70 ? 'text-emerald-500' : 'text-blue-500';
  const bgColor = humidity < 30 ? 'from-amber-500' : humidity < 70 ? 'from-emerald-500' : 'from-blue-500';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      {/* Background fill indicator */}
      <div 
        className={cn('absolute bottom-0 left-0 right-0 bg-gradient-to-t to-transparent opacity-30', bgColor)}
        style={{ height: `${humidity}%` }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg bg-white/80 dark:bg-slate-900/50', color)}>
              <Droplets className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Humidity</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold', color)}>{humidity}</span>
          <span className="text-lg text-slate-400">%</span>
        </div>
        
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${humidity}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-r to-current', bgColor, color)}
            />
          </div>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{level}</p>
      </div>
    </motion.div>
  );
}

// Wind Card with compass direction
function WindCard({ 
  speed, 
  direction,
  windSpeedUnit 
}: { 
  speed: number; 
  direction: number;
  windSpeedUnit: Settings['windSpeedUnit'];
}) {
  const level = getWindLevel(speed);
  const directionLabel = getWindDirection(direction);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/50 text-cyan-500">
            <Wind className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Wind</span>
        </div>
        
        {/* Mini compass */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-600" />
          <div className="absolute inset-1 rounded-full bg-slate-100 dark:bg-slate-700/50" />
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ rotate: 0 }}
            animate={{ rotate: direction }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Navigation className="h-5 w-5 text-cyan-500 fill-cyan-500" />
          </motion.div>
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">N</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatWindSpeed(speed, windSpeedUnit)}
        </span>
      </div>
      
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">{directionLabel}</span>
        <span className="text-xs text-slate-400">({direction}°)</span>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{level}</p>
    </motion.div>
  );
}

// UV Index Card with color-coded gauge
function UVIndexCard({ uvIndex }: { uvIndex: number }) {
  const uvInfo = getUVIndexLevel(uvIndex);
  const percentage = Math.min((uvIndex / 11) * 100, 100);
  
  const getUVColor = () => {
    if (uvIndex <= 2) return { bg: 'from-green-400', text: 'text-green-500' };
    if (uvIndex <= 5) return { bg: 'from-yellow-400', text: 'text-yellow-500' };
    if (uvIndex <= 7) return { bg: 'from-orange-400', text: 'text-orange-500' };
    if (uvIndex <= 10) return { bg: 'from-red-400', text: 'text-red-500' };
    return { bg: 'from-purple-500', text: 'text-purple-500' };
  };
  
  const colors = getUVColor();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg bg-white/80 dark:bg-slate-900/50', colors.text)}>
            <Sun className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">UV Index</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn('text-3xl font-bold', colors.text)}>{uvIndex}</span>
        <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full', 
          uvIndex <= 2 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          uvIndex <= 5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          uvIndex <= 7 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          uvIndex <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        )}>
          {uvInfo.level}
        </span>
      </div>
      
      {/* UV Scale */}
      <div className="mt-3">
        <div className="relative">
          <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-purple-500" />
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-400 shadow-md"
            style={{ left: `calc(${percentage}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-slate-400">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Extreme</span>
        </div>
      </div>
    </motion.div>
  );
}

// Pressure Card with gauge
function PressureCard({ 
  pressure,
  pressureUnit 
}: { 
  pressure: number;
  pressureUnit: Settings['pressureUnit'];
}) {
  const level = getPressureLevel(pressure);
  // Normal range: 980-1050 hPa, center at 1013
  const normalizedPressure = ((pressure - 980) / 70) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/50 text-violet-500">
            <Gauge className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pressure</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {formatPressure(pressure, pressureUnit)}
        </span>
      </div>
      
      {/* Pressure gauge */}
      <div className="mt-3 relative">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 via-slate-300 to-orange-400" />
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${Math.max(0, Math.min(100, normalizedPressure))}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-white dark:border-slate-800 shadow"
          style={{ left: `calc(${Math.max(0, Math.min(100, normalizedPressure))}% - 5px)` }}
        />
        <div className="flex justify-between mt-1.5 text-[9px] text-slate-400">
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{level}</p>
    </motion.div>
  );
}

// Cloud Cover Card
function CloudCoverCard({ cloudCover }: { cloudCover: number }) {
  const level = getCloudLevel(cloudCover);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      {/* Animated clouds background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {cloudCover > 20 && (
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-2"
          >
            <Cloud className="h-8 w-8 text-slate-500" />
          </motion.div>
        )}
        {cloudCover > 50 && (
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-2 right-2"
          >
            <Cloud className="h-6 w-6 text-slate-500" />
          </motion.div>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/50 text-slate-500">
              <Cloud className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cloud Cover</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">{cloudCover}</span>
          <span className="text-lg text-slate-400">%</span>
        </div>
        
        {/* Cloud icons representing coverage */}
        <div className="mt-2 flex gap-1">
          {[0, 25, 50, 75].map((threshold) => (
            <div 
              key={threshold}
              className={cn(
                'w-6 h-4 rounded flex items-center justify-center',
                cloudCover > threshold 
                  ? 'bg-slate-300 dark:bg-slate-600' 
                  : 'bg-slate-100 dark:bg-slate-800'
              )}
            >
              <Cloud className={cn(
                'h-3 w-3',
                cloudCover > threshold 
                  ? 'text-slate-600 dark:text-slate-300' 
                  : 'text-slate-300 dark:text-slate-600'
              )} />
            </div>
          ))}
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{level}</p>
      </div>
    </motion.div>
  );
}

// Overall feel/comfort card
function FeelsLikeCard({ 
  humidity, 
  windSpeed, 
  cloudCover 
}: { 
  humidity: number; 
  windSpeed: number; 
  cloudCover: number;
}) {
  // Calculate a simple comfort score
  const humidityScore = humidity < 30 ? 60 : humidity < 70 ? 100 : 60;
  const windScore = windSpeed < 20 ? 100 : windSpeed < 40 ? 70 : 40;
  const cloudScore = cloudCover < 50 ? 90 : 70;
  const comfortScore = Math.round((humidityScore + windScore + cloudScore) / 3);
  
  const getComfortLevel = () => {
    if (comfortScore >= 80) return { label: 'Excellent', color: 'text-emerald-500', bg: 'from-emerald-500' };
    if (comfortScore >= 60) return { label: 'Good', color: 'text-cyan-500', bg: 'from-cyan-500' };
    if (comfortScore >= 40) return { label: 'Fair', color: 'text-amber-500', bg: 'from-amber-500' };
    return { label: 'Poor', color: 'text-red-500', bg: 'from-red-500' };
  };
  
  const comfort = getComfortLevel();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        // Glassmorphism
        'bg-white/50 dark:bg-slate-800/50',
        'backdrop-blur-xl',
        'border border-white/60 dark:border-white/10',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]',
        'dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg bg-white/80 dark:bg-slate-900/50', comfort.color)}>
            <Sun className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Comfort</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn('text-3xl font-bold', comfort.color)}>{comfortScore}</span>
        <span className={cn('text-sm font-semibold', comfort.color)}>{comfort.label}</span>
      </div>
      
      {/* Circular progress */}
      <div className="mt-3 flex justify-center">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-200 dark:text-slate-700"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={comfort.color}
              strokeDasharray={`${(comfortScore / 100) * 176} 176`}
              initial={{ strokeDasharray: '0 176' }}
              animate={{ strokeDasharray: `${(comfortScore / 100) * 176} 176` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-sm font-bold', comfort.color)}>{comfortScore}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getHumidityLevel(humidity: number): string {
  if (humidity < 30) return 'Dry - Use moisturizer';
  if (humidity < 60) return 'Comfortable';
  if (humidity < 80) return 'Humid - May feel sticky';
  return 'Very humid';
}

function getWindLevel(speedKmh: number): string {
  if (speedKmh < 5) return 'Calm - No wind';
  if (speedKmh < 20) return 'Light breeze';
  if (speedKmh < 40) return 'Moderate wind';
  if (speedKmh < 60) return 'Strong - Hold onto hats!';
  return 'Very strong - Stay indoors';
}

function getPressureLevel(pressure: number): string {
  if (pressure < 1000) return 'Low - Storm likely';
  if (pressure < 1020) return 'Normal';
  return 'High - Clear weather';
}

function getCloudLevel(cloudCover: number): string {
  if (cloudCover < 20) return 'Clear skies';
  if (cloudCover < 50) return 'Partly cloudy';
  if (cloudCover < 80) return 'Mostly cloudy';
  return 'Overcast';
}
