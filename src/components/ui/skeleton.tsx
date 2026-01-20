'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rounded';
}

export function Skeleton({
  className,
  variant = 'default',
}: SkeletonProps) {
  const variantStyles = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse',
        'bg-slate-200 dark:bg-slate-700',
        variantStyles[variant],
        className
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        'bg-white border border-slate-200/80 shadow-sm',
        'dark:bg-slate-800 dark:border-slate-700',
        className
      )}
    >
      <Skeleton className="h-5 w-24 mb-4" />
      <Skeleton className="h-12 w-32 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function SkeletonWeatherCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        'bg-linear-to-br from-slate-100 via-slate-50 to-blue-50',
        'dark:from-slate-800 dark:via-slate-800 dark:to-slate-900',
        'border border-slate-200/50 dark:border-slate-700/50',
        className
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-16 w-16" variant="circular" />
      </div>
      <Skeleton className="h-20 w-40 mb-4" />
      <Skeleton className="h-5 w-28 mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHourlyForecast({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-4 overflow-hidden', className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 w-8" variant="circular" />
          <Skeleton className="h-5 w-8" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDailyForecast({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-6" variant="circular" />
          <div className="flex-1" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('h-64', className)}>
      <Skeleton className="w-full h-full" variant="rounded" />
    </div>
  );
}
