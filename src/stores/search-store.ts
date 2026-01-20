'use client';

import { create } from 'zustand';
import { SearchResult } from '@/types/location';
import { ApiError } from '@/types/api';
import { LoadingState } from '@/types';

interface SearchState {
  query: string;
  results: SearchResult[];
  status: LoadingState;
  error: ApiError | null;
  isOpen: boolean;

  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setStatus: (status: LoadingState) => void;
  setError: (error: ApiError | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  status: 'idle',
  error: null,
  isOpen: false,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results, status: 'success', error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  setIsOpen: (isOpen) => set({ isOpen }),
  
  reset: () =>
    set({
      query: '',
      results: [],
      status: 'idle',
      error: null,
      isOpen: false,
    }),
}));

