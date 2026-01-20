'use client';

import { cn } from '@/lib/utils';
import { WeatherCode, getWeatherCondition } from '@/types/weather';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Snowflake,
  LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherIconProps {
  code: WeatherCode;
  isDay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animated?: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-moon': CloudMoon,
  'cloud-rain': CloudRain,
  'cloud-drizzle': CloudDrizzle,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
  snowflake: Snowflake,
};

const SIZE_CLASSES = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-24 w-24',
};

export function WeatherIcon({
  code,
  isDay = true,
  size = 'md',
  className,
  animated = false,
}: WeatherIconProps) {
  const condition = getWeatherCondition(code, isDay);
  const Icon = ICON_MAP[condition.icon] || Cloud;

  const iconElement = (
    <Icon
      className={cn(SIZE_CLASSES[size], getIconColor(code, isDay))}
      aria-label={condition.label}
    />
  );

  if (!animated) {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        {iconElement}
      </div>
    );
  }

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', className)}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {iconElement}
    </motion.div>
  );
}

function getIconColor(code: WeatherCode, isDay: boolean): string {
  if ([0, 1].includes(code)) {
    return isDay
      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
      : 'text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]';
  }
  if (code === 2) {
    return isDay ? 'text-slate-400' : 'text-slate-500';
  }
  if (code === 3) {
    return 'text-slate-500';
  }
  if ([45, 48].includes(code)) {
    return 'text-slate-400';
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return 'text-blue-400';
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]';
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]';
  }
  if ([95, 96, 99].includes(code)) {
    return 'text-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]';
  }
  return 'text-slate-400';
}

export function WeatherIconHero({
  code,
  isDay = true,
  className,
}: Omit<WeatherIconProps, 'size'>) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'absolute inset-0 blur-3xl opacity-30 rounded-full',
          getBgGlow(code, isDay)
        )}
      />
      <WeatherIcon
        code={code}
        isDay={isDay}
        size="2xl"
        animated
        className="relative z-10"
      />
    </div>
  );
}

function getBgGlow(code: WeatherCode, isDay: boolean): string {
  if ([0, 1].includes(code)) {
    return isDay ? 'bg-amber-400' : 'bg-indigo-400';
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return 'bg-blue-500';
  }
  if ([71, 73, 75, 85, 86].includes(code)) {
    return 'bg-cyan-300';
  }
  if ([95, 96, 99].includes(code)) {
    return 'bg-purple-500';
  }
  return 'bg-slate-400';
}
