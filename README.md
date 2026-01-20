# Weather App

A production-grade weather application built with Next.js 14+, featuring beautiful UI, comprehensive error handling, and performant architecture.

![Weather App Screenshot](./public/screenshot.png)

## Features

### Core Functionality
- **Current Location Weather** - Auto-detect user location via Geolocation API
- **Location Search** - Autocomplete search with debouncing (300ms) and recent searches history
- **Favorites/Bookmarks** - Save locations to local storage with drag-to-reorder capability
- **Forecast View** - Hourly (24h) and daily (7-day) forecasts with visual representations
- **Historical Data** - Past 30 days weather data with interactive charts
- **Settings** - Unit toggle (Celsius/Fahrenheit), theme toggle (Light/Dark/System)

### Performance Features
- Aggressive caching with Next.js fetch cache and revalidation
- Skeleton loaders matching content layout (zero layout shift)
- Optimistic UI updates for favorites
- Debounced search inputs (300ms)
- Prefetch data for favorited locations
- Dynamic imports for chart components

### Error Handling
- Network failures
- Location not found
- Geolocation permission denied
- API rate limiting
- Server errors
- Missing/null data fields
- **Developer-only error simulation panel**

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with persist middleware
- **Charts**: Recharts (dynamically imported)
- **APIs**: Open-Meteo (weather), Nominatim (geocoding)
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── error.tsx          # Error boundary
│   ├── globals.css        # Global styles & CSS variables
│   ├── layout.tsx         # Root layout with providers
│   ├── loading.tsx        # Loading skeleton
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Main page component
├── components/
│   ├── dev/               # Developer tools
│   │   └── error-simulation-panel.tsx
│   ├── favorites/         # Favorites feature
│   │   └── favorites-panel.tsx
│   ├── layout/            # Layout components
│   │   └── header.tsx
│   ├── providers/         # React context providers
│   │   └── theme-provider.tsx
│   ├── search/            # Search feature
│   │   └── search-dialog.tsx
│   ├── settings/          # Settings feature
│   │   └── settings-panel.tsx
│   ├── ui/                # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   └── toggle.tsx
│   └── weather/           # Weather display components
│       ├── current-weather.tsx
│       ├── daily-forecast.tsx
│       ├── historical-chart.tsx
│       ├── hourly-forecast.tsx
│       ├── weather-details.tsx
│       └── weather-icon.tsx
├── hooks/                 # Custom React hooks
│   ├── use-favorites.ts
│   ├── use-geolocation.ts
│   ├── use-search.ts
│   ├── use-theme.ts
│   └── use-weather.ts
├── lib/
│   ├── api/               # API layer
│   │   ├── client.ts      # Centralized fetch client
│   │   ├── geocoding.ts   # Nominatim API
│   │   └── weather.ts     # Open-Meteo API
│   └── utils.ts           # Utility functions
├── stores/                # Zustand stores
│   ├── app-store.ts       # App state (favorites, settings)
│   ├── search-store.ts    # Search state
│   └── weather-store.ts   # Weather data & cache
└── types/                 # TypeScript types
    ├── api.ts             # API response types
    ├── location.ts        # Location types
    └── weather.ts         # Weather data types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Component Usage

### UI Primitives

```tsx
// Card component with variants
<Card variant="glass" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<IconButton label="Refresh" onClick={...}>
  <RefreshIcon />
</IconButton>

// Error and Empty states
<ErrorState error={error} onRetry={handleRetry} />
<EmptyState variant="favorites" action={{ label: 'Add', onClick: ... }} />

// Skeleton loaders
<SkeletonWeatherCard />
<SkeletonHourlyForecast />
<SkeletonDailyForecast />
```

### Custom Hooks

```tsx
// Weather data
const { weather, location, isLoading, error, loadWeather, refresh } = useWeather();
const { data: historicalData } = useHistoricalWeather();

// Geolocation
const { getCurrentPosition, loading, error } = useGeolocation();

// Search
const { query, results, search, selectResult } = useSearch();

// Favorites
const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

// Theme
const { theme, setTheme, toggleTheme, isDark } = useTheme();
```

### Stores (Zustand)

```tsx
// App store - persisted to localStorage
const { favorites, settings, setTemperatureUnit, setTheme } = useAppStore();

// Weather store - with caching
const { currentWeather, cacheWeather, getCachedWeather } = useWeatherStore();

// Search store
const { query, results, setQuery, setResults } = useSearchStore();
```

## API Layer

The API layer provides a centralized client with:
- Automatic timeout handling
- Error type classification
- Request caching via Next.js fetch
- Error simulation for development

```tsx
// Fetch weather data
const weather = await fetchWeatherData({
  latitude: 40.7128,
  longitude: -74.006,
  temperatureUnit: 'celsius',
});

// Search locations
const results = await searchLocations('New York');

// Reverse geocode
const location = await reverseGeocode(40.7128, -74.006);
```

## Developer Mode

Enable developer mode in Settings to access the Error Simulation Panel. This allows you to test how the application handles various error states:

- Network errors
- Location not found
- Geolocation denied
- Rate limiting
- Server errors
- Invalid data

## Keyboard Shortcuts

- `⌘/Ctrl + K` - Open search dialog
- `Escape` - Close dialogs

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Screen reader compatible
- Reduced motion support
- Focus indicators

## Performance

- Dynamic imports for heavy components (Recharts)
- Image optimization with Next.js Image
- Skeleton loaders prevent layout shift
- Weather data cached for 15 minutes
- Historical data cached for 24 hours
- Debounced search to minimize API calls

## API Credits

- Weather data: [Open-Meteo](https://open-meteo.com/) (free, no API key required)
- Geocoding: [Nominatim](https://nominatim.org/) (OpenStreetMap)

## License

MIT
