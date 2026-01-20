import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup';
import { errorHandlers, mockSearchResults, mockReverseGeocodeResult } from '../mocks/handlers';
import { http, HttpResponse } from 'msw';

import { searchLocations, reverseGeocode, searchResultToLocation } from '@/lib/api/geocoding';
import { setSimulatedError } from '@/lib/api/client';

describe('Geocoding API', () => {
    beforeEach(() => {
        setSimulatedError(null);
    });

    describe('searchLocations', () => {
        describe('Input Validation', () => {
            it('should return empty array for empty query', async () => {
                const results = await searchLocations('');
                expect(results).toEqual([]);
            });

            it('should return empty array for whitespace-only query', async () => {
                const results = await searchLocations('   ');
                expect(results).toEqual([]);
            });

            it('should return empty array for single character query', async () => {
                const results = await searchLocations('a');
                expect(results).toEqual([]);
            });

            it('should trim whitespace from query', async () => {
                let capturedQuery: string = '';

                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', ({ request }) => {
                        const url = new URL(request.url);
                        capturedQuery = url.searchParams.get('q') || '';
                        return HttpResponse.json(mockSearchResults);
                    })
                );

                await searchLocations('  London  ');
                expect(capturedQuery).toBe('London');
            });
        });

        describe('Successful Requests', () => {
            it('should search and return results', async () => {
                const results = await searchLocations('London');

                expect(results).toBeDefined();
                expect(Array.isArray(results)).toBe(true);
                expect(results.length).toBeGreaterThan(0);
            });

            it('should transform search results correctly', async () => {
                const results = await searchLocations('London');

                const london = results.find(r => r.name === 'London');
                expect(london).toBeDefined();
                expect(london?.country).toBe('United Kingdom');
                expect(london?.latitude).toBeCloseTo(51.5073509, 5);
                expect(london?.longitude).toBeCloseTo(-0.1277583, 5);
                expect(london?.displayName).toContain('London');
            });

            it('should include id, name, country, state, latitude, longitude, displayName', async () => {
                const results = await searchLocations('London');
                const result = results[0];

                expect(result).toHaveProperty('id');
                expect(result).toHaveProperty('name');
                expect(result).toHaveProperty('country');
                expect(result).toHaveProperty('latitude');
                expect(result).toHaveProperty('longitude');
                expect(result).toHaveProperty('displayName');
            });

            it('should limit results to 8 from API', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json(mockSearchResults);
                    })
                );

                await searchLocations('London');
                expect(capturedUrl).toContain('limit=8');
            });

            it('should include proper headers', async () => {
                let capturedHeaders: Headers | null = null;

                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', ({ request }) => {
                        capturedHeaders = request.headers;
                        return HttpResponse.json(mockSearchResults);
                    })
                );

                await searchLocations('London');
                expect(capturedHeaders).not.toBeNull();
                expect(capturedHeaders!.get('User-Agent')).toBe('WeatherApp/1.0');
            });

            it('should filter for valid place types', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', () => {
                        return HttpResponse.json([
                            ...mockSearchResults,
                            {
                                place_id: 999999,
                                lat: '51.0',
                                lon: '-0.1',
                                name: 'Some Street',
                                type: 'street',
                                addresstype: 'road',
                                address: {
                                    road: 'Some Street',
                                    city: 'London',
                                    country: 'United Kingdom',
                                },
                                display_name: 'Some Street, London',
                            },
                        ]);
                    })
                );

                const results = await searchLocations('London');

                // Should not include streets
                const hasStreet = results.some(r => r.name === 'Some Street');
                expect(hasStreet).toBe(false);
            });

            it('should remove duplicate coordinates', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', () => {
                        return HttpResponse.json([
                            mockSearchResults[0],
                            {
                                ...mockSearchResults[0],
                                place_id: 111111,
                                name: 'London Duplicate',
                            },
                        ]);
                    })
                );

                const results = await searchLocations('London');

                // Should only have one result for the same coordinates
                const londonCount = results.filter(r =>
                    Math.abs(r.latitude - 51.5073509) < 0.01 &&
                    Math.abs(r.longitude - (-0.1277583)) < 0.01
                ).length;

                expect(londonCount).toBe(1);
            });
        });

        describe('Empty Results', () => {
            it('should return empty array when no results found', async () => {
                server.use(errorHandlers.geocodingEmpty);

                const results = await searchLocations('xyznonexistent123');
                expect(results).toEqual([]);
            });

            it('should return empty array for null response', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', () => {
                        return HttpResponse.json(null);
                    })
                );

                const results = await searchLocations('London');
                expect(results).toEqual([]);
            });
        });

        describe('Error Handling', () => {
            it('should handle server errors', async () => {
                server.use(errorHandlers.geocodingError);

                await expect(searchLocations('London')).rejects.toBeDefined();
            });

            it('should handle simulated errors', async () => {
                setSimulatedError('NETWORK_ERROR');

                await expect(searchLocations('London')).rejects.toMatchObject({
                    type: 'NETWORK_ERROR',
                });
            });
        });

        describe('Display Name Formatting', () => {
            it('should format displayName with city, state, country', async () => {
                const results = await searchLocations('London');
                const london = results.find(r => r.name === 'London');

                expect(london?.displayName).toContain('London');
                expect(london?.displayName).toContain('England');
                expect(london?.displayName).toContain('United Kingdom');
            });

            it('should not duplicate name in displayName', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/search', () => {
                        return HttpResponse.json([{
                            place_id: 123,
                            lat: '51.5',
                            lon: '-0.1',
                            name: 'Monaco',
                            type: 'country',
                            addresstype: 'country',
                            address: {
                                country: 'Monaco',
                            },
                            display_name: 'Monaco',
                        }]);
                    })
                );

                const results = await searchLocations('Monaco');

                // Should not have "Monaco, Monaco"
                expect(results[0].displayName).toBe('Monaco');
            });
        });
    });

    describe('reverseGeocode', () => {
        describe('Successful Requests', () => {
            it('should reverse geocode coordinates to location', async () => {
                const location = await reverseGeocode(51.5074, -0.1278);

                expect(location).toBeDefined();
                expect(location?.name).toBe('London');
                expect(location?.country).toBe('United Kingdom');
            });

            it('should use provided coordinates in result', async () => {
                const lat = 51.5074;
                const lon = -0.1278;

                const location = await reverseGeocode(lat, lon);

                expect(location?.latitude).toBe(lat);
                expect(location?.longitude).toBe(lon);
            });

            it('should generate consistent ID from coordinates', async () => {
                const location = await reverseGeocode(51.5074, -0.1278);

                expect(location?.id).toBe('51.5074_-0.1278');
            });

            it('should include proper headers', async () => {
                let capturedHeaders: Headers | null = null;

                server.use(
                    http.get('https://nominatim.openstreetmap.org/reverse', ({ request }) => {
                        capturedHeaders = request.headers;
                        return HttpResponse.json(mockReverseGeocodeResult);
                    })
                );

                await reverseGeocode(51.5074, -0.1278);
                expect(capturedHeaders).not.toBeNull();
                expect(capturedHeaders!.get('User-Agent')).toBe('WeatherApp/1.0');
            });
        });

        describe('Fallback Behavior', () => {
            it('should return basic location on API error', async () => {
                server.use(errorHandlers.reverseGeocodeError);

                const location = await reverseGeocode(51.5074, -0.1278);

                expect(location).toBeDefined();
                expect(location?.name).toBe('Current Location');
                expect(location?.latitude).toBe(51.5074);
                expect(location?.longitude).toBe(-0.1278);
            });

            it('should format coordinates in displayName on fallback', async () => {
                server.use(errorHandlers.reverseGeocodeError);

                const location = await reverseGeocode(51.5074, -0.1278);

                expect(location?.displayName).toContain('51.51');
                expect(location?.displayName).toContain('-0.13');
            });

            it('should return null if no result and not error', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/reverse', () => {
                        return HttpResponse.json(null);
                    })
                );

                const location = await reverseGeocode(51.5074, -0.1278);
                expect(location).toBeNull();
            });
        });

        describe('Coordinate Precision', () => {
            it('should handle high precision coordinates', async () => {
                const location = await reverseGeocode(51.50735090000001, -0.12775829999999);

                expect(location?.id).toMatch(/^\d+\.\d{4}_-?\d+\.\d{4}$/);
            });

            it('should handle negative coordinates', async () => {
                server.use(
                    http.get('https://nominatim.openstreetmap.org/reverse', () => {
                        return HttpResponse.json({
                            ...mockReverseGeocodeResult,
                            lat: '-33.8688',
                            lon: '151.2093',
                            address: {
                                city: 'Sydney',
                                state: 'New South Wales',
                                country: 'Australia',
                            },
                        });
                    })
                );

                const location = await reverseGeocode(-33.8688, 151.2093);

                expect(location?.latitude).toBe(-33.8688);
                expect(location?.longitude).toBe(151.2093);
            });
        });
    });

    describe('searchResultToLocation', () => {
        it('should convert search result to location', () => {
            const searchResult = {
                id: '123',
                name: 'London',
                country: 'United Kingdom',
                state: 'England',
                latitude: 51.5074,
                longitude: -0.1278,
                displayName: 'London, England, United Kingdom',
            };

            const location = searchResultToLocation(searchResult);

            expect(location.name).toBe('London');
            expect(location.country).toBe('United Kingdom');
            expect(location.latitude).toBe(51.5074);
            expect(location.longitude).toBe(-0.1278);
        });

        it('should generate ID from coordinates', () => {
            const searchResult = {
                id: '123',
                name: 'London',
                country: 'United Kingdom',
                latitude: 51.5074,
                longitude: -0.1278,
                displayName: 'London, United Kingdom',
            };

            const location = searchResultToLocation(searchResult);

            expect(location.id).toBe('51.5074_-0.1278');
        });

        it('should preserve all original properties', () => {
            const searchResult = {
                id: '123',
                name: 'Bristol',
                country: 'United Kingdom',
                state: 'England',
                latitude: 51.4545,
                longitude: -2.5879,
                displayName: 'Bristol, England, United Kingdom',
            };

            const location = searchResultToLocation(searchResult);

            expect(location.state).toBe('England');
            expect(location.displayName).toBe('Bristol, England, United Kingdom');
        });
    });
});

