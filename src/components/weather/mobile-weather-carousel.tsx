'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Location } from '@/types/location';
import { WeatherData, HistoricalData, WEATHER_CONDITIONS, WeatherCode } from '@/types/weather';
import { Settings } from '@/types';
import { HourlyForecast } from './hourly-forecast';
import { DailyForecast } from './daily-forecast';
import { WeatherDetails } from './weather-details';
import { HistoricalChart } from './historical-chart';
import { Navigation, Plus, List, MapPin, Trash2, GripVertical, X } from 'lucide-react';

interface LocationWeather {
    location: Location;
    weather: WeatherData | null;
    isLoading: boolean;
    error: string | null;
    isMyLocation?: boolean;
}

interface MobileWeatherCarouselProps {
    locations: LocationWeather[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    onAddLocation: () => void;
    onShowLocationList: () => void;
    settings: Settings;
    historicalData?: HistoricalData[] | null;
    historicalStatus?: 'idle' | 'loading' | 'success' | 'error';
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 300;

export function MobileWeatherCarousel({
    locations,
    currentIndex,
    onIndexChange,
    onAddLocation,
    onShowLocationList,
    settings,
    historicalData,
    historicalStatus,
}: MobileWeatherCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // Use motion values for smooth drag handling
    const dragX = useMotionValue(0);
    const animatedX = useSpring(dragX, { 
        stiffness: 400, 
        damping: 40,
        mass: 0.5,
    });
    
    // Track the internal index to avoid race conditions
    const internalIndexRef = useRef(currentIndex);

    // Measure container width
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Sync position when index changes from outside (e.g., clicking indicators)
    useEffect(() => {
        if (containerWidth > 0 && !isDragging) {
            internalIndexRef.current = currentIndex;
            dragX.set(-currentIndex * containerWidth);
        }
    }, [currentIndex, containerWidth, isDragging, dragX]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDrag = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (containerWidth === 0) return;
            
            // Calculate position based on internal index to avoid stale state
            const baseX = -internalIndexRef.current * containerWidth;
            let newX = baseX + info.offset.x;
            
            // Add edge resistance at boundaries
            const minX = -(locations.length - 1) * containerWidth;
            const maxX = 0;
            
            if (newX > maxX) {
                // At first item, add resistance
                newX = maxX + (newX - maxX) * 0.3;
            } else if (newX < minX) {
                // At last item, add resistance
                newX = minX + (newX - minX) * 0.3;
            }
            
            dragX.set(newX);
        },
        [containerWidth, locations.length, dragX]
    );

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (containerWidth === 0) {
                setIsDragging(false);
                return;
            }
            
            const { offset, velocity } = info;

            // Determine if we should change page
            const shouldChangeByOffset = Math.abs(offset.x) > SWIPE_THRESHOLD;
            const shouldChangeByVelocity = Math.abs(velocity.x) > SWIPE_VELOCITY_THRESHOLD;

            let newIndex = internalIndexRef.current;

            if (shouldChangeByOffset || shouldChangeByVelocity) {
                // Swipe right (positive offset) -> go to previous (index - 1)
                // Swipe left (negative offset) -> go to next (index + 1)
                const direction = offset.x > 0 ? -1 : 1;
                newIndex = Math.max(0, Math.min(locations.length - 1, newIndex + direction));
            }

            // Update internal ref immediately
            internalIndexRef.current = newIndex;
            
            // Animate to the target position
            const targetX = -newIndex * containerWidth;
            dragX.set(targetX);
            
            // Set dragging false first to allow the spring to animate
            setIsDragging(false);
            
            // Update parent state if index changed
            if (newIndex !== currentIndex) {
                onIndexChange(newIndex);
            }
        },
        [currentIndex, locations.length, containerWidth, onIndexChange, dragX]
    );

    const currentLocation = locations[currentIndex];

    if (locations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    No Locations
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Add a location to see weather information
                </p>
                <button
                    onClick={onAddLocation}
                    className={cn(
                        'flex items-center gap-2 px-6 py-3 rounded-2xl',
                        'bg-blue-500 text-white font-medium',
                        'hover:bg-blue-600 transition-colors'
                    )}
                >
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full">
            {/* Location header with integrated page indicators */}
            <div className="sticky top-0 z-20 pt-4 pb-2 px-4 text-center">
                {/* Location name */}
                <div className="flex items-center justify-center gap-1.5">
                    {currentLocation?.isMyLocation && (
                        <Navigation className="w-3.5 h-3.5 text-white/80" />
                    )}
                    <h1 className="text-lg font-medium text-white">
                        {currentLocation?.isMyLocation ? 'My Location' : currentLocation?.location.name}
                    </h1>
                </div>
                
                {/* City name (only for My Location) or country */}
                <p className="text-sm text-white/70 mt-0.5">
                    {currentLocation?.isMyLocation 
                        ? currentLocation.location.name
                        : currentLocation?.location.country}
                </p>

                {/* Page indicators - below location info */}
                {locations.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                        {locations.map((loc, index) => (
                            <button
                                key={`indicator-${index}-${loc.location.id}`}
                                onClick={() => onIndexChange(index)}
                                className={cn(
                                    'transition-all duration-300 rounded-full',
                                    index === currentIndex
                                        ? 'w-6 h-1.5 bg-white shadow-lg'
                                        : 'w-1.5 h-1.5 bg-white/40'
                                )}
                                aria-label={`Go to ${loc.location.name}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Carousel container */}
            <div
                ref={containerRef}
                className="overflow-hidden touch-pan-y"
            >
                <motion.div
                    className="flex cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragDirectionLock
                    dragMomentum={false}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    style={{ 
                        width: `${locations.length * 100}%`,
                        x: animatedX,
                    }}
                >
                    {locations.map((locWeather, index) => (
                        <div
                            key={`carousel-${index}-${locWeather.location.id}`}
                            className="shrink-0 px-4"
                            style={{ width: containerWidth || '100%' }}
                        >
                            <LocationPage
                                locationWeather={locWeather}
                                settings={settings}
                                historicalData={index === currentIndex ? historicalData : undefined}
                                historicalStatus={index === currentIndex ? historicalStatus : undefined}
                                isActive={index === currentIndex}
                                isDragging={isDragging}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-safe">
                <div className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-2xl',
                    'bg-white/20 dark:bg-black/20 backdrop-blur-xl',
                    'border border-white/20 dark:border-white/10'
                )}>
                    <button
                        onClick={onShowLocationList}
                        className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                        aria-label="Show location list"
                    >
                        <List className="w-6 h-6 text-white" />
                    </button>

                    <div className="flex items-center gap-1 text-white/60 text-xs">
                        <span>{currentIndex + 1}</span>
                        <span>/</span>
                        <span>{locations.length}</span>
                    </div>

                    <button
                        onClick={onAddLocation}
                        className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                        aria-label="Add location"
                    >
                        <Plus className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Individual location page
function LocationPage({
    locationWeather,
    settings,
    historicalData,
    historicalStatus,
    isActive,
    isDragging,
}: {
    locationWeather: LocationWeather;
    settings: Settings;
    historicalData?: HistoricalData[] | null;
    historicalStatus?: 'idle' | 'loading' | 'success' | 'error';
    isActive: boolean;
    isDragging: boolean;
}) {
    const { weather, isLoading, error } = locationWeather;

    if (isLoading && !weather) {
        return (
            <div className="space-y-4 pb-24">
                <MobileWeatherSkeleton />
            </div>
        );
    }

    if (error && !weather) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Unable to Load Weather</h3>
                <p className="text-white/60 text-sm">{error}</p>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div
            className={cn(
                'space-y-4 pb-24 transition-opacity duration-200',
                isDragging && !isActive && 'opacity-70'
            )}
        >
            {/* Large temperature display */}
            <div className="text-center py-4">
                <div className="text-8xl font-thin text-white mb-2">
                    {Math.round(
                        settings.temperatureUnit === 'fahrenheit'
                            ? weather.current.temperature * 9 / 5 + 32
                            : weather.current.temperature
                    )}°
                </div>
                <p className="text-xl text-white/80">
                    {WEATHER_CONDITIONS[weather.current.weatherCode as WeatherCode]?.label || 'Unknown'}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-white/60">
                    <span>
                        H:{Math.round(
                            settings.temperatureUnit === 'fahrenheit'
                                ? weather.daily[0].temperatureMax * 9 / 5 + 32
                                : weather.daily[0].temperatureMax
                        )}°
                    </span>
                    <span>
                        L:{Math.round(
                            settings.temperatureUnit === 'fahrenheit'
                                ? weather.daily[0].temperatureMin * 9 / 5 + 32
                                : weather.daily[0].temperatureMin
                        )}°
                    </span>
                </div>
            </div>

            {/* Hourly forecast - scrollable */}
            <div className={cn(
                'rounded-2xl overflow-hidden',
                'bg-white/10 dark:bg-white/5 backdrop-blur-xl',
                'border border-white/20 dark:border-white/10'
            )}>
                <HourlyForecast
                    hourly={weather.hourly}
                    temperatureUnit={settings.temperatureUnit}
                />
            </div>

            {/* Daily forecast */}
            <div className={cn(
                'rounded-2xl overflow-hidden',
                'bg-white/10 dark:bg-white/5 backdrop-blur-xl',
                'border border-white/20 dark:border-white/10'
            )}>
                <DailyForecast
                    daily={weather.daily}
                    temperatureUnit={settings.temperatureUnit}
                />
            </div>

            {/* Weather details grid */}
            <WeatherDetails
                current={weather.current}
                settings={settings}
            />

            {/* Historical chart */}
            {historicalData && historicalStatus === 'success' && (
                <HistoricalChart
                    data={historicalData}
                    settings={settings}
                />
            )}
        </div>
    );
}

function MobileWeatherSkeleton() {
    return (
        <>
            {/* Temperature skeleton */}
            <div className="text-center py-8">
                <div className="w-40 h-24 mx-auto bg-white/10 rounded-2xl animate-pulse mb-4" />
                <div className="w-32 h-6 mx-auto bg-white/10 rounded-lg animate-pulse mb-2" />
                <div className="w-24 h-4 mx-auto bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Hourly skeleton */}
            <div className="bg-white/10 rounded-2xl p-4">
                <div className="w-24 h-4 bg-white/10 rounded animate-pulse mb-3" />
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-10 h-3 bg-white/10 rounded animate-pulse" />
                            <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                            <div className="w-8 h-4 bg-white/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily skeleton */}
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                        <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                        <div className="flex-1 mx-4 h-1 bg-white/10 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </>
    );
}

// Location list modal with edit mode
interface LocationListModalProps {
    isOpen: boolean;
    onClose: () => void;
    locations: LocationWeather[];
    currentIndex: number;
    onSelectLocation: (index: number) => void;
    onRemoveLocation: (locationId: string) => void;
    onReorderLocations: (fromIndex: number, toIndex: number) => void;
    onAddLocation: () => void;
    settings: Settings;
}

export function LocationListModal({
    isOpen,
    onClose,
    locations,
    currentIndex,
    onSelectLocation,
    onRemoveLocation,
    onReorderLocations,
    onAddLocation,
    settings,
}: LocationListModalProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [swipedIndex, setSwipedIndex] = useState<number | null>(null);

    // Reset edit mode when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Use setTimeout to avoid synchronous state updates in effect
            const timer = setTimeout(() => {
                setIsEditMode(false);
                setSwipedIndex(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSwipe = useCallback((index: number, info: PanInfo) => {
        const loc = locations[index];
        // Don't allow swiping "My Location"
        if (loc.isMyLocation) return;
        
        // Swipe left to reveal delete
        if (info.offset.x < -80) {
            setSwipedIndex(index);
        } else if (info.offset.x > 40) {
            setSwipedIndex(null);
        }
    }, [locations]);

    const handleDragEnd = useCallback((fromIndex: number, info: PanInfo) => {
        const loc = locations[fromIndex];
        // Don't allow reordering "My Location"
        if (loc.isMyLocation) {
            setDraggedIndex(null);
            return;
        }

        // Calculate target index based on drag distance
        const dragDistance = info.offset.y;
        const itemHeight = 88; // Approximate height of each item
        const indexChange = Math.round(dragDistance / itemHeight);
        let toIndex = fromIndex + indexChange;
        
        // Clamp to valid range (can't move before My Location)
        const minIndex = locations[0]?.isMyLocation ? 1 : 0;
        toIndex = Math.max(minIndex, Math.min(locations.length - 1, toIndex));
        
        if (toIndex !== fromIndex) {
            onReorderLocations(fromIndex, toIndex);
        }
        setDraggedIndex(null);
    }, [locations, onReorderLocations]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            'absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto',
                            'bg-slate-900/95 backdrop-blur-xl rounded-t-3xl',
                            'border-t border-white/10'
                        )}
                    >
                        {/* Handle */}
                        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl pt-3 pb-2 px-4 z-10">
                            <div className="w-10 h-1 mx-auto bg-white/30 rounded-full mb-4" />
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">Weather</h2>
                                <div className="flex items-center gap-2">
                                    {locations.length > 1 && (
                                        <button
                                            onClick={() => {
                                                setIsEditMode(!isEditMode);
                                                setSwipedIndex(null);
                                            }}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                                isEditMode 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                            )}
                                        >
                                            {isEditMode ? 'Done' : 'Edit'}
                                        </button>
                                    )}
                                    <button
                                        onClick={onAddLocation}
                                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <Plus className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Location list */}
                        <div className="px-4 pb-safe space-y-3">
                            {locations.map((loc, index) => (
                                <div key={`list-${index}-${loc.location.id}`} className="relative">
                                    {/* Delete button behind the card */}
                                    {!loc.isMyLocation && (
                                        <motion.button
                                            className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-2xl flex items-center justify-center"
                                            onClick={() => onRemoveLocation(loc.location.id)}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: swipedIndex === index || isEditMode ? 1 : 0 }}
                                        >
                                            <Trash2 className="w-6 h-6 text-white" />
                                        </motion.button>
                                    )}

                                    {/* Location card */}
                                    <motion.div
                                        drag={isEditMode && !loc.isMyLocation ? 'y' : false}
                                        dragConstraints={{ top: 0, bottom: 0 }}
                                        dragElastic={0.1}
                                        onDragStart={() => setDraggedIndex(index)}
                                        onDragEnd={(_, info) => handleDragEnd(index, info)}
                                        animate={{
                                            x: swipedIndex === index ? -80 : 0,
                                            scale: draggedIndex === index ? 1.02 : 1,
                                            zIndex: draggedIndex === index ? 10 : 1,
                                        }}
                                        transition={{ type: 'spring', damping: 25 }}
                                        className={cn(
                                            'relative rounded-2xl overflow-hidden',
                                            draggedIndex === index && 'shadow-2xl'
                                        )}
                                    >
                                        <motion.button
                                            onClick={() => {
                                                if (!isEditMode) {
                                                    onSelectLocation(index);
                                                    onClose();
                                                }
                                            }}
                                            onPan={(_, info) => !isEditMode && handleSwipe(index, info)}
                                            className={cn(
                                                'w-full p-4 text-left transition-all',
                                                'bg-linear-to-br',
                                                index === currentIndex && !isEditMode
                                                    ? 'from-blue-500/40 to-purple-500/40 ring-2 ring-white/30'
                                                    : 'from-slate-800/80 to-slate-700/80',
                                                !isEditMode && 'hover:from-slate-700/80 hover:to-slate-600/80'
                                            )}
                                            whileTap={!isEditMode ? { scale: 0.98 } : undefined}
                                            disabled={isEditMode}
                                        >
                                            <div className="flex items-start justify-between">
                                                {/* Drag handle in edit mode */}
                                                {isEditMode && !loc.isMyLocation && (
                                                    <div className="flex items-center pr-3 -ml-1">
                                                        <GripVertical className="w-5 h-5 text-white/40" />
                                                    </div>
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        {loc.isMyLocation && (
                                                            <Navigation className="w-3.5 h-3.5 text-white/70 shrink-0" />
                                                        )}
                                                        <span className="font-medium text-white truncate">
                                                            {loc.isMyLocation ? 'My Location' : loc.location.name}
                                                        </span>
                                                    </div>
                                                    {loc.isMyLocation && (
                                                        <p className="text-sm text-white/60 truncate">{loc.location.name}</p>
                                                    )}
                                                    <p className="text-xs text-white/50 mt-0.5">
                                                        {loc.weather 
                                                            ? WEATHER_CONDITIONS[loc.weather.current.weatherCode as WeatherCode]?.label 
                                                            : 'Loading...'}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-right shrink-0 ml-3">
                                                    {loc.weather ? (
                                                        <>
                                                            <span className="text-3xl font-light text-white">
                                                                {Math.round(
                                                                    settings.temperatureUnit === 'fahrenheit'
                                                                        ? loc.weather.current.temperature * 9 / 5 + 32
                                                                        : loc.weather.current.temperature
                                                                )}°
                                                            </span>
                                                            <div className="text-xs text-white/50 mt-1">
                                                                H:{Math.round(
                                                                    settings.temperatureUnit === 'fahrenheit'
                                                                        ? loc.weather.daily[0].temperatureMax * 9 / 5 + 32
                                                                        : loc.weather.daily[0].temperatureMax
                                                                )}° L:{Math.round(
                                                                    settings.temperatureUnit === 'fahrenheit'
                                                                        ? loc.weather.daily[0].temperatureMin * 9 / 5 + 32
                                                                        : loc.weather.daily[0].temperatureMin
                                                                )}°
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-12 h-8 bg-white/10 rounded animate-pulse" />
                                                    )}
                                                </div>

                                                {/* Delete button in edit mode */}
                                                {isEditMode && !loc.isMyLocation && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveLocation(loc.location.id);
                                                        }}
                                                        className="ml-3 p-2 -mr-1 rounded-full hover:bg-red-500/30 transition-colors"
                                                    >
                                                        <X className="w-5 h-5 text-red-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                </div>
                            ))}

                            {/* Add location button */}
                            <button
                                onClick={onAddLocation}
                                className={cn(
                                    'w-full p-4 rounded-2xl text-center',
                                    'border-2 border-dashed border-white/20',
                                    'text-white/60 hover:text-white hover:border-white/40',
                                    'transition-colors'
                                )}
                            >
                                <Plus className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-sm">Add Location</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

