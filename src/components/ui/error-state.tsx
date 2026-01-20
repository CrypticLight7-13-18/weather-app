'use client';

import { cn } from '@/lib/utils';
import { ApiError, ApiErrorType, API_ERROR_MESSAGES } from '@/types/api';
import {
  AlertCircle,
  WifiOff,
  MapPinOff,
  Clock,
  ServerOff,
  FileQuestion,
  RefreshCw,
} from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  error: ApiError | null;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ERROR_ICONS: Record<ApiErrorType, typeof AlertCircle> = {
  NETWORK_ERROR: WifiOff,
  LOCATION_NOT_FOUND: MapPinOff,
  GEOLOCATION_DENIED: MapPinOff,
  RATE_LIMITED: Clock,
  SERVER_ERROR: ServerOff,
  INVALID_DATA: FileQuestion,
  UNKNOWN_ERROR: AlertCircle,
};

const ERROR_TITLES: Record<ApiErrorType, string> = {
  NETWORK_ERROR: 'Connection Error',
  LOCATION_NOT_FOUND: 'Location Not Found',
  GEOLOCATION_DENIED: 'Location Access Denied',
  RATE_LIMITED: 'Too Many Requests',
  SERVER_ERROR: 'Server Error',
  INVALID_DATA: 'Invalid Data',
  UNKNOWN_ERROR: 'Something Went Wrong',
};

export function ErrorState({ error, onRetry, className, compact = false }: ErrorStateProps) {
  if (!error) return null;

  const Icon = ERROR_ICONS[error.type] || AlertCircle;
  const title = ERROR_TITLES[error.type] || 'Error';
  const message = error.message || API_ERROR_MESSAGES[error.type];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          // Light mode
          'bg-red-50 border border-red-200/80 text-red-700',
          // Dark mode
          'dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300',
          className
        )}
        role="alert"
      >
        <Icon className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
        <p className="text-sm flex-1">{message}</p>
        {error.retryable && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl',
        // Light mode
        'bg-linear-to-br from-red-50 via-white to-orange-50',
        'border border-red-100',
        // Dark mode
        'dark:from-red-900/20 dark:via-slate-800 dark:to-orange-900/20',
        'dark:border-red-800/30',
        className
      )}
      role="alert"
    >
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center mb-4',
        'bg-red-100 dark:bg-red-900/40'
      )}>
        <Icon className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-sm">
        {message}
      </p>
      {error.retryable && onRetry && (
        <Button onClick={onRetry} variant="primary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Inline error for form fields
export function InlineError({ message, className }: { message: string; className?: string }) {
  return (
    <p className={cn(
      'text-sm flex items-center gap-1 mt-1',
      'text-red-600 dark:text-red-400',
      className
    )} role="alert">
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}
