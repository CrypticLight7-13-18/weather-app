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

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand with persist middleware
- **Charts**: Recharts (dynamically imported)
- **Animations**: Framer Motion
- **APIs**: Open-Meteo (weather), Nominatim (geocoding)
- **Icons**: Lucide React + Custom animated SVGs
- **Date Utilities**: date-fns
- **Testing**: Vitest, MSW, Playwright (E2E), Testing Library

## Project Structure

```md
src/
├── __tests__/              # Test files
│   ├── setup.ts           # Test setup (MSW server)
│   ├── mocks/             # Mock handlers
│   │   └── handlers.ts
│   └── api/               # API tests
│       ├── client.test.ts
│       ├── weather.test.ts
│       └── geocoding.test.ts
├── app/                    # Next.js App Router
│   ├── docs/              # Design system documentation
│   │   └── page.tsx
│   ├── tests/             # UI test runner
│   │   └── page.tsx
│   ├── error.tsx          # Error boundary
│   ├── globals.css        # Global styles & CSS variables
│   ├── layout.tsx         # Root layout with providers
│   ├── loading.tsx        # Loading skeleton
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Main page component
├── components/
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

## Testing

The application includes a comprehensive three-layer testing strategy:

- **Unit tests** (Vitest + MSW) - Fast, deterministic tests with mocked APIs
- **Integration tests** (UI Test Runner) - Real API verification
- **E2E tests** (Playwright) - Full browser automation for user flows

### Why Two Test Suites?

| Aspect | Unit Tests (Vitest) | Integration Tests (UI) |
|--------|---------------------|------------------------|
| **Purpose** | Test logic in isolation | Verify real API contracts |
| **Speed** | Fast (~1 second) | Slower (network calls) |
| **Reliability** | 100% deterministic | Depends on external APIs |
| **Mocking** | Full API mocking via MSW | No mocking - real requests |
| **When to run** | Every commit, CI/CD | Pre-deployment, debugging |
| **Count** | 69 tests | 16 tests |

---

### Unit Tests (Vitest + MSW)

Unit tests run via the terminal and use [MSW (Mock Service Worker)](https://mswjs.io/) to intercept HTTP requests, providing controlled responses without hitting real APIs.

#### Running Unit Tests

```bash
# Run all tests once
npm run test

# Watch mode - rerun on file changes
npm run test:watch

# Vitest UI - visual browser interface
npm run test:ui

# Generate coverage report
npm run test:coverage
```

#### Test File Structure

```
src/__tests__/
├── setup.ts                 # MSW server initialization
├── mocks/
│   └── handlers.ts          # Mock API response handlers
└── api/
    ├── client.test.ts       # API client tests (19 tests)
    ├── weather.test.ts      # Weather API tests (21 tests)
    └── geocoding.test.ts    # Geocoding API tests (29 tests)
```

#### Test Setup (`setup.ts`)

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

This configuration:

- Starts MSW server before all tests
- Resets handlers between tests (isolation)
- Fails on unhandled requests (catches missing mocks)
- Cleans up after all tests complete

#### Mock Handlers (`mocks/handlers.ts`)

The handlers file defines mock responses for all external APIs:

```typescript
// Success handlers (default)
export const handlers = [
  http.get('https://api.open-meteo.com/v1/forecast', () => {
    return HttpResponse.json(mockWeatherResponse);
  }),
  http.get('https://nominatim.openstreetmap.org/search', () => {
    return HttpResponse.json(mockSearchResults);
  }),
  // ... more handlers
];

// Error handlers (used per-test)
export const errorHandlers = {
  serverError: http.get('https://api.open-meteo.com/v1/forecast', () => {
    return new HttpResponse(JSON.stringify({ error: 'Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
  networkError: http.get('https://api.open-meteo.com/v1/forecast', () => {
    return HttpResponse.error();
  }),
  // ... more error scenarios
};
```

---

### Detailed Test Breakdown

#### 1. API Client Tests (`client.test.ts`) - 19 tests

Tests the centralized fetch client that all API calls flow through.

**Successful Requests (3 tests)**

| Test | What it verifies |
|------|-----------------|
| `should fetch and parse JSON data successfully` | Basic request/response cycle works |
| `should include custom headers when provided` | Headers are properly forwarded |
| `should use default timeout of 10 seconds` | Timeout configuration is applied |

**HTTP Error Handling (7 tests)**

| Test | Status Code | Expected Error Type |
|------|-------------|---------------------|
| `should handle 400 Bad Request` | 400 | `INVALID_DATA` |
| `should handle 404 Not Found` | 404 | `LOCATION_NOT_FOUND` |
| `should handle 429 Rate Limited` | 429 | `RATE_LIMITED` |
| `should handle 500 Server Error` | 500 | `SERVER_ERROR` |
| `should handle 502 Bad Gateway` | 502 | `SERVER_ERROR` |
| `should handle 503 Service Unavailable` | 503 | `SERVER_ERROR` |
| `should handle unknown HTTP status codes` | 418 | `UNKNOWN_ERROR` |

**Network Error Handling (3 tests)**

| Test | What it verifies |
|------|-----------------|
| `should handle network failures` | Catches fetch failures gracefully |
| `should handle request timeout` | AbortController cancels slow requests |
| `should handle custom timeout values` | Per-request timeout override works |

**JSON Parsing (2 tests)**

| Test | What it verifies |
|------|-----------------|
| `should handle invalid JSON response` | Malformed JSON doesn't crash |
| `should handle empty response body` | Empty responses handled gracefully |

**Error Simulation (4 tests)**

| Test | What it verifies |
|------|-----------------|
| `should set and get simulated error` | Error simulation state management |
| `should throw when checkSimulatedError is called` | Simulated errors trigger correctly |
| `should not throw when no simulated error` | Normal operation unaffected |
| `should throw correct error type` | Each error type maps correctly |

#### 2. Weather API Tests (`weather.test.ts`) - 21 tests

Tests the Open-Meteo API integration and data transformation.

**Successful Requests (8 tests)**

| Test | What it verifies |
|------|-----------------|
| `should fetch weather data for valid coordinates` | Basic fetch works |
| `should transform current weather data correctly` | Raw API → app format mapping |
| `should include UV index from daily data` | UV extraction from daily array |
| `should transform hourly forecast correctly` | 48-hour forecast parsing |
| `should transform daily forecast correctly` | 7-day forecast parsing |
| `should use auto timezone by default` | Default timezone parameter |
| `should use custom timezone when provided` | Timezone override works |
| `should always request metric units` | Consistent unit requests |

**Error Handling (4 tests)**

| Test | What it verifies |
|------|-----------------|
| `should handle missing current data` | Partial response handling |
| `should handle server errors` | 500 errors bubble up correctly |
| `should handle network errors` | Network failures handled |
| `should handle simulated errors` | Dev error simulation works |

**Data Validation (3 tests)**

| Test | What it verifies |
|------|-----------------|
| `should handle null values in response` | Null → default value fallback |
| `should handle is_day as 0 (night)` | Boolean conversion for night |
| `should validate weather codes are numbers` | Type checking on codes |

**Historical Data (6 tests)**

| Test | What it verifies |
|------|-----------------|
| `should fetch historical data` | Archive API works |
| `should transform historical data correctly` | Data structure mapping |
| `should use default 30 days` | Default date range |
| `should use custom days parameter` | Custom range works |
| `should handle missing daily data` | Partial response handling |
| `should handle server errors` | Error propagation |

#### 3. Geocoding API Tests (`geocoding.test.ts`) - 29 tests

Tests the Nominatim geocoding integration.

**Input Validation (4 tests)**

| Test | What it verifies |
|------|-----------------|
| `should return empty array for empty query` | Empty string handling |
| `should return empty array for whitespace` | Whitespace-only handling |
| `should return empty array for single char` | Min length validation |
| `should trim whitespace from query` | Input sanitization |

**Successful Search (6 tests)**

| Test | What it verifies |
|------|-----------------|
| `should search and return results` | Basic search works |
| `should transform search results correctly` | Result structure mapping |
| `should include required fields` | All fields present |
| `should limit results to 8` | Pagination parameter |
| `should include proper headers` | User-Agent header sent |
| `should filter for valid place types` | Only cities/towns returned |

**Reverse Geocoding (5 tests)**

| Test | What it verifies |
|------|-----------------|
| `should reverse geocode coordinates` | Lat/lon → location name |
| `should use provided coordinates` | Coords preserved in result |
| `should generate consistent ID` | ID format: `lat_lon` |
| `should include proper headers` | User-Agent header sent |
| `should return basic location on error` | Fallback behavior |

**Edge Cases (14 tests)**

- Empty results handling
- Duplicate coordinate filtering
- Display name formatting
- Error propagation
- Null response handling

---

### Integration Tests (UI Test Runner)

The UI test runner at `/tests` makes **real API calls** to verify external services are working correctly.

#### Accessing the Test Runner

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/tests`
3. Click "Run All Tests" or run individual categories

#### Test Categories (16 tests total)

**API Client (3 tests)**

- Successful API request to Open-Meteo
- Invalid coordinates rejection (400 error)
- Request timeout behavior

**Weather API (5 tests)**

- Fetch current weather structure
- Fetch 48-hour hourly forecast
- Fetch 7-day daily forecast
- Metric units verification
- Timezone handling

**Geocoding (3 tests)**

- Location search ("London")
- Reverse geocoding (coordinates → city name)
- Empty results for non-existent locations

**Historical API (1 test)**

- Fetch 30 days of historical data

**Error Handling (2 tests)**

- Network error detection (invalid domain)
- Invalid JSON handling

**Data Validation (2 tests)**

- Coordinate precision in response
- Weather code range validation (0-99)

#### When to Use Integration Tests

✅ **Use integration tests when:**

- Deploying to production (smoke test)
- Debugging API-related issues
- Verifying after API provider changes
- Testing from different networks/regions

❌ **Don't rely on integration tests for:**

- CI/CD pipelines (flaky due to network)
- Rapid development iteration (too slow)
- Testing error scenarios (can't force errors)

---

### Writing New Tests

#### Adding a Unit Test

```typescript
// src/__tests__/api/weather.test.ts

describe('New Feature', () => {
  it('should do something specific', async () => {
    // 1. Arrange - Set up mock if needed
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () => {
        return HttpResponse.json({ /* custom response */ });
      })
    );

    // 2. Act - Call the function
    const result = await fetchWeatherData({ latitude: 51.5, longitude: -0.1 });

    // 3. Assert - Verify the outcome
    expect(result).toBeDefined();
    expect(result.current.temperature).toBeGreaterThan(-50);
  });
});
```

#### Adding an Integration Test

```typescript
// src/app/tests/page.tsx - add to apiTests array

{
  id: 'new-test-id',
  name: 'Test Display Name',
  description: 'What this test verifies',
  category: 'Weather API', // or create new category
  run: async () => {
    const start = Date.now();
    try {
      const response = await fetch('https://api.example.com/endpoint');
      const data = await response.json();
      
      return {
        passed: data.someField === expectedValue,
        message: 'Success message or failure reason',
        duration: Date.now() - start,
        details: `Optional extra info: ${data.someField}`,
      };
    } catch (error: unknown) {
      return {
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - start,
      };
    }
  },
},
```

---

### Test Configuration

#### Vitest Config (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',        // Browser-like environment
    globals: true,               // No need to import describe/it/expect
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/api/**'],  // Focus coverage on API layer
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

#### NPM Scripts

```json
{
  "test": "vitest run",           // Single run, exit with code
  "test:watch": "vitest",         // Watch mode for development
  "test:ui": "vitest --ui",       // Browser-based test UI
  "test:coverage": "vitest run --coverage"  // With coverage report
}
```

---

### E2E Tests (Playwright)

End-to-end tests verify the application works correctly from a user's perspective by automating browser interactions. These tests run against a real browser (Chromium) and cover complete user journeys.

#### Why E2E Tests?

| Aspect | Unit Tests | Integration Tests | E2E Tests |
|--------|------------|-------------------|-----------|
| **Scope** | Single function | API contracts | Full user flows |
| **Speed** | ~1 second | ~10 seconds | ~30-60 seconds |
| **Browser** | No (Node.js) | No (fetch only) | Yes (real browser) |
| **User Simulation** | None | Partial | Complete |
| **Visual Verification** | None | None | Screenshots/Video |
| **Test Count** | 69 | 16 | 50+ |

#### Running E2E Tests

```bash
# Run all E2E tests (headless)
npm run e2e

# Run with visual UI (recommended for debugging)
npm run e2e:ui

# Run tests in headed browser (see the browser)
npm run e2e:headed

# Debug mode - step through tests
npm run e2e:debug

# View test report from last run
npm run e2e:report
```

#### Corporate Network / Proxy Workaround

If you're running Playwright tests behind a corporate proxy (e.g., with Microsoft SSO authentication), the isolated Chromium browser launched by Playwright won't have your stored proxy credentials. This causes external API calls to be intercepted by the proxy login page.

**Solution:** Set the `NO_PROXY` environment variable to bypass the proxy for required domains:

**PowerShell (Windows):**

```powershell
$env:NO_PROXY = "localhost,127.0.0.1"
npx playwright test
```

**Bash (macOS/Linux):**

```bash
NO_PROXY="localhost,127.0.0.1" 
npx playwright test
```

**Why this happens:** Your regular browser has cached proxy authentication tokens, but Playwright launches a fresh, isolated browser instance without any stored credentials or cookies.

#### E2E Test File Structure

```
e2e/
├── home.spec.ts           # Home page tests (8 tests)
├── search.spec.ts         # Location search tests (9 tests)
├── settings.spec.ts       # Settings panel tests (11 tests)
├── favorites.spec.ts      # Favorites functionality (6 tests)
├── weather-display.spec.ts # Weather data display (15 tests)
├── navigation.spec.ts     # Page navigation tests (9 tests)
├── history.spec.ts        # Browsing history tests (5 tests)
└── world-clock.spec.ts    # World clock tests (8 tests)
```

#### Test Categories & Coverage

**Home Page (`home.spec.ts`)**

- Page load and initial state
- Header with logo and controls
- Theme toggle functionality
- Responsive design (mobile viewport)
- Accessibility (keyboard navigation, focus)

**Search (`search.spec.ts`)**

- Opening search dialog
- Searching for locations
- Selecting search results
- Keyboard navigation (Escape, arrows)
- Empty/invalid search handling

**Settings (`settings.spec.ts`)**

- Opening settings panel
- Temperature unit toggle (°C/°F)
- Wind speed units (km/h, mph, m/s, kn)
- Pressure units (hPa, inHg, mmHg)
- Theme selection
- Settings persistence after reload

**Favorites (`favorites.spec.ts`)**

- Adding locations to favorites
- Removing favorites
- Empty state display
- Favorites persistence
- Quick access to favorited locations

**Weather Display (`weather-display.spec.ts`)**

- Current weather card
- Temperature display
- Weather icons
- Hourly forecast (scroll, "Now" indicator)
- Daily forecast (day names, temps)
- Weather details (humidity, wind, UV, pressure)

**Navigation (`navigation.spec.ts`)**

- Navigate to /docs
- Navigate to /tests
- Settings popover navigation links
- Browser back/forward
- Page transitions

**History (`history.spec.ts`)**

- History section display
- Recording viewed locations
- History persistence
- Clicking history items
- History size limits

**World Clock (`world-clock.spec.ts`)**

- World clock display
- User's local time
- Adding cities
- Removing cities
- Clock time updates
- Persistence

#### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Writing New E2E Tests

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for hydration
  });

  test('should do something', async ({ page }) => {
    // Find element
    const button = page.getByRole('button', { name: /search/i });
    
    // Interact
    await button.click();
    
    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });
});
```

#### Debugging Failed Tests

When a test fails, Playwright provides:

- **Screenshots** - Captured at failure point
- **Videos** - Full test recording (on retry)
- **Traces** - Step-by-step timeline with DOM snapshots

To view:

```bash
npm run e2e:report
```

This opens an HTML report with all artifacts.

#### CI/CD Integration

For continuous integration:

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run e2e
  env:
    CI: true
```

---

### Troubleshooting Tests

**Tests fail with "unhandled request"**

- Add missing mock handler in `handlers.ts`
- Check URL matches exactly (including query params)

**Tests pass locally but fail in CI**

- Ensure `setup.ts` is in `setupFiles`
- Check Node version matches
- Verify no time-dependent assertions

**Integration tests timeout**

- Check network connectivity
- Increase timeout if API is slow
- Verify API endpoints haven't changed

**MSW not intercepting requests**

- Ensure server is started (`server.listen()`)
- Check request URL matches handler pattern
- Verify no typos in API URLs

**E2E tests show Microsoft/SSO login page (corporate network)**

- Playwright uses an isolated browser without your proxy credentials
- Set `NO_PROXY` environment variable before running tests:

  ```powershell
  # PowerShell
  $env:NO_PROXY = "localhost,127.0.0.1"
  npx playwright test
  ```

- Alternatively, configure API mocking in Playwright tests for CI environments

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
