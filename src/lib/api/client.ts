import { ApiError, ApiErrorType, createApiError } from '@/types/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export async function apiClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw handleHttpError(response.status);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw handleFetchError(error);
  }
}

function handleHttpError(status: number): ApiError {
  switch (status) {
    case 400:
      return createApiError('INVALID_DATA', 'Invalid request parameters', status);
    case 404:
      return createApiError('LOCATION_NOT_FOUND', undefined, status);
    case 429:
      return createApiError('RATE_LIMITED', undefined, status);
    case 500:
    case 502:
    case 503:
    case 504:
      return createApiError('SERVER_ERROR', undefined, status);
    default:
      return createApiError('UNKNOWN_ERROR', `HTTP error: ${status}`, status);
  }
}

function handleFetchError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Check if it's already an ApiError
    if ('type' in error && 'retryable' in error) {
      return error as ApiError;
    }

    if (error.name === 'AbortError') {
      return createApiError('NETWORK_ERROR', 'Request timed out. Please try again.');
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      return createApiError('NETWORK_ERROR');
    }
  }

  return createApiError('UNKNOWN_ERROR');
}

// Error simulation for development
let simulatedError: ApiErrorType | null = null;

export function setSimulatedError(errorType: ApiErrorType | null): void {
  simulatedError = errorType;
}

export function getSimulatedError(): ApiErrorType | null {
  return simulatedError;
}

export function checkSimulatedError(): void {
  if (simulatedError) {
    throw createApiError(simulatedError);
  }
}

