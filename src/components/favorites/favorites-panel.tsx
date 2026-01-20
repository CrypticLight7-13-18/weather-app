'use client';

import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks';
import { useAppStore } from '@/stores';
import { Location } from '@/types/location';
import { Card, EmptyState } from '@/components/ui';
import { WeatherIcon } from '@/components/weather';
import { formatTemperatureShort } from '@/lib/utils';
import { Star, Trash2, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';

interface FavoritesPanelProps {
  onSelect: (location: Location) => void;
  className?: string;
}

export function FavoritesPanel({ onSelect, className }: FavoritesPanelProps) {
  const { favorites, removeFavorite, reorderFavorites, getFavoriteWeather } = useFavorites();
  const { settings } = useAppStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          variant="favorites"
          action={{
            label: 'Search locations',
            onClick: () => {}, // Will be handled by parent
          }}
        />
      </Card>
    );
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex.current !== null && draggedIndex !== dragOverIndex.current) {
      reorderFavorites(draggedIndex, dragOverIndex.current);
    }
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  return (
    <Card className={className} padding="sm">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <Star className="h-4 w-4 text-amber-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Favorites
        </h2>
      </div>

      <div className="space-y-1">
        {favorites.map((location, index) => {
          const weather = getFavoriteWeather(location.id);
          
          return (
            <div
              key={location.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer',
                'transition-all duration-200',
                // Glassmorphism on hover
                'hover:bg-white/60 dark:hover:bg-white/5',
                'hover:backdrop-blur-sm',
                'hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.5)]',
                'dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]',
                // Drag state
                'dark:hover:bg-slate-800',
                draggedIndex === index && 'opacity-50'
              )}
            >
              {/* Drag handle */}
              <div
                className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>

              {/* Location info */}
              <button
                onClick={() => onSelect(location)}
                className="flex-1 flex items-center gap-3 text-left"
              >
                {weather && (
                  <WeatherIcon
                    code={weather.current.weatherCode}
                    isDay={weather.current.isDay}
                    size="sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {location.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {location.country}
                  </p>
                </div>
                {weather && (
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatTemperatureShort(weather.current.temperature, settings.temperatureUnit)}
                  </span>
                )}
              </button>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(location.id);
                }}
                className={cn(
                  'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
                  'transition-all duration-200',
                  // Light mode
                  'hover:bg-red-100 text-slate-400 hover:text-red-500',
                  // Dark mode
                  'dark:hover:bg-red-900/30'
                )}
                aria-label={`Remove ${location.name} from favorites`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
