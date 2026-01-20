'use client';

import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/button';
import { useTheme } from '@/hooks';
import { Search, Sun, Moon, Monitor, RefreshCw, MapPin } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onRefresh: () => void;
  onDetectLocation: () => void;
  isRefreshing?: boolean;
  isDetectingLocation?: boolean;
  className?: string;
}

export function Header({
  onSearchClick,
  onRefresh,
  onDetectLocation,
  isRefreshing,
  isDetectingLocation,
  className,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        // Light mode styles
        'bg-white/90 border-b border-slate-200/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
        // Dark mode styles
        'dark:bg-slate-900/90 dark:border-slate-700/50',
        'dark:shadow-none',
        // Common
        'backdrop-blur-xl backdrop-saturate-150',
        'px-4 py-3',
        className
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-linear-to-br from-sky-400 to-blue-600',
            'shadow-lg shadow-blue-500/30'
          )}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              Weather
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              by Open-Meteo
            </p>
          </div>
        </div>

        {/* Search bar (clickable on mobile) */}
        <button
          onClick={onSearchClick}
          className={cn(
            'flex-1 max-w-md flex items-center gap-3 px-4 py-2.5 rounded-xl',
            // Light mode
            'bg-slate-100/80 border border-slate-200/60',
            'text-slate-500 hover:bg-slate-100 hover:border-slate-300/60',
            // Dark mode
            'dark:bg-slate-800/80 dark:border-slate-700/50',
            'dark:text-slate-400 dark:hover:bg-slate-700/80',
            // Common
            'transition-all duration-200'
          )}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Search for a city...</span>
          <kbd className={cn(
            'hidden md:inline-flex ml-auto px-2 py-0.5 rounded text-xs font-medium',
            'bg-white border border-slate-200 text-slate-400',
            'dark:bg-slate-700 dark:border-slate-600 dark:text-slate-500'
          )}>
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <IconButton
            label="Detect my location"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className={cn(
              isDetectingLocation && 'animate-pulse',
              'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <MapPin className={cn(
              'h-5 w-5',
              isDetectingLocation ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
            )} />
          </IconButton>
          
          <IconButton
            label="Refresh weather"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={cn(
              'h-5 w-5 text-slate-500 dark:text-slate-400',
              isRefreshing && 'animate-spin'
            )} />
          </IconButton>
          
          <IconButton
            label={`Switch to ${theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark'} theme`}
            onClick={toggleTheme}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ThemeIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
