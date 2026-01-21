'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Location } from '@/types/location';
import { WeatherData, HistoricalData, WEATHER_CONDITIONS, WeatherCode } from '@/types/weather';
import { Settings } from '@/types';
import { HourlyForecast } from './hourly-forecast';
import { DailyForecast } from './daily-forecast';
import { WeatherDetails } from './weather-details';
import { HistoricalChart } from './historical-chart';
import { Navigation, Plus, List, MapPin, Minus, Menu } from 'lucide-react';

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
    
    // Use motion value for position tracking - single source of truth
    const x = useMotionValue(0);
    
    // Track the internal index to avoid race conditions
    const internalIndexRef = useRef(currentIndex);
    // Track if we're currently animating (to avoid conflicts)
    const isAnimatingRef = useRef(false);

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

    // Animate to a position with spring physics
    const animateToPosition = useCallback((targetX: number, velocity = 0) => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        
        const currentX = x.get();
        
        // Calculate spring parameters based on velocity
        const velocityFactor = Math.min(Math.abs(velocity) / 500, 1);
        const stiffness = 200 + velocityFactor * 200;
        const damping = 25 + velocityFactor * 10;
        
        // Use a simple spring animation
        let startTime: number | null = null;
        const startX = currentX;
        const initialVelocity = velocity;
        
        const animate = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = (timestamp - startTime) / 1000; // Convert to seconds
            
            // Spring physics simulation
            const displacement = targetX - startX;
            const dampingRatio = damping / (2 * Math.sqrt(stiffness));
            const omega = Math.sqrt(stiffness);
            
            let newX: number;
            if (dampingRatio < 1) {
                // Under-damped
                const omegaD = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
                const decay = Math.exp(-dampingRatio * omega * elapsed);
                const cos = Math.cos(omegaD * elapsed);
                const sin = Math.sin(omegaD * elapsed);
                newX = targetX - decay * (displacement * cos + ((dampingRatio * omega * displacement + initialVelocity) / omegaD) * sin);
            } else {
                // Critically or over-damped
                const decay = Math.exp(-omega * elapsed);
                newX = targetX - decay * (displacement + (omega * displacement + initialVelocity) * elapsed);
            }
            
            x.set(newX);
            
            // Check if animation is complete (close enough to target and slow enough)
            const remaining = Math.abs(targetX - newX);
            if (remaining < 0.5 && elapsed > 0.1) {
                x.set(targetX);
                isAnimatingRef.current = false;
            } else if (elapsed < 2) { // Max 2 seconds
                requestAnimationFrame(animate);
            } else {
                x.set(targetX);
                isAnimatingRef.current = false;
            }
        };
        
        requestAnimationFrame(animate);
    }, [x]);

    // Sync position when index changes from outside (e.g., clicking indicators)
    useEffect(() => {
        if (containerWidth > 0) {
            internalIndexRef.current = currentIndex;
            const targetX = -currentIndex * containerWidth;
            animateToPosition(targetX);
        }
    }, [currentIndex, containerWidth, animateToPosition]);

    // Initialize position on mount/resize
    useEffect(() => {
        if (containerWidth > 0) {
            // Use internal ref to get current index without triggering on index changes
            x.set(-internalIndexRef.current * containerWidth);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerWidth]); // Intentionally only on container width change

    const handleDragStart = useCallback(() => {
        // Stop any ongoing animation and mark as dragging
        isAnimatingRef.current = false;
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
            
            // Directly set position during drag for 1:1 finger tracking
            x.set(newX);
        },
        [containerWidth, locations.length, x]
    );

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (containerWidth === 0) return;
            
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
            
            // Calculate target position and animate
            const targetX = -newIndex * containerWidth;
            animateToPosition(targetX, velocity.x);
            
            // Mark dragging as done
            setIsDragging(false);
            
            // Update parent state if index changed
            if (newIndex !== currentIndex) {
                onIndexChange(newIndex);
            }
        },
        [currentIndex, locations.length, containerWidth, onIndexChange, animateToPosition]
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
                    dragElastic={0}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    style={{ 
                        width: `${locations.length * 100}%`,
                        x,
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

// Draggable location item wrapper with its own drag controls
function DraggableLocationItem({
    loc,
    index,
    currentIndex,
    isEditMode,
    onSelect,
    onRemove,
    settings,
}: {
    loc: LocationWeather;
    index: number;
    currentIndex: number;
    isEditMode: boolean;
    onSelect: () => void;
    onRemove: () => void;
    settings: Settings;
}) {
    const dragControls = useDragControls();
    const isSelected = index === currentIndex && !isEditMode;
    const canEdit = !loc.isMyLocation;
    const hasError = loc.error && !loc.weather;
    const isLoading = loc.isLoading && !loc.weather;

    return (
        <Reorder.Item
            value={loc}
            dragListener={false}
            dragControls={dragControls}
            transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 30,
                mass: 0.8,
            }}
            whileDrag={{ 
                scale: 1.03, 
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                cursor: 'grabbing',
            }}
            layout
            className="relative"
            style={{ 
                touchAction: isEditMode && canEdit ? 'none' : 'auto',
            }}
        >
            <motion.div
                layout="position"
                className={cn(
                    'relative flex items-center gap-3 p-4 rounded-2xl',
                    'bg-linear-to-br transition-colors duration-200',
                    isSelected
                        ? 'from-blue-500/30 to-purple-500/30 ring-2 ring-white/30'
                        : 'from-slate-800/90 to-slate-700/90',
                    isEditMode && canEdit && 'ring-1 ring-white/10'
                )}
            >
                {/* Delete button (iOS style - red circle with minus) */}
                <AnimatePresence mode="popLayout">
                    {isEditMode && canEdit && (
                        <motion.button
                            initial={{ width: 0, opacity: 0, marginRight: 0 }}
                            animate={{ width: 28, opacity: 1, marginRight: 8 }}
                            exit={{ width: 0, opacity: 0, marginRight: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="shrink-0 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg overflow-hidden"
                        >
                            <Minus className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Main content - clickable when not in edit mode */}
                <div 
                    className={cn(
                        'flex-1 min-w-0 flex items-center justify-between',
                        !isEditMode && 'cursor-pointer active:opacity-70'
                    )}
                    onClick={() => !isEditMode && onSelect()}
                >
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            {loc.isMyLocation && (
                                <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                            <span className="font-medium text-white truncate">
                                {loc.isMyLocation ? 'My Location' : loc.location.name}
                            </span>
                        </div>
                        {loc.isMyLocation && loc.location.name && (
                            <p className="text-sm text-white/60 truncate mt-0.5">
                                {loc.location.name}
                            </p>
                        )}
                        <p className="text-xs text-white/50 mt-1">
                            {hasError ? (
                                <span className="text-red-400">Unable to load</span>
                            ) : isLoading ? (
                                'Loading...'
                            ) : loc.weather ? (
                                WEATHER_CONDITIONS[loc.weather.current.weatherCode as WeatherCode]?.label || 'Unknown'
                            ) : (
                                'No data'
                            )}
                        </p>
                    </div>

                    {/* Temperature */}
                    <div className="text-right shrink-0 ml-4">
                        {hasError ? (
                            <span className="text-2xl font-light text-white/30">--°</span>
                        ) : isLoading ? (
                            <div className="w-14 h-10 bg-white/10 rounded-lg animate-pulse" />
                        ) : loc.weather ? (
                            <>
                                <span className="text-3xl font-light text-white tabular-nums">
                                    {Math.round(
                                        settings.temperatureUnit === 'fahrenheit'
                                            ? loc.weather.current.temperature * 9 / 5 + 32
                                            : loc.weather.current.temperature
                                    )}°
                                </span>
                                <div className="text-xs text-white/50 mt-0.5 tabular-nums">
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
                            <span className="text-2xl font-light text-white/30">--°</span>
                        )}
                    </div>
                </div>

                {/* Drag handle (iOS style - three lines) */}
                <AnimatePresence mode="popLayout">
                    {isEditMode && canEdit && (
                        <motion.div
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: 24, opacity: 1, marginLeft: 8 }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="shrink-0 touch-none cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
                            onPointerDown={(e) => {
                                if (canEdit) {
                                    dragControls.start(e);
                                }
                            }}
                        >
                            <Menu className="w-5 h-5 text-white/40" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </Reorder.Item>
    );
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
    const [orderedLocations, setOrderedLocations] = useState(locations);

    // Sync ordered locations when locations prop changes
    useEffect(() => {
        setOrderedLocations(locations);
    }, [locations]);

    // Reset edit mode when modal closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsEditMode(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle reorder with proper index tracking
    const handleReorder = useCallback((newOrder: LocationWeather[]) => {
        // Don't allow moving "My Location" from the top
        const myLocationIndex = newOrder.findIndex(l => l.isMyLocation);
        if (myLocationIndex > 0) {
            // Move it back to top
            const myLoc = newOrder.splice(myLocationIndex, 1)[0];
            newOrder.unshift(myLoc);
        }
        
        setOrderedLocations(newOrder);
        
        // Find the item that moved by comparing old and new orders
        const oldIds = orderedLocations.map(l => l.location.id);
        const newIds = newOrder.map(l => l.location.id);
        
        // Find first difference
        let fromIndex = -1;
        let toIndex = -1;
        
        for (let i = 0; i < oldIds.length; i++) {
            if (oldIds[i] !== newIds[i]) {
                // Find where the old item went
                const movedId = oldIds[i];
                const newPosition = newIds.indexOf(movedId);
                if (newPosition !== -1 && !orderedLocations[i].isMyLocation) {
                    fromIndex = i;
                    toIndex = newPosition;
                    break;
                }
            }
        }
        
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            onReorderLocations(fromIndex, toIndex);
        }
    }, [orderedLocations, onReorderLocations]);

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
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            'absolute bottom-0 left-0 right-0 max-h-[85vh]',
                            'bg-slate-900/95 backdrop-blur-xl rounded-t-3xl',
                            'border-t border-white/10 overflow-hidden'
                        )}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl pt-3 pb-3 px-4 z-10 border-b border-white/5">
                            <div className="w-10 h-1 mx-auto bg-white/30 rounded-full mb-4" />
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">Weather</h2>
                                <div className="flex items-center gap-2">
                                    {locations.length > 0 && (
                                        <button
                                            onClick={() => setIsEditMode(!isEditMode)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                                isEditMode 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'text-blue-400 hover:bg-white/10'
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

                        {/* Location list with reorder */}
                        <div className="overflow-y-auto max-h-[calc(85vh-100px)] overscroll-contain">
                            <div className="px-4 py-4 space-y-2">
                                {locations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                        <p className="text-white/60">No locations added</p>
                                        <p className="text-white/40 text-sm mt-1">
                                            Tap + to add a location
                                        </p>
                                    </div>
                                ) : (
                                    <Reorder.Group
                                        axis="y"
                                        values={orderedLocations}
                                        onReorder={handleReorder}
                                        className="space-y-2"
                                        layoutScroll
                                    >
                                        {orderedLocations.map((loc, index) => (
                                            <DraggableLocationItem
                                                key={`draggable-${loc.location.id}`}
                                                loc={loc}
                                                index={index}
                                                currentIndex={currentIndex}
                                                isEditMode={isEditMode}
                                                onSelect={() => {
                                                    onSelectLocation(index);
                                                    onClose();
                                                }}
                                                onRemove={() => onRemoveLocation(loc.location.id)}
                                                settings={settings}
                                            />
                                        ))}
                                    </Reorder.Group>
                                )}

                                {/* Add location button */}
                                <motion.button
                                    layout
                                    onClick={onAddLocation}
                                    className={cn(
                                        'w-full p-4 rounded-2xl text-center',
                                        'border-2 border-dashed border-white/20',
                                        'text-white/60 hover:text-white hover:border-white/40',
                                        'transition-colors mt-4'
                                    )}
                                >
                                    <Plus className="w-5 h-5 mx-auto mb-1" />
                                    <span className="text-sm">Add Location</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

