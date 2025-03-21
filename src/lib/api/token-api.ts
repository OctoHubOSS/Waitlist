/**
 * Utility for making authenticated API requests with tokens
 */
import { tokenService } from '@/lib/auth/token-service';

interface ApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  token?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
  token?: string;
}

/**
 * A client for making API requests with token authentication
 */
export class TokenApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private token?: string;

  constructor(options: ApiOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.defaultHeaders = options.headers || {};
    this.token = options.token;
  }

  /**
   * Set the API token to use for requests
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the API token
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      cache,
      token = this.token
    } = options;

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    // Prepare headers with authentication if token is provided
    const requestHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Add content-type for requests with body
    if (body && !requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    // Make the request
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      cache,
    });

    // Parse the response
    let data: any;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const error = new Error(
        typeof data === 'object' ? data.message || 'API request failed' : 'API request failed'
      ) as Error & { status?: number; data?: any };
      
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  // Convenience methods for common HTTP methods
  async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export a singleton instance
export const tokenApi = new TokenApiClient();

/**
 * Create a token API client with a specific token
 */
export function createTokenClient(token: string, baseUrl?: string): TokenApiClient {
  return new TokenApiClient({ token, baseUrl });
}

/**
 * Validate a token and return a client if valid
 */
export async function getTokenClient(token: string, baseUrl?: string): Promise<TokenApiClient | null> {
  const result = await tokenService.validateToken(token);
  
  if (!result.valid) {
    return null;
  }
  
  return createTokenClient(token, baseUrl);
}
