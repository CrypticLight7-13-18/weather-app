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
  const { devMode } = useAppStore();
  const [activeError, setActiveError] = useState<ApiErrorType | null>(null);

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

  return (
    <Card
      className={cn(
        'border-2 border-dashed border-amber-400 dark:border-amber-600',
        'bg-amber-50 dark:bg-amber-900/20',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Bug className="h-4 w-4" />
          Error Simulation (Dev Only)
        </CardTitle>
        {activeError && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetError(null)}
            className="text-amber-600 hover:text-amber-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>

      <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
        Select an error type to simulate. The next API call will fail with this error.
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
                ? 'border-amber-500 bg-amber-100 dark:bg-amber-800/30'
                : 'border-transparent bg-white dark:bg-slate-800 hover:border-amber-300'
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
        <div className="mt-4 p-3 rounded-xl bg-amber-100 dark:bg-amber-800/30">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
            Active Simulation:
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {API_ERROR_MESSAGES[activeError]}
          </p>
        </div>
      )}
    </Card>
  );
}

