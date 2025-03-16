import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code?: string;
        message: string;
        details?: any;
    };
    metadata?: {
        page?: number;
        perPage?: number;
        totalCount?: number;
        totalPages?: number;
    };
}

/**
 * Error codes for standardized API responses
 */
export enum ErrorCode {
    VALIDATION_ERROR = 'validation_error',
    AUTHENTICATION_ERROR = 'authentication_error',
    AUTHORIZATION_ERROR = 'authorization_error',
    NOT_FOUND = 'not_found',
    CONFLICT = 'conflict',
    RATE_LIMIT = 'rate_limit',
    INTERNAL_ERROR = 'internal_error',
    GITHUB_API_ERROR = 'github_api_error',
    BAD_REQUEST = 'bad_request',
}

/**
 * Creates a successful API response
 * 
 * @param data Response data
 * @param message Optional success message
 * @param metadata Optional metadata for pagination etc.
 * @returns NextResponse with standardized format
 */
export function successResponse<T>(
    data: T,
    message?: string,
    metadata?: ApiResponse['metadata'],
    status = 200
): NextResponse {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };

    if (message) {
        response.message = message;
    }

    if (metadata) {
        response.metadata = metadata;
    }

    return NextResponse.json(response, { status });
}

/**
 * Creates an error API response
 * 
 * @param message Error message
 * @param code Error code
 * @param details Additional error details
 * @param status HTTP status code
 * @returns NextResponse with standardized error format
 */
export function errorResponse(
    message: string,
    code: ErrorCode | string = ErrorCode.INTERNAL_ERROR,
    details?: any,
    status = 500
): NextResponse {
    const response: ApiResponse = {
        success: false,
        error: {
            code,
            message,
        },
    };

    if (details) {
        response.error!.details = details;
    }

    return NextResponse.json(response, { status });
}

/**
 * Creates a validation error response from Zod error
 * 
 * @param error Zod validation error
 * @returns NextResponse with formatted validation errors
 */
export function validationErrorResponse(error: ZodError): NextResponse {
    return errorResponse(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        formatZodError(error),
        400
    );
}

/**
 * Formats a Zod error into a more user-friendly structure
 * 
 * @param error Zod validation error
 * @returns Formatted error object
 */
export function formatZodError(error: ZodError): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
            formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
    });

    return formattedErrors;
}

/**
 * Common error response helpers
 */
export const errors = {
    badRequest: (message = 'Bad request', details?: any) =>
        errorResponse(message, ErrorCode.BAD_REQUEST, details, 400),

    unauthorized: (message = 'Authentication required', details?: any) =>
        errorResponse(message, ErrorCode.AUTHENTICATION_ERROR, details, 401),

    forbidden: (message = 'Permission denied', details?: any) =>
        errorResponse(message, ErrorCode.AUTHORIZATION_ERROR, details, 403),

    notFound: (message = 'Resource not found', details?: any) =>
        errorResponse(message, ErrorCode.NOT_FOUND, details, 404),

    conflict: (message = 'Resource already exists', details?: any) =>
        errorResponse(message, ErrorCode.CONFLICT, details, 409),

    rateLimit: (message = 'Rate limit exceeded', details?: any) =>
        errorResponse(message, ErrorCode.RATE_LIMIT, details, 429),

    internal: (message = 'Internal server error', details?: any) =>
        errorResponse(message, ErrorCode.INTERNAL_ERROR, details, 500),

    github: (message = 'GitHub API error', details?: any) =>
        errorResponse(message, ErrorCode.GITHUB_API_ERROR, details, 502),
};

/**
 * Safely handles API errors and returns appropriate responses
 * 
 * @param error Any caught error
 * @returns Standardized error response
 */
export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Handle specific error types
    if (error instanceof ZodError) {
        return validationErrorResponse(error);
    }

    if (error instanceof Error) {
        // Handle GitHub API specific errors
        if ((error as any).status === 404) {
            return errors.notFound('GitHub resource not found');
        }

        if ((error as any).status === 403 && (error as any).message?.includes('rate limit')) {
            return errors.rateLimit('GitHub API rate limit exceeded');
        }

        // General error with message
        return errors.internal(error.message);
    }

    // Unknown error type
    return errors.internal('An unexpected error occurred');
}

/**
 * Creates a paginated response
 * 
 * @param data Response data array
 * @param page Current page number
 * @param perPage Items per page
 * @param totalCount Total number of items
 * @param message Optional success message
 * @returns NextResponse with pagination metadata
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    perPage: number,
    totalCount: number,
    message?: string
): NextResponse {
    const totalPages = Math.ceil(totalCount / perPage);

    return successResponse(
        data,
        message,
        {
            page,
            perPage,
            totalCount,
            totalPages
        }
    );
}