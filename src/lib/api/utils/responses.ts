import { ApiResponse, ApiError } from '@/types/apiClient';

/**
 * Creates a success response
 */
export function createSuccessResponse<T = any>(
    data: T,
    status: number = 200,
    headers: Record<string, string> = {}
): ApiResponse<T> {
    return {
        success: true,
        data,
        status,
        headers
    };
}

/**
 * Creates an error response
 */
export function createErrorResponse<T = any>(
    message: string,
    error?: Partial<ApiError>,
    status: number = 500,
    headers: Record<string, string> = {}
): ApiResponse<T> {
    return {
        success: false,
        error: {
            name: 'ApiError',
            code: error?.code || 'INTERNAL_SERVER_ERROR',
            message: error?.message || message,
            details: error?.details,
            statusCode: error?.statusCode || status
        },
        status,
        headers
    };
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse<T = any>(
    message: string,
    details?: any,
    status: number = 400
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'ValidationError',
        code: 'VALIDATION_ERROR',
        details,
        statusCode: status
    });
}

/**
 * Creates an authentication error response
 */
export function createAuthErrorResponse<T = any>(
    message: string = 'Unauthorized',
    status: number = 401
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'AuthenticationError',
        code: 'AUTHENTICATION_ERROR',
        statusCode: status
    });
}

/**
 * Creates an authorization error response
 */
export function createAuthorizationErrorResponse<T = any>(
    message: string = 'Forbidden',
    status: number = 403
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'AuthorizationError',
        code: 'AUTHORIZATION_ERROR',
        statusCode: status
    });
}

/**
 * Creates a not found error response
 */
export function createNotFoundErrorResponse<T = any>(
    message: string = 'Not Found',
    status: number = 404
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'NotFoundError',
        code: 'NOT_FOUND',
        statusCode: status
    });
}

/**
 * Creates a rate limit error response
 */
export function createRateLimitErrorResponse<T = any>(
    message: string = 'Too Many Requests',
    status: number = 429
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'RateLimitError',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: status
    });
}

/**
 * Creates an internal error response
 */
export function createInternalErrorResponse<T = any>(
    message: string = 'Internal Server Error',
    status: number = 500
): ApiResponse<T> {
    return createErrorResponse(message, {
        name: 'InternalError',
        code: 'INTERNAL_ERROR',
        statusCode: status
    });
} 