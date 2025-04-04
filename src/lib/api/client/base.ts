import { ApiClient, ApiClientConfig, ApiResponse, RequestOptions, RequestParams } from '@/types/apiClient';
import { ApiCache } from './cache';
import { createInterceptors } from './interceptors';
import { ApiSession } from './session';

/**
 * Base API client implementation
 */
export class BaseApiClient implements ApiClient {
    public config: ApiClientConfig;
    private cache: ApiCache;
    private session: ApiSession;
    private interceptors: ReturnType<typeof createInterceptors>;

    constructor(config: ApiClientConfig) {
        this.config = config;
        this.cache = new ApiCache();
        this.session = new ApiSession(config);
        this.interceptors = createInterceptors(config);
    }

    /**
     * Get base URL
     */
    getBaseUrl(): string {
        return this.config.baseUrl;
    }

    /**
     * Make GET request
     */
    async get<T = any>(path: string, params?: Record<string, string>, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'GET',
            path,
            params,
            options
        });
    }

    /**
     * Make POST request
     */
    async post<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'POST',
            path,
            data,
            options
        });
    }

    /**
     * Make PUT request
     */
    async put<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            path,
            data,
            options
        });
    }

    /**
     * Make DELETE request
     */
    async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            path,
            options
        });
    }

    /**
     * Make PATCH request
     */
    async patch<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PATCH',
            path,
            data,
            options
        });
    }

    /**
     * Make request with retry logic
     */
    private async request<T>(params: RequestParams): Promise<ApiResponse<T>> {
        const { method, path, data, params: queryParams, options = {} } = params;
        const url = this.buildUrl(path, queryParams);
        const cacheKey = this.getCacheKey(method, url, data);

        // Check cache
        if (method === 'GET' && options.cache?.enabled) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached as ApiResponse<T>;
            }
        }

        // Prepare request
        const headers = this.session.addSessionHeaders(options.headers || {});
        const requestOptions: RequestInit = {
            method,
            headers,
            ...options.fetchOptions
        };

        if (data) {
            requestOptions.body = JSON.stringify(data);
        }

        // Apply request interceptor
        const finalOptions = await this.interceptors.request(requestOptions);

        // Make request with retry logic
        let retryCount = 0;
        const maxRetries = options.retryCount || this.config.retries || 3;
        const retryDelay = options.retryDelay || this.config.retryDelay || 1000;

        while (true) {
            try {
                const response = await fetch(url, finalOptions);
                const interceptedResponse = await this.interceptors.response(response);
                const result = await this.handleResponse<T>(interceptedResponse);

                // Cache response if needed
                if (method === 'GET' && options.cache?.enabled) {
                    this.cache.set(cacheKey, result, options);
                }

                return result;
            } catch (error) {
                if (retryCount >= maxRetries) {
                    await this.interceptors.error(error);
                    throw error;
                }

                retryCount++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(path: string, params?: Record<string, string>): string {
        const url = new URL(path, this.getBaseUrl());
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }
        return url.toString();
    }

    /**
     * Get cache key for request
     */
    private getCacheKey(method: string, url: string, data?: any): string {
        return `${method}:${url}:${data ? JSON.stringify(data) : ''}`;
    }

    /**
     * Handle response
     */
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();
        return {
            data,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
        };
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        this.cache.destroy();
    }
} 