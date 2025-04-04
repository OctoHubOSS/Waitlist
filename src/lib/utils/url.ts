/**
 * URL utilities specialized for API operations
 */
import { 
    createAbsoluteUrl as baseCreateUrl, 
    addQueryParams, 
    QueryParams 
} from '@/utils/url';

/**
 * Creates an API URL with appropriate configuration
 * @param endpoint - The API endpoint path
 * @param params - Optional query parameters
 * @param baseUrl - Optional base URL override
 * @returns The complete API URL
 */
export function createApiUrl(endpoint: string, params?: QueryParams, baseUrl?: string): string {
    const apiPath = process.env.NEXT_PUBLIC_API_PATH || '/api';
    const path = `${apiPath}/${endpoint.replace(/^\/+/, '')}`;
    const url = baseCreateUrl(path, baseUrl);
    return addQueryParams(url, params);
}

// Remove the duplicate "createApiAbsoluteUrl" function
// and just re-export the base function directly
export { baseCreateUrl as createAbsoluteUrl };
