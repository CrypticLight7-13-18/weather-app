'use client';

import { cn } from '@/lib/utils';
import { setSimulatedError, getSimulatedError } from '@/lib/api';
import { ApiErrorType, API_ERROR_MESSAGES } from '@/types/api';
import { useAppStore } from '@/stores';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import {
  Bug,
  WifiOff,
  MapPinOff,
  Clock,
  ServerOff,
  FileQuestion,
  AlertCircle,
  X,
  CheckCircle,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

const ERROR_OPTIONS: Array<{
  type: ApiErrorType;
  label: string;
  icon: typeof WifiOff;
  color: string;
}> = [
  { type: 'NETWORK_ERROR', label: 'Network Error', icon: WifiOff, color: 'text-red-500' },
  { type: 'LOCATION_NOT_FOUND', label: 'Location Not Found', icon: MapPinOff, color: 'text-orange-500' },
  { type: 'GEOLOCATION_DENIED', label: 'Geolocation Denied', icon: MapPinOff, color: 'text-amber-500' },
  { type: 'RATE_LIMITED', label: 'Rate Limited', icon: Clock, color: 'text-yellow-500' },
  { type: 'SERVER_ERROR', label: 'Server Error', icon: ServerOff, color: 'text-purple-500' },
  { type: 'INVALID_DATA', label: 'Invalid Data', icon: FileQuestion, color: 'text-blue-500' },
  { type: 'UNKNOWN_ERROR', label: 'Unknown Error', icon: AlertCircle, color: 'text-slate-500' },
];

interface ErrorSimulationPanelProps {
  className?: string;
}

export function ErrorSimulationPanel({ className }: ErrorSimulationPanelProps) {
  const { devMode, resetAllData, favorites, recentSearches, browsingHistory } = useAppStore();
  const [activeError, setActiveError] = useState<ApiErrorType | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setActiveError(getSimulatedError());
  }, []);

  if (!devMode) {
    return null;
  }

  const handleSetError = (errorType: ApiErrorType | null) => {
    setSimulatedError(errorType);
    setActiveError(errorType);
  };

  const handleReset = () => {
    resetAllData();
  };

  // Calculate storage stats
  const storageStats = {
    favorites: favorites.length,
    searches: recentSearches.length,
    history: browsingHistory.length,
  };

  return (
    <Card
      className={cn(
        'border-2 border-dashed',
        'border-amber-400 bg-amber-50',
        'dark:border-amber-600 dark:bg-amber-900/20',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Bug className="h-4 w-4" />
          Developer Tools
        </CardTitle>
        {activeError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetError(null)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>

      {/* Error Simulation Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
          Error Simulation
        </h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
          Select an error type to simulate on the next API call.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {ERROR_OPTIONS.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => handleSetError(activeError === type ? null : type)}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl text-left',
                'transition-all duration-200',
                'border-2',
                activeError === type
                  ? cn(
                      'border-amber-500',
                      'bg-amber-100 dark:bg-amber-800/30'
                    )
                  : cn(
                      'border-transparent',
                      'bg-white hover:border-amber-300',
                      'dark:bg-slate-800 dark:hover:border-amber-600'
                    )
              )}
            >
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
              </span>
              {activeError === type && (
                <CheckCircle className="h-4 w-4 text-amber-500 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {activeError && (
          <div className={cn(
            'mt-3 p-3 rounded-xl',
            'bg-amber-100 dark:bg-amber-800/30'
          )}>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
              Active Simulation:
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {API_ERROR_MESSAGES[activeError]}
            </p>
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className={cn(
        'pt-4 border-t',
        'border-amber-300 dark:border-amber-700'
      )}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
          Data Management
        </h3>

        {/* Storage Stats */}
        <div className={cn(
          'p-3 rounded-xl mb-3',
          'bg-white/50 dark:bg-slate-800/50'
        )}>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            Stored Data:
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {storageStats.favorites}
              </p>
              <p className="text-xs text-slate-500">Favorites</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {storageStats.searches}
              </p>
              <p className="text-xs text-slate-500">Searches</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {storageStats.history}
              </p>
              <p className="text-xs text-slate-500">History</p>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className={cn(
              'w-full flex items-center justify-center gap-2 p-3 rounded-xl',
              'text-sm font-medium',
              'transition-all duration-200',
              'bg-red-100 text-red-700 hover:bg-red-200',
              'dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Reset All Data & Start Fresh
          </button>
        ) : (
          <div className={cn(
            'p-4 rounded-xl',
            'bg-red-100 dark:bg-red-900/30',
            'border-2 border-red-300 dark:border-red-700'
          )}>
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                  Are you sure?
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  This will delete all your favorites, search history, browsing history, 
                  and settings. The page will reload to start fresh.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReset}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Reset Everything
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
