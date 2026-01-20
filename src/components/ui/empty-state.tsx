'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, Search, Star, MapPin, CloudOff } from 'lucide-react';
import { Button } from './button';

type EmptyStateVariant = 'search' | 'favorites' | 'location' | 'weather' | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const VARIANTS: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try searching for a different city or location.',
  },
  favorites: {
    icon: Star,
    title: 'No favorites yet',
    description: 'Save your favorite locations for quick access to their weather.',
  },
  location: {
    icon: MapPin,
    title: 'No location selected',
    description: 'Search for a location or use your current position to see weather data.',
  },
  weather: {
    icon: CloudOff,
    title: 'No weather data',
    description: 'Unable to load weather information. Please try again.',
  },
  custom: {
    icon: CloudOff,
    title: '',
    description: '',
  },
};

export function EmptyState({
  variant = 'custom',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = VARIANTS[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {displayTitle}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        {displayDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}

