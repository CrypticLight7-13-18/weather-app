import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup';
import { errorHandlers, mockWeatherResponse, mockHistoricalResponse } from '../mocks/handlers';
import { http, HttpResponse } from 'msw';

import { fetchWeatherData, fetchHistoricalData } from '@/lib/api/weather';
import { setSimulatedError } from '@/lib/api/client';

describe('Weather API', () => {
    beforeEach(() => {
        setSimulatedError(null);
    });

    describe('fetchWeatherData', () => {
        describe('Successful Requests', () => {
            it('should fetch weather data for valid coordinates', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data).toBeDefined();
                expect(data.current).toBeDefined();
                expect(data.hourly).toBeDefined();
                expect(data.daily).toBeDefined();
                expect(data.timezone).toBe('Europe/London');
            });

            it('should transform current weather data correctly', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                const { current } = data;
                expect(current.temperature).toBe(mockWeatherResponse.current.temperature_2m);
                expect(current.feelsLike).toBe(mockWeatherResponse.current.apparent_temperature);
                expect(current.humidity).toBe(mockWeatherResponse.current.relative_humidity_2m);
                expect(current.windSpeed).toBe(mockWeatherResponse.current.wind_speed_10m);
                expect(current.windDirection).toBe(mockWeatherResponse.current.wind_direction_10m);
                expect(current.precipitation).toBe(mockWeatherResponse.current.precipitation);
                expect(current.weatherCode).toBe(mockWeatherResponse.current.weather_code);
                expect(current.isDay).toBe(true);
                expect(current.cloudCover).toBe(mockWeatherResponse.current.cloud_cover);
                expect(current.pressure).toBe(mockWeatherResponse.current.pressure_msl);
            });

            it('should include UV index from daily data', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data.current.uvIndex).toBe(mockWeatherResponse.daily.uv_index_max[0]);
            });

            it('should transform hourly forecast correctly', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data.hourly).toHaveLength(48);

                const firstHour = data.hourly[0];
                expect(firstHour).toHaveProperty('time');
                expect(firstHour).toHaveProperty('temperature');
                expect(firstHour).toHaveProperty('humidity');
                expect(firstHour).toHaveProperty('precipitationProbability');
                expect(firstHour).toHaveProperty('precipitation');
                expect(firstHour).toHaveProperty('weatherCode');
                expect(firstHour).toHaveProperty('windSpeed');
                expect(firstHour).toHaveProperty('isDay');
            });

            it('should transform daily forecast correctly', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data.daily).toHaveLength(7);

                const firstDay = data.daily[0];
                expect(firstDay.date).toBe(mockWeatherResponse.daily.time[0]);
                expect(firstDay.temperatureMax).toBe(mockWeatherResponse.daily.temperature_2m_max[0]);
                expect(firstDay.temperatureMin).toBe(mockWeatherResponse.daily.temperature_2m_min[0]);
                expect(firstDay.precipitationProbability).toBe(mockWeatherResponse.daily.precipitation_probability_max[0]);
                expect(firstDay.precipitationSum).toBe(mockWeatherResponse.daily.precipitation_sum[0]);
                expect(firstDay.weatherCode).toBe(mockWeatherResponse.daily.weather_code[0]);
                expect(firstDay).toHaveProperty('sunrise');
                expect(firstDay).toHaveProperty('sunset');
            });

            it('should use auto timezone by default', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(capturedUrl).toContain('timezone=auto');
            });

            it('should use custom timezone when provided', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                    timezone: 'America/New_York',
                });

                expect(capturedUrl).toContain('timezone=America%2FNew_York');
            });

            it('should always request metric units', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json(mockWeatherResponse);
                    })
                );

                await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(capturedUrl).toContain('temperature_unit=celsius');
                expect(capturedUrl).toContain('wind_speed_unit=kmh');
                expect(capturedUrl).toContain('precipitation_unit=mm');
            });
        });

        describe('Error Handling', () => {
            it('should handle missing current data', async () => {
                server.use(errorHandlers.partialData);

                await expect(
                    fetchWeatherData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'INVALID_DATA',
                });
            });

            it('should handle server errors', async () => {
                server.use(errorHandlers.serverError);

                await expect(
                    fetchWeatherData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'SERVER_ERROR',
                });
            });

            it('should handle network errors', async () => {
                server.use(errorHandlers.networkError);

                await expect(
                    fetchWeatherData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'NETWORK_ERROR',
                });
            });

            it('should handle simulated errors', async () => {
                setSimulatedError('RATE_LIMITED');

                await expect(
                    fetchWeatherData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'RATE_LIMITED',
                });
            });
        });

        describe('Data Validation', () => {
            it('should handle null values in response', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return HttpResponse.json({
                            ...mockWeatherResponse,
                            current: {
                                ...mockWeatherResponse.current,
                                temperature_2m: null,
                                apparent_temperature: null,
                            },
                        });
                    })
                );

                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data.current.temperature).toBe(0);
                expect(data.current.feelsLike).toBe(0);
            });

            it('should handle is_day as 0 (night)', async () => {
                server.use(
                    http.get('https://api.open-meteo.com/v1/forecast', () => {
                        return HttpResponse.json({
                            ...mockWeatherResponse,
                            current: {
                                ...mockWeatherResponse.current,
                                is_day: 0,
                            },
                        });
                    })
                );

                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data.current.isDay).toBe(false);
            });

            it('should validate weather codes are numbers', async () => {
                const data = await fetchWeatherData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(typeof data.current.weatherCode).toBe('number');
                data.hourly.forEach(h => expect(typeof h.weatherCode).toBe('number'));
                data.daily.forEach(d => expect(typeof d.weatherCode).toBe('number'));
            });
        });
    });

    describe('fetchHistoricalData', () => {
        describe('Successful Requests', () => {
            it('should fetch historical data for valid coordinates', async () => {
                const data = await fetchHistoricalData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
                expect(data.length).toBe(30);
            });

            it('should transform historical data correctly', async () => {
                const data = await fetchHistoricalData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                const firstDay = data[0];
                expect(firstDay).toHaveProperty('date');
                expect(firstDay).toHaveProperty('temperatureMax');
                expect(firstDay).toHaveProperty('temperatureMin');
                expect(firstDay).toHaveProperty('temperatureMean');
                expect(firstDay).toHaveProperty('precipitationSum');
                expect(firstDay).toHaveProperty('weatherCode');
            });

            it('should use default 30 days', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://archive-api.open-meteo.com/v1/archive', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json(mockHistoricalResponse);
                    })
                );

                await fetchHistoricalData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                });

                // Check that date range is approximately 30 days
                const url = new URL(capturedUrl);
                const startDate = new Date(url.searchParams.get('start_date')!);
                const endDate = new Date(url.searchParams.get('end_date')!);
                const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                expect(daysDiff).toBe(29); // 30 days inclusive
            });

            it('should use custom days parameter', async () => {
                let capturedUrl: string = '';

                server.use(
                    http.get('https://archive-api.open-meteo.com/v1/archive', ({ request }) => {
                        capturedUrl = request.url;
                        return HttpResponse.json({
                            ...mockHistoricalResponse,
                            daily: {
                                ...mockHistoricalResponse.daily,
                                time: Array.from({ length: 7 }, (_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (7 - i));
                                    return date.toISOString().split('T')[0];
                                }),
                            },
                        });
                    })
                );

                await fetchHistoricalData({
                    latitude: 51.5074,
                    longitude: -0.1278,
                    days: 7,
                });

                const url = new URL(capturedUrl);
                const startDate = new Date(url.searchParams.get('start_date')!);
                const endDate = new Date(url.searchParams.get('end_date')!);
                const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                expect(daysDiff).toBe(6); // 7 days inclusive
            });
        });

        describe('Error Handling', () => {
            it('should handle missing daily data', async () => {
                server.use(
                    http.get('https://archive-api.open-meteo.com/v1/archive', () => {
                        return HttpResponse.json({
                            latitude: 51.5074,
                            longitude: -0.1278,
                        });
                    })
                );

                await expect(
                    fetchHistoricalData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'INVALID_DATA',
                });
            });

            it('should handle server errors', async () => {
                server.use(
                    http.get('https://archive-api.open-meteo.com/v1/archive', () => {
                        return new HttpResponse(null, { status: 500 });
                    })
                );

                await expect(
                    fetchHistoricalData({ latitude: 51.5074, longitude: -0.1278 })
                ).rejects.toMatchObject({
                    type: 'SERVER_ERROR',
                });
            });
        });
    });
});

