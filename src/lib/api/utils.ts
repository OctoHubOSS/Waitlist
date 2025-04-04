import { ApiResponse, ApiError } from './types';
import { ERROR_CODES } from './constants';
import { createAbsoluteUrl as createUrl } from '@/utils/url';

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Creates an error response
 */
export function createErrorResponse(
    errorMessage: string | ApiError, 
    details?: Partial<Omit<ApiError, 'message'>>
): ApiResponse<never> {
    // Handle when an ApiError object is passed directly
    if (typeof errorMessage === 'object' && errorMessage !== null) {
        return {
            success: false,
            error: errorMessage,
        };
    }

    // Create a new error object
    const error: ApiError = {
        code: details?.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: errorMessage,
        ...details,
    };

    return {
        success: false,
        error,
    };
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates a password
 */
export function validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Sanitizes a string input
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Generates a random string
 */
export function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Formats a date for API responses
 */
export function formatDate(date: Date | string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString();
}

/**
 * Checks if a value is a valid date
 */
export function isValidDate(date: any): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merges multiple objects
 */
export function mergeObjects<T extends object>(...objects: T[]): T {
    return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
}

/**
 * Removes undefined values from an object
 */
export function removeUndefined<T extends object>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as T;
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback?: T): T | null {
    try {
        return JSON.parse(json) as T;
    } catch (error) {
        console.error('Failed to parse JSON:', error);
        return fallback !== undefined ? fallback : null;
    }
}

/**
 * Creates an absolute URL from a relative path
 */
export function createAbsoluteUrl(path: string, baseUrl?: string): string {
    return createUrl(path, baseUrl);
}

/**
 * Formats API error messages for display
 */
export function formatApiError(error?: ApiError): string {
    if (!error) return 'An unknown error occurred';
    
    if (error.details && typeof error.details === 'object') {
        // Handle validation errors with field-specific messages
        const fieldErrors = Object.entries(error.details)
            .filter(([_, value]) => typeof value === 'string')
            .map(([field, message]) => `${field}: ${message}`);
            
        if (fieldErrors.length > 0) {
            return fieldErrors.join(', ');
        }
    }
    
    return error.message || 'An unknown error occurred';
}

/**
 * Handles timeout for fetch requests
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([
        promise,
        timeoutPromise
    ]).finally(() => {
        clearTimeout(timeoutId);
    });
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>, 
    options: { 
        retries: number; 
        initialDelay: number;
        maxDelay?: number;
        shouldRetry?: (error: any) => boolean;
    }
): Promise<T> {
    const { retries, initialDelay, maxDelay = 30000, shouldRetry = () => true } = options;
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === retries || !shouldRetry(error)) {
                throw error;
            }
            
            const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}