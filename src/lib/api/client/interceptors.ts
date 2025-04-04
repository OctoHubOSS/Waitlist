import { ApiClientConfig } from '@/types/apiClient';

/**
 * Default request interceptor
 */
export async function defaultRequestInterceptor(options: RequestInit): Promise<RequestInit> {
    return {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
}

/**
 * Default response interceptor
 */
export async function defaultResponseInterceptor(response: Response): Promise<Response> {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
}

/**
 * Default error interceptor
 */
export async function defaultErrorInterceptor(error: any): Promise<any> {
    console.error('API request failed:', error);
    throw error;
}

/**
 * Create interceptors from config
 */
export function createInterceptors(config: ApiClientConfig) {
    return {
        request: config.requestInterceptor || defaultRequestInterceptor,
        response: config.responseInterceptor || defaultResponseInterceptor,
        error: config.errorInterceptor || defaultErrorInterceptor
    };
} 