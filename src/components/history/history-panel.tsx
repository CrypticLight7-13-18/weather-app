'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores';
import { Location } from '@/types/location';
import { TemperatureUnit } from '@/types';
import { Card, EmptyState, Button } from '@/components/ui';
import { WeatherIcon } from '@/components/weather';
import { formatTemperatureShort } from '@/lib/utils';
import { History, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryPanelProps {
  onSelect: (location: Location) => void;
  className?: string;
}

export function HistoryPanel({ onSelect, className }: HistoryPanelProps) {
  const { browsingHistory, removeFromHistory, clearHistory, settings } = useAppStore();

  if (browsingHistory.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          variant="custom"
          icon={History}
          title="No history yet"
          description="Locations you view will appear here for quick access."
        />
      </Card>
    );
  }

  return (
    <Card className={className} padding="sm">
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            History
          </h2>
        </div>
        {browsingHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs text-slate-500 hover:text-red-500"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {browsingHistory.map((entry) => (
          <HistoryItem
            key={`${entry.location.id}-${entry.timestamp}`}
            entry={entry}
            onSelect={() => onSelect(entry.location)}
            onRemove={() => removeFromHistory(entry.location.id)}
            temperatureUnit={settings.temperatureUnit}
          />
        ))}
      </div>
    </Card>
  );
}

interface HistoryItemProps {
  entry: {
    location: Location;
    timestamp: number;
    weatherSummary?: {
      temperature: number;
      weatherCode: number;
      isDay: boolean;
    };
  };
  onSelect: () => void;
  onRemove: () => void;
  temperatureUnit: TemperatureUnit;
}

function HistoryItem({ entry, onSelect, onRemove, temperatureUnit }: HistoryItemProps) {
  const { location, timestamp, weatherSummary } = entry;
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl cursor-pointer',
        'transition-all duration-200',
        'hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
    >
      {/* Location info */}
      <button
        onClick={onSelect}
        className="flex-1 flex items-center gap-3 text-left"
      >
        {weatherSummary ? (
          <WeatherIcon
            code={weatherSummary.weatherCode as any}
            isDay={weatherSummary.isDay}
            size="sm"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <Clock className="h-3 w-3 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white truncate">
            {location.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {timeAgo}
          </p>
        </div>
        {weatherSummary && (
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            {formatTemperatureShort(weatherSummary.temperature, temperatureUnit)}
          </span>
        )}
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
          'transition-all duration-200',
          'hover:bg-red-100 text-slate-400 hover:text-red-500',
          'dark:hover:bg-red-900/30'
        )}
        aria-label={`Remove ${location.name} from history`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Compact history for the main page sidebar
export function HistoryPanelCompact({ onSelect, className }: HistoryPanelProps) {
  const { browsingHistory, settings } = useAppStore();

  // Only show if we have history
  if (browsingHistory.length === 0) {
    return null;
  }

  // Show only the last 5 items
  const recentHistory = browsingHistory.slice(0, 5);

  return (
    <Card className={className} padding="sm">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <History className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recently Viewed
        </h2>
      </div>

      <div className="space-y-1">
        {recentHistory.map((entry) => (
          <button
            key={`${entry.location.id}-${entry.timestamp}`}
            onClick={() => onSelect(entry.location)}
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-lg text-left',
              'transition-all duration-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {entry.weatherSummary ? (
              <WeatherIcon
                code={entry.weatherSummary.weatherCode as any}
                isDay={entry.weatherSummary.isDay}
                size="sm"
              />
            ) : (
              <Clock className="h-4 w-4 text-slate-400" />
            )}
            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {entry.location.name}
            </span>
            {entry.weatherSummary && (
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatTemperatureShort(entry.weatherSummary.temperature, settings.temperatureUnit)}
              </span>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}
