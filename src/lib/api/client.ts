import { ApiClient, ApiConfig, ApiResponse, ApiError } from './types';
import { errorResponse, successResponse, withTimeout, withRetry } from './utils';
import { getSession } from 'next-auth/react';
import { CONTENT_TYPES, TIMEOUTS, RETRY_SETTINGS } from './constants';

/**
 * Base API client class
 */
export class BaseApiClient implements ApiClient {
    public config: ApiConfig;
    private sessionPromise: Promise<any> | null = null;
    private sessionCache: any = null;
    private sessionLastFetched: number = 0;
    private sessionTtl: number = 60000; // 1 minute

    constructor(config: ApiConfig) {
        this.config = config;
    }

    /**
     * Gets the base URL for the client
     */
    public getBaseUrl(): string {
        return this.config.baseUrl;
    }

    /**
     * Makes a GET request
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
     * Makes a POST request
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
     * Makes a PUT request
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
     * Makes a DELETE request
     */
    async delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            path,
            options
        });
    }

    /**
     * Makes a PATCH request
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
     * Core request method that handles all request types
     */
    private async request<T>({
        method,
        path,
        data,
        params,
        options
    }: RequestParams): Promise<ApiResponse<T>> {
        try {
            const url = this.buildUrl(path, params);
            const headers = await this.getHeaders(options?.headers);
            
            // Validate HTTP method
            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
            if (!validMethods.includes(method.toUpperCase())) {
                return errorResponse(`Invalid HTTP method: ${method}`, {
                    code: 'INVALID_HTTP_METHOD',
                    statusCode: 405,
                    details: {
                        method,
                        validMethods
                    }
                });
            }
            
            const requestOptions: RequestInit = {
                method,
                headers,
                credentials: 'include',
                ...options?.fetchOptions
            };

            if (data && method !== 'GET') {
                requestOptions.body = JSON.stringify(data);
            }

            // Setup request with timeout
            const timeoutDuration = options?.timeout || this.config.timeout || TIMEOUTS.DEFAULT;
            
            // Determine if we should use retry logic
            const shouldUseRetry = options?.retry ?? this.config.retries !== 0;
            
            let response: Response;
            
            if (shouldUseRetry) {
                const retryCount = options?.retryCount || this.config.retries || RETRY_SETTINGS.MAX_RETRIES;
                const retryDelay = options?.retryDelay || this.config.retryDelay || RETRY_SETTINGS.RETRY_DELAY;
                
                response = await withRetry(
                    () => withTimeout(fetch(url, requestOptions), timeoutDuration),
                    {
                        retries: retryCount,
                        initialDelay: retryDelay,
                        shouldRetry: (error) => {
                            // Retry on network errors or 5xx server errors
                            if (error instanceof Error) return true;
                            if (error.status >= 500) return true;
                            return false;
                        }
                    }
                );
            } else {
                response = await withTimeout(fetch(url, requestOptions), timeoutDuration);
            }

            return await this.handleResponse<T>(response);
        } catch (error) {
            if (error instanceof Error) {
                console.error(`API Request failed: ${error.message}`, error);
                
                const isTimeoutError = error.message.includes('timed out');
                const errorCode = isTimeoutError ? 'REQUEST_TIMEOUT' : 'REQUEST_FAILED';
                
                return errorResponse(error.message, {
                    code: errorCode,
                    details: {
                        method,
                        path,
                        error: error.stack
                    }
                });
            }
            
            return errorResponse('Request failed with unknown error');
        }
    }

    /**
     * Builds a URL with query parameters
     */
    private buildUrl(path: string, params?: Record<string, string>): string {
        let normalizedPath = path;
        if (!path.startsWith('/') && !this.config.baseUrl.endsWith('/')) {
            normalizedPath = '/' + path;
        }
        
        const url = new URL(this.config.baseUrl + normalizedPath);
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value);
                }
            });
        }
        
        return url.toString();
    }

    /**
     * Gets cached session data or fetches fresh session
     */
    private async getSessionData(): Promise<any> {
        const now = Date.now();
        
        // Return cached session if it's still valid
        if (
            this.sessionCache && 
            this.sessionLastFetched > 0 && 
            now - this.sessionLastFetched < this.sessionTtl
        ) {
            return this.sessionCache;
        }
        
        // Clear any existing session promise to prevent race conditions
        this.sessionPromise = null;
        
        // Fetch new session
        try {
            this.sessionPromise = getSession();
            const session = await this.sessionPromise;
            
            // Update cache
            this.sessionCache = session;
            this.sessionLastFetched = now;
            
            return session;
        } catch (error) {
            console.warn('Failed to fetch session:', error);
            return null;
        }
    }

    /**
     * Gets headers for requests
     */
    private async getHeaders(additionalHeaders?: HeadersInit): Promise<HeadersInit> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.config.headers,
        };

        // Add client request ID for tracing
        headers['X-Request-ID'] = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        
        // Add session data if configured to use session
        if (this.config.useSession !== false) {
            try {
                const session = await this.getSessionData();
                if (session?.user?.email) {
                    headers['X-User-Email'] = session.user.email;
                }
                if (session?.user?.id) {
                    headers['X-User-ID'] = session.user.id;
                }
            } catch (error) {
                console.warn('Failed to get session data for request:', error);
            }
        }

        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        // Add any additional headers, possibly overwriting defaults
        if (additionalHeaders) {
            const additionalHeadersObj = additionalHeaders instanceof Headers 
                ? Object.fromEntries(additionalHeaders.entries())
                : (typeof additionalHeaders === 'object' ? additionalHeaders : {});
                
            Object.assign(headers, additionalHeadersObj);
        }

        return headers;
    }

    /**
     * Handles API response
     */
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type') || '';
        const isJsonResponse = contentType.includes('application/json');
        
        // Special handling for no-content responses
        if (response.status === 204) {
            return successResponse(undefined as any);
        }
        
        try {
            // Handle JSON responses
            if (isJsonResponse) {
                const data = await response.json();
                
                // Check for error responses
                if (!response.ok) {
                    // API returned an error with details
                    return errorResponse(data.error?.message || 'Request failed', {
                        code: data.error?.code || `HTTP_${response.status}`,
                        statusCode: response.status,
                        details: data.error?.details || data
                    });
                }
                
                // Handle explicit success/error response format
                if (typeof data === 'object' && data !== null && 'success' in data) {
                    if (data.success === false && data.error) {
                        return data as ApiResponse<T>;
                    }
                    return data as ApiResponse<T>;
                }
                
                // Wrap raw data in success response
                return successResponse(data);
            }
            
            // Handle non-JSON responses
            const text = await response.text();
            
            // If response is not OK, return error
            if (!response.ok) {
                console.error('Received non-JSON error response:', {
                    status: response.status,
                    contentType,
                    bodyPreview: text.substring(0, 500)
                });
                
                return errorResponse(`Server returned ${response.status} ${response.statusText}`, {
                    code: `HTTP_${response.status}`,
                    statusCode: response.status,
                    details: {
                        contentType,
                        bodyPreview: text.substring(0, 200)
                    }
                });
            }
            
            // For successful non-JSON responses, return text as data
            // This is useful for plaintext, HTML, or other response types
            return successResponse({ content: text, contentType } as any);
            
        } catch (error) {
            // Handle JSON parsing errors or other response handling issues
            console.error('Error processing response:', error);
            
            return errorResponse('Failed to process response', {
                code: 'RESPONSE_PROCESSING_ERROR',
                statusCode: response.status,
                details: {
                    status: response.status,
                    contentType,
                    error: error instanceof Error ? error.message : String(error)
                }
            });
        }
    }
}

/**
 * Request options interface
 */
export interface RequestOptions {
    headers?: HeadersInit;
    fetchOptions?: Omit<RequestInit, 'method' | 'headers' | 'body'>;
    timeout?: number;
    retry?: boolean;
    retryCount?: number;
    retryDelay?: number;
}

/**
 * Parameters for the request method
 */
interface RequestParams {
    method: string;
    path: string;
    data?: any;
    params?: Record<string, string>;
    options?: RequestOptions;
}

/**
 * Creates a new API client instance
 */
export function createApiClient(config: ApiConfig): ApiClient {
    // Normalize the base URL to ensure it has a proper protocol
    if (config.baseUrl && !config.baseUrl.startsWith('http')) {
        // For client-side, use the current protocol
        if (typeof window !== 'undefined') {
            config.baseUrl = `${window.location.protocol}//${config.baseUrl}`;
        } else {
            // For server-side, default to http
            config.baseUrl = `http://${config.baseUrl}`;
        }
    }
    
    return new BaseApiClient(config);
}