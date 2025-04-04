import { z } from 'zod';
import { ApiMiddleware, ApiRequest, ApiResponse } from '@/types/apiClient';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants';

/**
 * Middleware to validate request body against a schema
 */
export function validateRequest(schema: z.ZodType<any>): ApiMiddleware {
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        try {
            if (req.data) {
                req.data = await schema.parseAsync(req.data);
            }
            await next();
        } catch (error) {
            res.success = false;

            if (error instanceof z.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));

                res.error = {
                    name: 'ValidationError',
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: ERROR_MESSAGES.VALIDATION_ERROR,
                    details: {
                        validationErrors: formattedErrors
                    }
                };
            } else {
                res.error = {
                    name: 'ValidationError',
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: ERROR_MESSAGES.VALIDATION_ERROR,
                    details: error instanceof Error ? error.message : String(error)
                };
            }
        }
    };
} 