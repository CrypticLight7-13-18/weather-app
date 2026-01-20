'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchStore, useAppStore } from '@/stores';
import { searchLocations, searchResultToLocation } from '@/lib/api';
import { SearchResult, Location } from '@/types/location';
import { ApiError } from '@/types/api';

const DEBOUNCE_DELAY = 300;

export function useSearch() {
  const {
    query,
    results,
    status,
    error,
    isOpen,
    setQuery,
    setResults,
    setStatus,
    setError,
    setIsOpen,
    reset,
  } = useSearchStore();

  const { recentSearches, addRecentSearch } = useAppStore();
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setQuery(searchQuery);

      if (searchQuery.trim().length < 2) {
        setResults([]);
        setStatus('idle');
        return;
      }

      // Debounce the actual search
      debounceRef.current = setTimeout(async () => {
        setStatus('loading');
        abortControllerRef.current = new AbortController();

        try {
          const searchResults = await searchLocations(searchQuery);
          setResults(searchResults);
        } catch (err) {
          // Don't set error if request was aborted
          if ((err as Error).name !== 'AbortError') {
            setError(err as ApiError);
          }
        }
      }, DEBOUNCE_DELAY);
    },
    [setQuery, setResults, setStatus, setError]
  );

  const selectResult = useCallback(
    (result: SearchResult): Location => {
      const location = searchResultToLocation(result);
      addRecentSearch(location);
      reset();
      return location;
    },
    [addRecentSearch, reset]
  );

  const selectRecentSearch = useCallback(
    (location: Location): Location => {
      addRecentSearch(location);
      reset();
      return location;
    },
    [addRecentSearch, reset]
  );

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const close = useCallback(() => {
    reset();
  }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    status,
    error,
    isOpen,
    recentSearches,
    isLoading: status === 'loading',
    search,
    selectResult,
    selectRecentSearch,
    open,
    close,
  };
}

