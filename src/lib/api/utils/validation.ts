import { z } from 'zod';
import { ApiValidationSchema, ValidationResult } from '@/types/apiClient';

/**
 * Validates data against a schema
 */
export function validateData<T = any>(
    schema: ApiValidationSchema<T>,
    data: any
): ValidationResult<T> {
    if (!schema.request) {
        return {
            success: true,
            data: data as T
        };
    }

    try {
        const validatedData = schema.request.parse(data);
        return {
            success: true,
            data: validatedData
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: {
                    message: 'Validation failed',
                    details: error
                }
            };
        }
        throw error;
    }
}

/**
 * Validates response data against a schema
 */
export function validateResponse<T = any>(
    schema: ApiValidationSchema<any, T>,
    data: any
): ValidationResult<T> {
    if (!schema.response) {
        return {
            success: true,
            data: data as T
        };
    }

    try {
        const validatedData = schema.response.parse(data);
        return {
            success: true,
            data: validatedData
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: {
                    message: 'Response validation failed',
                    details: error
                }
            };
        }
        throw error;
    }
}

/**
 * Formats validation errors
 */
export function formatValidationErrors(error: z.ZodError): Array<{
    path: string;
    message: string;
}> {
    return error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
    }));
} 