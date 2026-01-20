'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { Globe, Plus, X, Search } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocations } from '@/lib/api';

interface WorldClockProps {
  className?: string;
}

interface ClockCity {
  id: string;
  city: string;
  country: string;
  timezone: string;
}

// Popular cities for quick add
const POPULAR_CITIES: ClockCity[] = [
  { id: 'nyc', city: 'New York', country: 'USA', timezone: 'America/New_York' },
  { id: 'london', city: 'London', country: 'UK', timezone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { id: 'dubai', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  { id: 'paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
];

// Hook to get current time that updates every second
function useClockTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

// Get user's local timezone
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

// Get city name from timezone
function getCityFromTimezone(timezone: string): string {
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

// Format time for a specific timezone
function formatClockTime(date: Date, timezone: string): { hours: number; minutes: number; seconds: number; period: string; time: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone,
    });
    
    const parts = formatter.formatToParts(date);
    const hour12 = parseInt(parts.find(p => p.type === 'hour')?.value || '12');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
    const period = parts.find(p => p.type === 'dayPeriod')?.value?.toUpperCase() || 'AM';
    
    // Convert to 24h for clock hands
    let hours24 = hour12;
    if (period === 'PM' && hour12 !== 12) hours24 += 12;
    if (period === 'AM' && hour12 === 12) hours24 = 0;
    
    return {
      hours: hours24,
      minutes: minute,
      seconds: second,
      period,
      time: `${hour12}:${minute.toString().padStart(2, '0')}`,
    };
  } catch {
    return { hours: 0, minutes: 0, seconds: 0, period: 'AM', time: '--:--' };
  }
}

// Check if it's daytime
function isDaytime(date: Date, timezone: string): boolean {
  try {
    const hour = parseInt(new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).format(date));
    return hour >= 6 && hour < 18;
  } catch {
    return true;
  }
}

// Analog clock component
function AnalogClock({ 
  hours, 
  minutes, 
  seconds, 
  isDay,
  size = 'sm' 
}: { 
  hours: number; 
  minutes: number; 
  seconds: number;
  isDay: boolean;
  size?: 'sm' | 'md';
}) {
  const hourAngle = (hours % 12 + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;
  
  const dimensions = size === 'sm' ? 44 : 60;
  const center = dimensions / 2;
  
  return (
    <div 
      className={cn(
        'relative rounded-full flex items-center justify-center shrink-0',
        // Neumorphic clock face
        isDay 
          ? 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50' 
          : 'bg-gradient-to-br from-indigo-100 to-slate-200 dark:from-indigo-900/50 dark:to-slate-800/50',
        'shadow-[4px_4px_8px_rgba(174,184,194,0.4),-4px_-4px_8px_rgba(255,255,255,0.8),inset_0_0_4px_rgba(0,0,0,0.05)]',
        'dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(60,70,85,0.2),inset_0_0_4px_rgba(0,0,0,0.1)]'
      )}
      style={{ width: dimensions, height: dimensions }}
    >
      <svg width={dimensions} height={dimensions} viewBox={`0 0 ${dimensions} ${dimensions}`}>
        {/* Clock face markers */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <line
            key={angle}
            x1={center}
            y1={size === 'sm' ? 4 : 6}
            x2={center}
            y2={i % 3 === 0 ? (size === 'sm' ? 7 : 10) : (size === 'sm' ? 5 : 8)}
            stroke="currentColor"
            strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
            className="text-slate-400 dark:text-slate-500"
            transform={`rotate(${angle} ${center} ${center})`}
          />
        ))}
        
        {/* Hour hand */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={size === 'sm' ? 12 : 16}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="text-slate-700 dark:text-slate-200"
          transform={`rotate(${hourAngle} ${center} ${center})`}
        />
        
        {/* Minute hand */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={size === 'sm' ? 8 : 10}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="text-slate-600 dark:text-slate-300"
          transform={`rotate(${minuteAngle} ${center} ${center})`}
        />
        
        {/* Second hand */}
        <line
          x1={center}
          y1={center}
          x2={center}
          y2={size === 'sm' ? 6 : 8}
          stroke="currentColor"
          strokeWidth={0.75}
          strokeLinecap="round"
          className="text-red-500"
          transform={`rotate(${secondAngle} ${center} ${center})`}
        />
        
        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={size === 'sm' ? 1.5 : 2}
          className="fill-slate-700 dark:fill-slate-200"
        />
      </svg>
    </div>
  );
}

export function WorldClock({ className }: WorldClockProps) {
  const now = useClockTime();
  const userTimezone = useMemo(() => getUserTimezone(), []);
  const userCity = useMemo(() => getCityFromTimezone(userTimezone), [userTimezone]);
  
  const [cities, setCities] = useState<ClockCity[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('world-clock-cities');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [POPULAR_CITIES[0], POPULAR_CITIES[1]];
        }
      }
    }
    return [POPULAR_CITIES[0], POPULAR_CITIES[1]];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClockCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Save cities to localStorage
  useEffect(() => {
    localStorage.setItem('world-clock-cities', JSON.stringify(cities));
  }, [cities]);

  // Focus search input when adding
  useEffect(() => {
    if (isAdding && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isAdding]);

  // Estimate timezone from coordinates (simplified)
  function getTimezoneForCoords(lat: number, lon: number): string {
    // This is a rough estimate - ideally we'd use a timezone database
    const offset = Math.round(lon / 15);
    const timezones: Record<number, string> = {
      '-12': 'Pacific/Fiji',
      '-11': 'Pacific/Midway',
      '-10': 'Pacific/Honolulu',
      '-9': 'America/Anchorage',
      '-8': 'America/Los_Angeles',
      '-7': 'America/Denver',
      '-6': 'America/Chicago',
      '-5': 'America/New_York',
      '-4': 'America/Halifax',
      '-3': 'America/Sao_Paulo',
      '-2': 'Atlantic/South_Georgia',
      '-1': 'Atlantic/Azores',
      '0': 'Europe/London',
      '1': 'Europe/Paris',
      '2': 'Europe/Berlin',
      '3': 'Europe/Moscow',
      '4': 'Asia/Dubai',
      '5': 'Asia/Karachi',
      '6': 'Asia/Dhaka',
      '7': 'Asia/Bangkok',
      '8': 'Asia/Singapore',
      '9': 'Asia/Tokyo',
      '10': 'Australia/Sydney',
      '11': 'Pacific/Noumea',
      '12': 'Pacific/Auckland',
    };
    return timezones[offset] || 'UTC';
  }

  // Search for cities
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        const clockCities: ClockCity[] = results.slice(0, 5).map(r => ({
          id: `${r.latitude}-${r.longitude}`,
          city: r.name,
          country: r.country,
          timezone: getTimezoneForCoords(r.latitude, r.longitude),
        }));
        setSearchResults(clockCities);
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const addCity = useCallback((city: ClockCity) => {
    if (cities.length >= 5) return;
    if (cities.some(c => c.id === city.id)) return;
    setCities(prev => [...prev, city]);
    setIsAdding(false);
    setSearchQuery('');
  }, [cities]);

  const removeCity = useCallback((id: string) => {
    setCities(prev => prev.filter(c => c.id !== id));
  }, []);

  const suggestedCities = POPULAR_CITIES.filter(
    pc => !cities.some(c => c.id === pc.id)
  ).slice(0, 3);

  return (
    <Card className={cn('overflow-hidden', className)} padding="sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <CardTitle className="text-sm">World Clock</CardTitle>
        </div>
      </CardHeader>

      <div className="space-y-2">
        {/* User's local time */}
        <ClockRow
          city={userCity}
          country="Your Location"
          timezone={userTimezone}
          now={now}
          isLocal
        />

        {/* Added cities */}
        <AnimatePresence mode="popLayout">
          {cities.map((city) => (
            <ClockRow
              key={city.id}
              city={city.city}
              country={city.country}
              timezone={city.timezone}
              now={now}
              onRemove={() => removeCity(city.id)}
            />
          ))}
        </AnimatePresence>

        {/* Add city section */}
        {cities.length < 5 && (
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-slate-100 dark:border-slate-700/50"
              >
                {/* Search input */}
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any city..."
                    className={cn(
                      'w-full pl-8 pr-8 py-2 text-sm rounded-lg',
                      'bg-slate-50 dark:bg-slate-800/50',
                      'border border-slate-200 dark:border-slate-700',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500',
                      'placeholder:text-slate-400'
                    )}
                  />
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Search results */}
                {searchQuery && (
                  <div className="space-y-1 mb-2">
                    {isSearching ? (
                      <p className="text-xs text-slate-400 text-center py-2">Searching...</p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => addCity(result)}
                          className={cn(
                            'w-full flex items-center justify-between p-2 rounded-lg text-left',
                            'hover:bg-slate-100 dark:hover:bg-slate-700/50',
                            'transition-colors'
                          )}
                        >
                          <div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {result.city}
                            </span>
                            <span className="text-xs text-slate-400 ml-1.5">{result.country}</span>
                          </div>
                          <Plus className="h-4 w-4 text-slate-400" />
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">No cities found</p>
                    )}
                  </div>
                )}

                {/* Suggestions */}
                {!searchQuery && suggestedCities.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">Quick add</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedCities.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => addCity(city)}
                          className={cn(
                            'px-2 py-1 rounded-md text-xs',
                            'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-600/50',
                            'text-slate-600 dark:text-slate-300',
                            'transition-colors'
                          )}
                        >
                          {city.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.button
                key="add-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAdding(true)}
                className={cn(
                  'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg',
                  'text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                  'hover:bg-slate-50 dark:hover:bg-slate-800/30',
                  'transition-colors'
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add city
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}

function ClockRow({
  city,
  country,
  timezone,
  now,
  isLocal = false,
  onRemove,
}: {
  city: string;
  country: string;
  timezone: string;
  now: Date;
  isLocal?: boolean;
  onRemove?: () => void;
}) {
  const { hours, minutes, seconds, period, time } = formatClockTime(now, timezone);
  const isDay = isDaytime(now, timezone);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
      className={cn(
        'group flex items-center gap-3 p-2.5 rounded-2xl',
        'transition-all duration-200',
        isLocal
          ? cn(
              // Glassmorphism for local
              'bg-gradient-to-r from-blue-500/15 to-cyan-500/10',
              'backdrop-blur-sm',
              'border border-blue-200/50 dark:border-blue-500/20',
              'shadow-[0_2px_8px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]',
              'dark:shadow-[0_2px_8px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]'
            )
          : cn(
              'hover:bg-white/50 dark:hover:bg-white/5',
              'hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
              'dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
            )
      )}
    >
      {/* Analog clock */}
      <AnalogClock hours={hours} minutes={minutes} seconds={seconds} isDay={isDay} size="sm" />

      {/* City info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-800 dark:text-white truncate">
            {city}
          </span>
          {isLocal && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 font-semibold">
              YOU
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 truncate block">{country}</span>
      </div>

      {/* Digital time */}
      <div className="text-right shrink-0">
        <div className="flex items-baseline gap-0.5">
          <span className="text-base font-semibold tabular-nums text-slate-800 dark:text-white">
            {time}
          </span>
          <span className="text-[10px] text-slate-400">{period}</span>
        </div>
        <div className="flex items-center gap-1 justify-end">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            isDay ? 'bg-amber-400' : 'bg-indigo-400'
          )} />
          <span className="text-[10px] text-slate-400">{isDay ? 'Day' : 'Night'}</span>
        </div>
      </div>

      {/* Remove button */}
      {!isLocal && onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            'opacity-0 group-hover:opacity-100 p-1 rounded-full',
            'hover:bg-red-100 dark:hover:bg-red-900/30',
            'text-slate-400 hover:text-red-500 dark:hover:text-red-400',
            'transition-all duration-150'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
