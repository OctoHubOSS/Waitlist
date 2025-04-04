/**
 * URL utilities for creating and manipulating URLs in a consistent way
 * throughout the application. This module provides the base functionality
 * used by the urlBuilder and API modules.
 */

/**
 * Type for query parameters that can be added to URLs
 */
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * Creates an absolute URL from a relative path
 * @param path - The relative path to convert to an absolute URL
 * @param baseUrl - Optional base URL (defaults to app URL from environment)
 * @returns A properly formatted absolute URL
 */
export function createAbsoluteUrl(path: string, baseUrl?: string): string {
    // Use provided baseUrl or default to the environment variable
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';
    
    // Ensure baseUrl has a protocol
    const normalizedBase = base.startsWith('http') 
        ? base 
        : `${typeof window !== 'undefined' ? window.location.protocol : 'http'}://${base}`;
    
    // Normalize path to ensure it starts with / but doesn't duplicate with baseUrl
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    try {
        return new URL(normalizedPath, normalizedBase).toString();
    } catch (error) {
        console.error('Failed to create absolute URL:', error);
        return normalizedBase + normalizedPath;
    }
}

/**
 * Returns the base URL of the application based on the current environment
 * @returns The base URL for the current environment
 */
export function getBaseUrl(): string {
    // For server-side rendering
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_APP_URL || 
               (process.env.NODE_ENV === 'development' 
                ? 'http://localhost:3000' 
                : 'https://octohub.dev');
    }
    
    // For client-side rendering
    return window.location.origin;
}

/**
 * Combines URL parts ensuring proper formatting with slashes
 * @param parts - URL path segments to combine
 * @returns A properly formatted URL path
 */
export function combineUrlParts(...parts: string[]): string {
    return parts
        .map(part => part.trim().replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
}

/**
 * Adds query parameters to a URL
 * @param url - The base URL to add parameters to
 * @param params - Object containing parameters as key-value pairs
 * @returns URL with query parameters appended
 */
export function addQueryParams(url: string, params?: QueryParams): string {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }
    
    const urlObj = new URL(url.startsWith('http') ? url : `http://example.com/${url}`);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            urlObj.searchParams.append(key, String(value));
        }
    });
    
    // If the original URL didn't have a protocol, we remove the fake domain
    if (!url.startsWith('http')) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
    }
    
    return urlObj.toString();
}

/**
 * Parses URL parameters from a URL or search string
 * @param urlOrSearch - URL or search string to parse
 * @returns Object containing the parsed parameters
 */
export function parseUrlParams(urlOrSearch: string): Record<string, string> {
    const searchParams = urlOrSearch.includes('?') 
        ? new URLSearchParams(urlOrSearch.split('?')[1])
        : new URLSearchParams(urlOrSearch);
    
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    
    return params;
}

/**
 * Joins a base URL with a path, handling trailing/leading slashes correctly
 * @param base - The base URL
 * @param path - The path to append
 * @returns The combined URL
 */
export function joinUrl(base: string, path: string): string {
    const baseWithTrailingSlash = base.endsWith('/') ? base : `${base}/`;
    const pathWithoutLeadingSlash = path.startsWith('/') ? path.substring(1) : path;
    return `${baseWithTrailingSlash}${pathWithoutLeadingSlash}`;
}
