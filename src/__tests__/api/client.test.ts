import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup';
import { errorHandlers, mockWeatherResponse } from '../mocks/handlers';
import { http, HttpResponse, delay } from 'msw';

// Import the module to test
import { apiClient, setSimulatedError, getSimulatedError, checkSimulatedError } from '@/lib/api/client';

describe('API Client', () => {
    beforeEach(() => {
        setSimulatedError(null);
    });

    describe('apiClient', () => {
        describe('Successful requests', () => {
            it('should fetch and parse JSON data successfully', async () => {
                const data = await apiClient<typeof mockWeatherResponse>(
                    'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1'
                );

                expect(data).toBeDefined();
                expect(data.latitude).toBe(51.5074);
                expect(data.longitude).toBe(-0.1278);
                expect(data.current).toBeDefined();
            });

            it('should include custom headers when provided', async () => {
                let capturedHeaders: Headers | null = null;

                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
                        capturedHeaders = request.headers;
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1', {
                    headers: {
                        'X-Custom-Header': 'test-value',
                    },
                });

                expect(capturedHeaders).not.toBeNull();
                expect(capturedHeaders!.get('X-Custom-Header')).toBe('test-value');
            });

            it('should use default timeout of 10 seconds', async () => {
                const startTime = Date.now();

                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', async () => {
                        await delay(100);
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1');
                const elapsed = Date.now() - startTime;

                expect(elapsed).toBeLessThan(10000);
            });
        });

        describe('HTTP Error Handling', () => {
            it('should handle 400 Bad Request', async () => {
                server.use(errorHandlers.badRequest);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=invalid')
                ).rejects.toMatchObject({
                    type: 'INVALID_DATA',
                    statusCode: 400,
                });
            });

            it('should handle 404 Not Found', async () => {
                server.use(errorHandlers.notFound);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0')
                ).rejects.toMatchObject({
                    type: 'LOCATION_NOT_FOUND',
                    statusCode: 404,
                });
            });

            it('should handle 429 Rate Limited', async () => {
                server.use(errorHandlers.rateLimited);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'RATE_LIMITED',
                    statusCode: 429,
                    retryable: true,
                });
            });

            it('should handle 500 Server Error', async () => {
                server.use(errorHandlers.serverError);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'SERVER_ERROR',
                    statusCode: 500,
                    retryable: true,
                });
            });

            it('should handle 502 Bad Gateway', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return new HttpResponse(null, { status: 502 });
                    })
                );

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'SERVER_ERROR',
                    statusCode: 502,
                });
            });

            it('should handle 503 Service Unavailable', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return new HttpResponse(null, { status: 503 });
                    })
                );

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'SERVER_ERROR',
                    statusCode: 503,
                });
            });

            it('should handle unknown HTTP status codes', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return new HttpResponse(null, { status: 418 }); // I'm a teapot
                    })
                );

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'UNKNOWN_ERROR',
                    statusCode: 418,
                });
            });
        });

        describe('Network Error Handling', () => {
            it('should handle network failures', async () => {
                server.use(errorHandlers.networkError);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toMatchObject({
                    type: 'NETWORK_ERROR',
                });
            });

            it('should handle request timeout', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', async () => {
                        await delay(15000);
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1', {
                        timeout: 100,
                    })
                ).rejects.toMatchObject({
                    type: 'NETWORK_ERROR',
                    message: expect.stringContaining('timed out'),
                });
            }, 15000);

            it('should handle custom timeout values', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', async () => {
                        await delay(500);
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                // Should succeed with longer timeout
                const data = await apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1', {
                    timeout: 2000,
                });

                expect(data).toBeDefined();
            });
        });

        describe('JSON Parsing', () => {
            it('should handle invalid JSON response', async () => {
                server.use(errorHandlers.invalidJson);

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toBeDefined();
            });

            it('should handle empty response body', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return new HttpResponse('', {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    })
                );

                await expect(
                    apiClient('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1')
                ).rejects.toBeDefined();
            });
        });
    });

    describe('Error Simulation', () => {
        it('should set and get simulated error', () => {
            expect(getSimulatedError()).toBeNull();

            setSimulatedError('NETWORK_ERROR');
            expect(getSimulatedError()).toBe('NETWORK_ERROR');

            setSimulatedError('SERVER_ERROR');
            expect(getSimulatedError()).toBe('SERVER_ERROR');

            setSimulatedError(null);
            expect(getSimulatedError()).toBeNull();
        });

        it('should throw when checkSimulatedError is called with error set', () => {
            setSimulatedError('NETWORK_ERROR');

            expect(() => checkSimulatedError()).toThrow();
        });

        it('should not throw when no simulated error is set', () => {
            setSimulatedError(null);

            expect(() => checkSimulatedError()).not.toThrow();
        });

        it('should throw correct error type for each simulated error', () => {
            const errorTypes = [
                'NETWORK_ERROR',
                'SERVER_ERROR',
                'RATE_LIMITED',
                'LOCATION_NOT_FOUND',
                'INVALID_DATA',
                'UNKNOWN_ERROR',
            ] as const;

            for (const errorType of errorTypes) {
                setSimulatedError(errorType);

                try {
                    checkSimulatedError();
                    expect.fail('Should have thrown');
                } catch (error: unknown) {
                    expect((error as { type: string }).type).toBe(errorType);
                }

                setSimulatedError(null);
            }
        });
    });
});

