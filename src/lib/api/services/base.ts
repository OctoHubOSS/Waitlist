import { ApiService, ApiConfig, ApiResponse, ApiError, ApiValidationSchema } from '@/types/apiClient';
import { createApiClient } from '../client';
import { createSuccessResponse, createErrorResponse } from '../utils';
import { getApiConfig } from '../config';
import { z } from 'zod';

/**
 * Base API service class
 */
export class BaseApiService implements ApiService {
    public client;

    constructor(config?: ApiConfig) {
        // Use default config if none provided
        this.client = createApiClient(config || getApiConfig());
    }

    /**
     * Validates data against a schema
     */
    async validate<T = any>(schema: ApiValidationSchema<T>, data: any): Promise<T> {
        if (!schema.request) {
            return data as T;
        }

        try {
            return schema.request.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));

                throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
            }
            throw error;
        }
    }

    /**
     * Handles an error response
     */
    public handleError(error: any): ApiError {
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
     * Validates a response
     */
    protected validateResponse<T>(response: ApiResponse<T>, schema?: ApiValidationSchema<any, T>): ApiResponse<T> {
        if (!response.success) {
            return response;
        }

        if (schema?.response && response.data) {
            try {
                const validatedData = schema.response.parse(response.data);
                return {
                    ...response,
                    data: validatedData
                };
            } catch (error) {
                console.error('Response validation error:', error);

                if (error instanceof z.ZodError) {
                    const formattedErrors = error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }));

                    return createErrorResponse('Invalid response data', {
                        name: 'ValidationError',
                        code: 'VALIDATION_ERROR',
                        details: {
                            validationErrors: formattedErrors
                        }
                    });
                }

                return createErrorResponse('Invalid response data');
            }
        }

        return response;
    }

    /**
     * Executes a request with validation and error handling
     */
    protected async executeRequest<RequestT, ResponseT>({
        method,
        endpoint,
        data,
        params,
        schema,
        options
    }: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        endpoint: string;
        data?: RequestT;
        params?: Record<string, string>;
        schema?: ApiValidationSchema<RequestT, ResponseT>;
        options?: any;
    }): Promise<ApiResponse<ResponseT>> {
        try {
            // Validate request data if schema provided
            const validatedData = schema?.request && data
                ? await this.validate(schema, data)
                : data;

            // Execute request based on method
            let response: ApiResponse<ResponseT>;

            switch (method) {
                case 'GET':
                    response = await this.client.get<ResponseT>(endpoint, params, options);
                    break;
                case 'POST':
                    response = await this.client.post<ResponseT>(endpoint, validatedData, options);
                    break;
                case 'PUT':
                    response = await this.client.put<ResponseT>(endpoint, validatedData, options);
                    break;
                case 'DELETE':
                    response = await this.client.delete<ResponseT>(endpoint, options);
                    break;
                case 'PATCH':
                    response = await this.client.patch<ResponseT>(endpoint, validatedData, options);
                    break;
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }

            // Validate response if schema provided
            return this.validateResponse(response, schema);

        } catch (error) {
            console.error(`API ${method} request failed:`, error);
            return createErrorResponse(this.handleError(error));
        }
    }
} 