'use client';

import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks';
import { Location, SearchResult } from '@/types/location';
import { Input, Button, ErrorState, EmptyState } from '@/components/ui';
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchDialogProps {
  onSelect: (location: Location) => void;
  onClose: () => void;
}

export function SearchDialog({ onSelect, onClose }: SearchDialogProps) {
  const {
    query,
    results,
    isLoading,
    error,
    recentSearches,
    search,
    selectResult,
    selectRecentSearch,
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const location = selectResult(result);
      onSelect(location);
    },
    [selectResult, onSelect]
  );

  const handleSelectRecent = useCallback(
    (location: Location) => {
      selectRecentSearch(location);
      onSelect(location);
    },
    [selectRecentSearch, onSelect]
  );

  const showRecents = query.length < 2 && recentSearches.length > 0;
  const showResults = query.length >= 2 && results.length > 0;
  const showEmpty = query.length >= 2 && results.length === 0 && !isLoading && !error;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[15vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 backdrop-blur-sm',
            'bg-slate-900/20 dark:bg-black/50'
          )}
          aria-hidden="true"
        />

        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'relative w-full max-w-lg mx-4',
            'rounded-2xl shadow-2xl overflow-hidden',
            'bg-white border border-slate-200/50',
            'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]',
            'dark:bg-slate-900 dark:border-slate-700/50'
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Search locations"
        >
          <div className={cn(
            'relative p-4 border-b',
            'border-slate-200 dark:border-slate-700'
          )}>
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => search(e.target.value)}
              icon={
                isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <Search className="h-5 w-5" />
                )
              }
              suffix={
                query.length > 0 && (
                  <button
                    onClick={() => search('')}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )
              }
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              Cancel
            </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto">
            {error && (
              <div className="p-4">
                <ErrorState error={error} compact />
              </div>
            )}

            {showRecents && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recent Searches
                </p>
                <ul>
                  {recentSearches.map((location) => (
                    <li key={location.id}>
                      <button
                        onClick={() => handleSelectRecent(location)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
                          'transition-colors duration-150',
                          'hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {location.name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {location.country}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showResults && (
              <ul className="p-2">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      onClick={() => handleSelectResult(result)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
                        'transition-colors duration-150',
                        'hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {result.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {result.displayName}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showEmpty && <EmptyState variant="search" className="py-8" />}

            {query.length === 0 && recentSearches.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Start typing to search for a city</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
