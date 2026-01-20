import { apiClient, checkSimulatedError } from './client';
import { NominatimSearchResult, createApiError } from '@/types/api';
import { SearchResult, Location } from '@/types/location';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchLocations(query: string): Promise<SearchResult[]> {
  checkSimulatedError();

  if (!query || query.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '8',
    'accept-language': 'en',
    featuretype: 'city',
  });

  const url = `${NOMINATIM_BASE_URL}/search?${params}`;

  const results = await apiClient<NominatimSearchResult[]>(url, {
    headers: {
      'User-Agent': 'WeatherApp/1.0',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!results || results.length === 0) {
    return [];
  }

  return results
    .filter((result) => {
      // Filter for places that are cities, towns, villages, or countries
      const validTypes = ['city', 'town', 'village', 'municipality', 'administrative', 'country'];
      return validTypes.includes(result.addresstype) || validTypes.includes(result.type);
    })
    .map(transformSearchResult)
    .filter((result, index, self) =>
      // Remove duplicates based on coordinates
      index === self.findIndex(
        (r) =>
          Math.abs(r.latitude - result.latitude) < 0.01 &&
          Math.abs(r.longitude - result.longitude) < 0.01
      )
    );
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  checkSimulatedError();

  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'en',
  });

  const url = `${NOMINATIM_BASE_URL}/reverse?${params}`;

  try {
    const result = await apiClient<NominatimSearchResult>(url, {
      headers: {
        'User-Agent': 'WeatherApp/1.0',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!result) {
      return null;
    }

    return transformToLocation(result, latitude, longitude);
  } catch {
    // If reverse geocoding fails, create a basic location
    return {
      id: `${latitude.toFixed(4)}_${longitude.toFixed(4)}`,
      name: 'Current Location',
      country: '',
      latitude,
      longitude,
      displayName: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    };
  }
}

function transformSearchResult(result: NominatimSearchResult): SearchResult {
  const { address } = result;
  const name =
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    result.name ||
    'Unknown';
  const state = address?.state;
  const country = address?.country || '';

  const displayParts = [name];
  if (state && state !== name) displayParts.push(state);
  if (country && country !== name && country !== state) displayParts.push(country);

  return {
    id: `${result.place_id}`,
    name,
    country,
    state,
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    displayName: displayParts.join(', '),
  };
}

function transformToLocation(
  result: NominatimSearchResult,
  latitude: number,
  longitude: number
): Location {
  const searchResult = transformSearchResult(result);
  return {
    ...searchResult,
    latitude,
    longitude,
    id: `${latitude.toFixed(4)}_${longitude.toFixed(4)}`,
  };
}

// Utility to create a location from search result
export function searchResultToLocation(result: SearchResult): Location {
  return {
    ...result,
    id: `${result.latitude.toFixed(4)}_${result.longitude.toFixed(4)}`,
  };
}

