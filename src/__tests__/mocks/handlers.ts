import { http, HttpResponse, delay } from 'msw';

// Mock data
export const mockWeatherResponse = {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    timezone_abbreviation: 'GMT',
    current: {
        time: '2024-01-15T12:00',
        temperature_2m: 8.5,
        relative_humidity_2m: 75,
        apparent_temperature: 6.2,
        is_day: 1,
        precipitation: 0.2,
        rain: 0.2,
        showers: 0,
        snowfall: 0,
        weather_code: 3,
        cloud_cover: 85,
        pressure_msl: 1015.2,
        surface_pressure: 1012.5,
        wind_speed_10m: 15.5,
        wind_direction_10m: 225,
        wind_gusts_10m: 28.3,
    },
    hourly: {
        time: Array.from({ length: 48 }, (_, i) => `2024-01-15T${String(i % 24).padStart(2, '0')}:00`),
        temperature_2m: Array.from({ length: 48 }, () => Math.random() * 10 + 5),
        relative_humidity_2m: Array.from({ length: 48 }, () => Math.floor(Math.random() * 40 + 50)),
        precipitation_probability: Array.from({ length: 48 }, () => Math.floor(Math.random() * 100)),
        precipitation: Array.from({ length: 48 }, () => Math.random() * 2),
        weather_code: Array.from({ length: 48 }, () => Math.floor(Math.random() * 4)),
        wind_speed_10m: Array.from({ length: 48 }, () => Math.random() * 20 + 5),
        is_day: Array.from({ length: 48 }, (_, i) => (i % 24 >= 6 && i % 24 < 20) ? 1 : 0),
    },
    daily: {
        time: ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21'],
        weather_code: [3, 61, 2, 0, 1, 63, 45],
        temperature_2m_max: [10.5, 9.2, 11.3, 12.1, 11.8, 8.5, 7.2],
        temperature_2m_min: [4.2, 5.1, 3.8, 4.5, 5.2, 3.1, 2.8],
        apparent_temperature_max: [8.2, 7.5, 9.1, 10.2, 9.8, 6.2, 5.1],
        apparent_temperature_min: [1.5, 2.3, 1.2, 2.1, 2.8, 0.5, -0.2],
        sunrise: Array.from({ length: 7 }, () => '2024-01-15T07:55'),
        sunset: Array.from({ length: 7 }, () => '2024-01-15T16:25'),
        precipitation_sum: [0.5, 5.2, 0.1, 0, 0, 8.5, 0.3],
        precipitation_probability_max: [20, 85, 15, 5, 10, 95, 30],
        wind_speed_10m_max: [18.5, 25.2, 12.3, 8.5, 10.2, 32.1, 15.5],
        uv_index_max: [2.1, 1.5, 2.8, 3.2, 2.9, 1.2, 1.8],
    },
};

export const mockHistoricalResponse = {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    daily: {
        time: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (30 - i));
            return date.toISOString().split('T')[0];
        }),
        weather_code: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10)),
        temperature_2m_max: Array.from({ length: 30 }, () => Math.random() * 15 + 5),
        temperature_2m_min: Array.from({ length: 30 }, () => Math.random() * 10),
        temperature_2m_mean: Array.from({ length: 30 }, () => Math.random() * 12 + 3),
        precipitation_sum: Array.from({ length: 30 }, () => Math.random() * 10),
    },
};

export const mockSearchResults = [
    {
        place_id: 123456,
        lat: '51.5073509',
        lon: '-0.1277583',
        name: 'London',
        type: 'city',
        addresstype: 'city',
        address: {
            city: 'London',
            state: 'England',
            country: 'United Kingdom',
        },
        display_name: 'London, England, United Kingdom',
    },
    {
        place_id: 789012,
        lat: '51.4545',
        lon: '-2.5879',
        name: 'Bristol',
        type: 'city',
        addresstype: 'city',
        address: {
            city: 'Bristol',
            state: 'England',
            country: 'United Kingdom',
        },
        display_name: 'Bristol, England, United Kingdom',
    },
];

export const mockReverseGeocodeResult = {
    place_id: 123456,
    lat: '51.5073509',
    lon: '-0.1277583',
    name: 'London',
    type: 'city',
    addresstype: 'city',
    address: {
        city: 'London',
        state: 'England',
        country: 'United Kingdom',
    },
    display_name: 'London, England, United Kingdom',
};

// MSW Handlers
export const handlers = [
    // Weather API - Success
    http.get('https://api.open-meteo.com/v1/forecast', () => {
        return HttpResponse.json(mockWeatherResponse);
    }),

    // Historical API - Success
    http.get('https://archive-api.open-meteo.com/v1/archive', () => {
        return HttpResponse.json(mockHistoricalResponse);
    }),

    // Nominatim Search - Success
    http.get('https://nominatim.openstreetmap.org/search', () => {
        return HttpResponse.json(mockSearchResults);
    }),

    // Nominatim Reverse - Success
    http.get('https://nominatim.openstreetmap.org/reverse', () => {
        return HttpResponse.json(mockReverseGeocodeResult);
    }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
    networkError: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return HttpResponse.error();
    }),

    timeout: http.get('https://api.open-meteo.com/v1/forecast', async () => {
        await delay(15000); // Longer than default timeout
        return HttpResponse.json(mockWeatherResponse);
    }),

    serverError: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    notFound: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse(JSON.stringify({ error: 'Not Found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    rateLimited: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse(JSON.stringify({ error: 'Rate Limited' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    badRequest: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse(JSON.stringify({ error: 'Bad Request' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    invalidJson: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return new HttpResponse('not json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    emptyResponse: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return HttpResponse.json({});
    }),

    partialData: http.get('https://api.open-meteo.com/v1/forecast', () => {
        return HttpResponse.json({
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London',
            // Missing current, hourly, daily
        });
    }),

    // Geocoding errors
    geocodingEmpty: http.get('https://nominatim.openstreetmap.org/search', () => {
        return HttpResponse.json([]);
    }),

    geocodingError: http.get('https://nominatim.openstreetmap.org/search', () => {
        return new HttpResponse(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }),

    reverseGeocodeError: http.get('https://nominatim.openstreetmap.org/reverse', () => {
        return new HttpResponse(JSON.stringify({ error: 'Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }),
};

