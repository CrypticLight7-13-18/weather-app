'use client';

import { useSyncExternalStore } from 'react';

// Breakpoints matching Tailwind's defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Subscribe function for useSyncExternalStore
const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};

// Server snapshot - default to desktop
const getServerSnapshot = () => false;

/**
 * Hook to check if a media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to check if the viewport is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
}

/**
 * Hook to check if the viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
}

/**
 * Hook to check if the viewport is mobile or tablet (< 1024px)
 */
export function useIsMobileOrTablet(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.lg - 1}px)`);
}

/**
 * Hook to check if the viewport is desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
}

/**
 * Hook to get the current breakpoint
 */
export function useBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'xs' {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const is2Xl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

  if (is2Xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

