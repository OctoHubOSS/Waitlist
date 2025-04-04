import { ApiError } from '@/types/apiClient';

/**
 * Handles an error and returns an ApiError
 */
export function handleError(error: any): ApiError {
    if (error instanceof Error) {
        return {
            name: 'ApiError',
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            details: {
                stack: error.stack
            }
        };
    }

    if (typeof error === 'object' && error !== null) {
        return {
            name: 'ApiError',
            code: error.code || 'INTERNAL_SERVER_ERROR',
            message: error.message || 'An unknown error occurred',
            details: error.details || error
        };
    }

    return {
        name: 'ApiError',
        code: 'INTERNAL_SERVER_ERROR',
        message: String(error) || 'An unknown error occurred',
    };
}

/**
 * Checks if an error is an ApiError
 */
export function isApiError(error: any): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        'code' in error &&
        'message' in error
    );
}

/**
 * Gets the status code for an error
 */
export function getErrorStatusCode(error: any): number {
    if (isApiError(error)) {
        return error.statusCode || 500;
    }

    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        return error.statusCode as number;
    }

    return 500;
} 