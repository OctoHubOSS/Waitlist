import { ApiService, ApiConfig, ApiResponse, ApiError, ApiValidationSchema, User, CreateUserRequest, UpdateUserRequest, LoginRequest, RegisterRequest, AuthResponse, EmailVerificationRequest, PasswordResetRequest, WelcomeEmailRequest, WaitlistResponse, SubscribeRequest, UnsubscribeRequest } from './types';
import { createApiClient } from './client';
import { successResponse, errorResponse } from './utils';
import { z } from 'zod';

/**
 * Base API service class
 */
export class BaseApiService implements ApiService {
    public client;

    constructor(config: ApiConfig) {
        this.client = createApiClient(config);
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
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
                details: {
                    stack: error.stack
                }
            };
        }
        
        if (typeof error === 'object' && error !== null) {
            return {
                code: error.code || 'INTERNAL_SERVER_ERROR',
                message: error.message || 'An unknown error occurred',
                details: error.details || error
            };
        }
        
        return {
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
                    
                    return errorResponse('Invalid response data', {
                        code: 'VALIDATION_ERROR',
                        details: {
                            validationErrors: formattedErrors
                        }
                    });
                }
                
                return errorResponse('Invalid response data');
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
            return errorResponse(this.handleError(error));
        }
    }
}

/**
 * Creates a new API service instance
 */
export function createApiService<T extends ApiService>(
    ServiceClass: new (config: ApiConfig) => T,
    config: ApiConfig
): T {
    return new ServiceClass(config);
}

/**
 * User service implementation
 */
export class UserService extends BaseApiService {
    /**
     * Gets a user by ID
     */
    async getUser(id: string): Promise<ApiResponse<User>> {
        return this.executeRequest({
            method: 'GET',
            endpoint: `/users/${id}`
        });
    }

    /**
     * Updates a user
     */
    async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
        return this.executeRequest({
            method: 'PUT',
            endpoint: `/users/${id}`,
            data
        });
    }

    /**
     * Deletes a user
     */
    async deleteUser(id: string): Promise<ApiResponse<void>> {
        return this.executeRequest({
            method: 'DELETE',
            endpoint: `/users/${id}`
        });
    }
}

/**
 * Auth service implementation
 */
export class AuthService extends BaseApiService {
    /**
     * Logs in a user
     */
    async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/auth/login',
            data
        });
    }

    /**
     * Logs out a user
     */
    async logout(): Promise<ApiResponse<void>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/auth/logout'
        });
    }

    /**
     * Registers a new user
     */
    async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/auth/register',
            data
        });
    }
}

/**
 * Email service implementation
 */
export class EmailService extends BaseApiService {
    /**
     * Sends a verification email
     */
    async sendVerification(data: EmailVerificationRequest): Promise<ApiResponse<void>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/email/verify',
            data
        });
    }

    /**
     * Sends a password reset email
     */
    async sendPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<void>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/email/reset-password',
            data
        });
    }

    /**
     * Sends a welcome email
     */
    async sendWelcome(data: WelcomeEmailRequest): Promise<ApiResponse<void>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/email/welcome',
            data
        });
    }
}

/**
 * Waitlist service implementation
 */
export class WaitlistService extends BaseApiService {
    /**
     * Subscribes a user to the waitlist
     */
    async subscribe(data: SubscribeRequest): Promise<ApiResponse<WaitlistResponse>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/api/waitlist/subscribe',
            data
        });
    }

    /**
     * Unsubscribes a user from the waitlist
     */
    async unsubscribe(data: UnsubscribeRequest): Promise<ApiResponse<WaitlistResponse>> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/api/waitlist/unsubscribe',
            data
        });
    }
}