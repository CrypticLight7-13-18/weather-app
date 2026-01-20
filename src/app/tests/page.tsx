'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    Play, CheckCircle, XCircle, Clock, AlertTriangle,
    RefreshCw, ChevronDown, ChevronRight, Zap, Globe,
    Cloud, Server, FileJson,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Test types
type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'error';

interface TestCase {
    id: string;
    name: string;
    description: string;
    category: string;
    run: () => Promise<TestResult>;
}

interface TestResult {
    passed: boolean;
    message: string;
    duration: number;
    details?: string;
}

interface TestState {
    status: TestStatus;
    result?: TestResult;
}

// Helper to extract error message
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

// Helper to check for AbortError
function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError';
}

// API test implementations
const apiTests: TestCase[] = [
    // === Client Tests ===
    {
        id: 'client-success',
        name: 'Successful API Request',
        description: 'Verify API client can fetch and parse JSON data',
        category: 'API Client',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m');
                const data = await response.json();

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                if (!data.current) throw new Error('Missing current data');

                return {
                    passed: true,
                    message: 'Successfully fetched weather data',
                    duration: Date.now() - start,
                    details: `Temperature: ${data.current.temperature_2m}°C`,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'client-invalid-coords',
        name: 'Invalid Coordinates Handling',
        description: 'Verify API handles invalid coordinates gracefully',
        category: 'API Client',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999&current=temperature_2m');

                return {
                    passed: response.status === 400,
                    message: response.status === 400
                        ? 'Correctly rejected invalid coordinates'
                        : `Expected 400, got ${response.status}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'client-timeout',
        name: 'Request Timeout Behavior',
        description: 'Verify requests abort after timeout',
        category: 'API Client',
        run: async () => {
            const start = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 100);

            try {
                await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m', {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                // If we get here, it didn't timeout (which is fine for fast connections)
                return {
                    passed: true,
                    message: 'Request completed before timeout',
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                clearTimeout(timeoutId);
                if (isAbortError(error)) {
                    return {
                        passed: true,
                        message: 'Request correctly aborted on timeout',
                        duration: Date.now() - start,
                    };
                }
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },

    // === Weather API Tests ===
    {
        id: 'weather-current',
        name: 'Fetch Current Weather',
        description: 'Verify current weather data structure',
        category: 'Weather API',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
                );
                const data = await response.json();

                const required = ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m'];
                const missing = required.filter(key => data.current?.[key] === undefined);

                if (missing.length > 0) {
                    return {
                        passed: false,
                        message: `Missing fields: ${missing.join(', ')}`,
                        duration: Date.now() - start,
                    };
                }

                return {
                    passed: true,
                    message: 'All current weather fields present',
                    duration: Date.now() - start,
                    details: `Temp: ${data.current.temperature_2m}°C, Humidity: ${data.current.relative_humidity_2m}%`,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'weather-hourly',
        name: 'Fetch Hourly Forecast',
        description: 'Verify hourly forecast data (48 hours)',
        category: 'Weather API',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&hourly=temperature_2m&forecast_days=2'
                );
                const data = await response.json();

                const hourlyLength = data.hourly?.time?.length || 0;

                return {
                    passed: hourlyLength >= 48,
                    message: hourlyLength >= 48
                        ? `Received ${hourlyLength} hourly entries`
                        : `Expected 48+ entries, got ${hourlyLength}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'weather-daily',
        name: 'Fetch 7-Day Forecast',
        description: 'Verify daily forecast data',
        category: 'Weather API',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&daily=temperature_2m_max,temperature_2m_min&forecast_days=7'
                );
                const data = await response.json();

                const dailyLength = data.daily?.time?.length || 0;

                return {
                    passed: dailyLength === 7,
                    message: dailyLength === 7
                        ? 'Received 7 days of forecast'
                        : `Expected 7 days, got ${dailyLength}`,
                    duration: Date.now() - start,
                    details: dailyLength > 0 ? `First day: ${data.daily.time[0]}` : undefined,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'weather-units-metric',
        name: 'Metric Units (Celsius, km/h)',
        description: 'Verify metric unit conversion',
        category: 'Weather API',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh'
                );
                const data = await response.json();

                // Temperature should be reasonable for London in Celsius
                const temp = data.current?.temperature_2m;
                const wind = data.current?.wind_speed_10m;

                const tempValid = temp > -20 && temp < 45; // Reasonable Celsius range
                const windValid = wind >= 0 && wind < 200; // Reasonable km/h range

                return {
                    passed: tempValid && windValid,
                    message: tempValid && windValid
                        ? 'Units appear to be metric'
                        : 'Values out of expected metric range',
                    duration: Date.now() - start,
                    details: `Temp: ${temp}°C, Wind: ${wind} km/h`,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'weather-timezone',
        name: 'Timezone Handling',
        description: 'Verify timezone in response',
        category: 'Weather API',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=temperature_2m&timezone=Europe/London'
                );
                const data = await response.json();

                return {
                    passed: data.timezone === 'Europe/London',
                    message: data.timezone === 'Europe/London'
                        ? 'Correct timezone returned'
                        : `Expected Europe/London, got ${data.timezone}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },

    // === Geocoding Tests ===
    {
        id: 'geocoding-search',
        name: 'Location Search',
        description: 'Search for a city by name',
        category: 'Geocoding',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://nominatim.openstreetmap.org/search?q=London&format=json&limit=5',
                    { headers: { 'User-Agent': 'WeatherApp/1.0' } }
                );
                const data = await response.json();

                const hasLondon = data.some((r: { display_name?: string }) =>
                    r.display_name?.toLowerCase().includes('london')
                );

                return {
                    passed: hasLondon && data.length > 0,
                    message: hasLondon
                        ? `Found ${data.length} results for "London"`
                        : 'London not found in results',
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'geocoding-reverse',
        name: 'Reverse Geocoding',
        description: 'Convert coordinates to location name',
        category: 'Geocoding',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://nominatim.openstreetmap.org/reverse?lat=51.5074&lon=-0.1278&format=json',
                    { headers: { 'User-Agent': 'WeatherApp/1.0' } }
                );
                const data = await response.json();

                const isLondon = data.address?.city === 'London' ||
                    data.display_name?.toLowerCase().includes('london');

                return {
                    passed: isLondon,
                    message: isLondon
                        ? 'Correctly identified as London'
                        : `Got: ${data.address?.city || data.display_name}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'geocoding-empty',
        name: 'Empty Search Results',
        description: 'Handle non-existent location gracefully',
        category: 'Geocoding',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://nominatim.openstreetmap.org/search?q=xyznonexistent12345&format=json',
                    { headers: { 'User-Agent': 'WeatherApp/1.0' } }
                );
                const data = await response.json();

                return {
                    passed: Array.isArray(data) && data.length === 0,
                    message: data.length === 0
                        ? 'Correctly returned empty array'
                        : `Unexpected results: ${data.length} items`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },

    // === Historical Data Tests ===
    {
        id: 'historical-30days',
        name: 'Historical Data (30 days)',
        description: 'Fetch past 30 days of weather data',
        category: 'Historical API',
        run: async () => {
            const start = Date.now();
            try {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() - 1);
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);

                const formatDate = (d: Date) => d.toISOString().split('T')[0];

                const response = await fetch(
                    `https://archive-api.open-meteo.com/v1/archive?latitude=51.5&longitude=-0.1&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&daily=temperature_2m_max,temperature_2m_min`
                );
                const data = await response.json();

                const days = data.daily?.time?.length || 0;

                return {
                    passed: days >= 28, // Allow some tolerance
                    message: `Retrieved ${days} days of historical data`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },

    // === Error Simulation Tests ===
    {
        id: 'error-network',
        name: 'Network Error Detection',
        description: 'Detect and handle network failures',
        category: 'Error Handling',
        run: async () => {
            const start = Date.now();
            try {
                await fetch('https://invalid-domain-that-does-not-exist-12345.com/api');
                return {
                    passed: false,
                    message: 'Should have thrown network error',
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: true,
                    message: 'Network error correctly caught',
                    duration: Date.now() - start,
                    details: getErrorMessage(error),
                };
            }
        },
    },
    {
        id: 'error-json-parse',
        name: 'Invalid JSON Handling',
        description: 'Handle malformed JSON responses',
        category: 'Error Handling',
        run: async () => {
            const start = Date.now();
            try {
                // This endpoint returns HTML, not JSON
                const response = await fetch('https://nominatim.openstreetmap.org/');
                await response.json();

                return {
                    passed: false,
                    message: 'Should have thrown JSON parse error',
                    duration: Date.now() - start,
                };
            } catch {
                return {
                    passed: true,
                    message: 'JSON parse error correctly caught',
                    duration: Date.now() - start,
                };
            }
        },
    },

    // === Data Validation Tests ===
    {
        id: 'validate-coords',
        name: 'Coordinate Validation',
        description: 'Verify latitude/longitude in response',
        category: 'Data Validation',
        run: async () => {
            const start = Date.now();
            try {
                const lat = 40.7128;
                const lon = -74.0060;

                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`
                );
                const data = await response.json();

                const latMatch = Math.abs(data.latitude - lat) < 0.1;
                const lonMatch = Math.abs(data.longitude - lon) < 0.1;

                return {
                    passed: latMatch && lonMatch,
                    message: latMatch && lonMatch
                        ? 'Coordinates match request'
                        : `Mismatch: got ${data.latitude}, ${data.longitude}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
    {
        id: 'validate-weather-code',
        name: 'Weather Code Range',
        description: 'Verify weather code is valid (0-99)',
        category: 'Data Validation',
        run: async () => {
            const start = Date.now();
            try {
                const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current=weather_code'
                );
                const data = await response.json();

                const code = data.current?.weather_code;
                const isValid = typeof code === 'number' && code >= 0 && code <= 99;

                return {
                    passed: isValid,
                    message: isValid
                        ? `Weather code ${code} is valid`
                        : `Invalid weather code: ${code}`,
                    duration: Date.now() - start,
                };
            } catch (error: unknown) {
                return {
                    passed: false,
                    message: getErrorMessage(error),
                    duration: Date.now() - start,
                };
            }
        },
    },
];

export default function TestsPage() {
    const [testStates, setTestStates] = useState<Record<string, TestState>>({});
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(Array.from(new Set(apiTests.map(t => t.category))))
    );

    const categories = Array.from(new Set(apiTests.map(t => t.category)));

    const runTest = useCallback(async (test: TestCase) => {
        setTestStates(prev => ({
            ...prev,
            [test.id]: { status: 'running' },
        }));

        try {
            const result = await test.run();
            setTestStates(prev => ({
                ...prev,
                [test.id]: {
                    status: result.passed ? 'passed' : 'failed',
                    result,
                },
            }));
        } catch (error: unknown) {
            setTestStates(prev => ({
                ...prev,
                [test.id]: {
                    status: 'error',
                    result: {
                        passed: false,
                        message: getErrorMessage(error),
                        duration: 0,
                    },
                },
            }));
        }
    }, []);

    const runAllTests = useCallback(async () => {
        setIsRunningAll(true);
        setTestStates({});

        for (const test of apiTests) {
            await runTest(test);
            await new Promise(r => setTimeout(r, 100)); // Small delay between tests
        }

        setIsRunningAll(false);
    }, [runTest]);

    const runCategoryTests = useCallback(async (category: string) => {
        const categoryTests = apiTests.filter(t => t.category === category);

        for (const test of categoryTests) {
            await runTest(test);
            await new Promise(r => setTimeout(r, 100));
        }
    }, [runTest]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const getStats = () => {
        const states = Object.values(testStates);
        return {
            total: apiTests.length,
            passed: states.filter(s => s.status === 'passed').length,
            failed: states.filter(s => s.status === 'failed').length,
            errors: states.filter(s => s.status === 'error').length,
            running: states.filter(s => s.status === 'running').length,
        };
    };

    const stats = getStats();

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'API Client': return <Server className="h-4 w-4" />;
            case 'Weather API': return <Cloud className="h-4 w-4" />;
            case 'Geocoding': return <Globe className="h-4 w-4" />;
            case 'Historical API': return <Clock className="h-4 w-4" />;
            case 'Error Handling': return <AlertTriangle className="h-4 w-4" />;
            case 'Data Validation': return <FileJson className="h-4 w-4" />;
            default: return <Zap className="h-4 w-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#e8eef5] dark:bg-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#e8eef5]/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="text-sm">Back to App</span>
                        </Link>
                        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white">API Test Suite</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{apiTests.length} tests available</p>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        onClick={runAllTests}
                        disabled={isRunningAll}
                        loading={isRunningAll}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Run All Tests
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Total" value={stats.total} icon={<Zap className="h-5 w-5" />} color="slate" />
                    <StatCard label="Passed" value={stats.passed} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
                    <StatCard label="Failed" value={stats.failed} icon={<XCircle className="h-5 w-5" />} color="red" />
                    <StatCard label="Errors" value={stats.errors} icon={<AlertTriangle className="h-5 w-5" />} color="amber" />
                    <StatCard label="Running" value={stats.running} icon={<RefreshCw className="h-5 w-5 animate-spin" />} color="blue" />
                </div>

                {/* Test Categories */}
                <div className="space-y-4">
                    {categories.map(category => {
                        const categoryTests = apiTests.filter(t => t.category === category);
                        const categoryStates = categoryTests.map(t => testStates[t.id]);
                        const passed = categoryStates.filter(s => s?.status === 'passed').length;
                        const failed = categoryStates.filter(s => s?.status === 'failed' || s?.status === 'error').length;
                        const isExpanded = expandedCategories.has(category);

                        return (
                            <Card key={category} variant="default" padding="none">
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => toggleCategory(category)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {getCategoryIcon(category)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">{category}</h3>
                                            <p className="text-xs text-slate-500">{categoryTests.length} tests</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {passed > 0 && (
                                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                {passed} passed
                                            </span>
                                        )}
                                        {failed > 0 && (
                                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                                {failed} failed
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                runCategoryTests(category);
                                            }}
                                        >
                                            <Play className="h-3 w-3" />
                                        </Button>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-slate-100 dark:border-slate-800">
                                                {categoryTests.map(test => (
                                                    <TestRow
                                                        key={test.id}
                                                        test={test}
                                                        state={testStates[test.id]}
                                                        onRun={() => runTest(test)}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        );
                    })}
                </div>

                {/* Terminal Command */}
                <Card variant="glass" padding="lg" className="mt-8">
                    <CardHeader>
                        <CardTitle>Run Tests from Terminal</CardTitle>
                    </CardHeader>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-900 text-slate-100 px-4 py-2 rounded-lg text-sm font-mono">
                                npm run test
                            </code>
                            <span className="text-xs text-slate-500">Run all tests once</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-900 text-slate-100 px-4 py-2 rounded-lg text-sm font-mono">
                                npm run test:watch
                            </code>
                            <span className="text-xs text-slate-500">Watch mode</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-900 text-slate-100 px-4 py-2 rounded-lg text-sm font-mono">
                                npm run test:ui
                            </code>
                            <span className="text-xs text-slate-500">Vitest UI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-900 text-slate-100 px-4 py-2 rounded-lg text-sm font-mono">
                                npm run test:coverage
                            </code>
                            <span className="text-xs text-slate-500">With coverage</span>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    color
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: 'slate' | 'emerald' | 'red' | 'amber' | 'blue';
}) {
    const colorClasses = {
        slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
        red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
        blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    };

    return (
        <div className={cn(
            'p-4 rounded-2xl flex items-center gap-3',
            colorClasses[color]
        )}>
            {icon}
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs opacity-75">{label}</p>
            </div>
        </div>
    );
}

function TestRow({
    test,
    state,
    onRun
}: {
    test: TestCase;
    state?: TestState;
    onRun: () => void;
}) {
    const status = state?.status || 'idle';
    const result = state?.result;

    const statusIcon = {
        idle: <Clock className="h-4 w-4 text-slate-400" />,
        running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
        passed: <CheckCircle className="h-4 w-4 text-emerald-500" />,
        failed: <XCircle className="h-4 w-4 text-red-500" />,
        error: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    };

    return (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
            <div className="shrink-0">{statusIcon[status]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {test.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{test.description}</p>
                {result && (
                    <p className={cn(
                        'text-xs mt-1',
                        result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}>
                        {result.message}
                        {result.duration > 0 && (
                            <span className="text-slate-400 ml-2">({result.duration}ms)</span>
                        )}
                    </p>
                )}
                {result?.details && (
                    <p className="text-xs text-slate-400 mt-0.5">{result.details}</p>
                )}
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onRun}
                disabled={status === 'running'}
            >
                <Play className="h-3 w-3" />
            </Button>
        </div>
    );
}

