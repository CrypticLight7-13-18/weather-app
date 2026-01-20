'use client';

import { useEffect, useSyncExternalStore, ReactNode } from 'react';
import { useAppStore } from '@/stores';

interface ThemeProviderProps {
  children: ReactNode;
}

// Hydration-safe way to detect if we're on the client
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({ children }: ThemeProviderProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { settings } = useAppStore();

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const { theme } = settings;

    const applyTheme = () => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = systemPrefersDark;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, settings]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

