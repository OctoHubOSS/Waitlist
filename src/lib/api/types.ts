import { z } from 'zod';

/**
 * Base API response type
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

/**
 * Base API error type
 */
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    statusCode?: number;
    responseData?: any;
}

/**
 * Base API request type
 */
export interface ApiRequest<T = any> {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: T;
    params?: Record<string, string>;
    headers?: Record<string, string>;
}

/**
 * Base API validation schema
 */
export interface ApiValidationSchema<T = any, R = any> {
    request?: z.ZodType<T>;
    response?: z.ZodType<R>;
}

/**
 * Base API handler type
 */
export type ApiHandler<T = any, R = any> = (
    req: ApiRequest<T>,
    res: ApiResponse<R>
) => Promise<ApiResponse<R>>;

/**
 * Base API middleware type
 */
export type ApiMiddleware = (
    req: ApiRequest,
    res: ApiResponse,
    next: () => Promise<void>
) => Promise<void>;

/**
 * Base API config type
 */
export interface ApiConfig {
    baseUrl: string;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    apiKey?: string;
    useSession?: boolean; // Add option to control session handling
    requestInterceptor?: (config: any) => any | Promise<any>;
    responseInterceptor?: (response: any) => any | Promise<any>;
    errorInterceptor?: (error: any) => any | Promise<any>;
}

/**
 * Base API client type
 */
export interface ApiClient {
    config: ApiConfig;
    getBaseUrl(): string;
    get<T = any>(endpoint: string, params?: Record<string, string>, options?: any): Promise<ApiResponse<T>>;
    post<T = any>(endpoint: string, data?: any, options?: any): Promise<ApiResponse<T>>;
    put<T = any>(endpoint: string, data?: any, options?: any): Promise<ApiResponse<T>>;
    delete<T = any>(endpoint: string, options?: any): Promise<ApiResponse<T>>;
    patch<T = any>(endpoint: string, data?: any, options?: any): Promise<ApiResponse<T>>;
}

/**
 * Base API service type
 */
export interface ApiService {
    client: ApiClient;
    validate<T = any>(schema: ApiValidationSchema<T>, data: any): Promise<T>;
    handleError(error: any): ApiError;
}

/**
 * Base API route type
 */
export interface ApiRoute<T = any, R = any> {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    handler: ApiHandler<T, R>;
    middleware?: ApiMiddleware[];
    validation?: ApiValidationSchema<T>;
}

/**
 * Base API router type
 */
export interface ApiRouter {
    routes: ApiRoute[];
    addRoute<T = any, R = any>(route: ApiRoute<T, R>): void;
    removeRoute(path: string): void;
    getRoute(path: string): ApiRoute | undefined;
    handle(req: ApiRequest, res: ApiResponse): Promise<void>;
}

/**
 * User data types
 */
export interface User {
    id: string;
    email: string;
    name: string;
    displayName?: string;
    status: 'active' | 'inactive' | 'pending';
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    displayName?: string;
}

export interface UpdateUserRequest {
    name?: string;
    displayName?: string;
    status?: User['status'];
}

/**
 * Auth data types
 */
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends CreateUserRequest {
    confirmPassword: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

/**
 * Email data types
 */
export interface EmailVerificationRequest {
    email: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface WelcomeEmailRequest {
    email: string;
    name: string;
}

/**
 * Waitlist data types
 */
export interface WaitlistSubscriber {
    id: string;
    email: string;
    name: string | null;
    status: WaitlistStatus;
    createdAt: string;
    updatedAt: string;
}

export type WaitlistStatus = 'SUBSCRIBED' | 'INVITED' | 'REGISTERED' | 'REJECTED';

export interface SubscribeRequest {
    email: string;
    name?: string;
}

export interface UnsubscribeRequest {
    email: string;
}

export interface WaitlistResponse {
    status: WaitlistStatus;
    subscriber?: WaitlistSubscriber;
}

/**
 * Request result type for handling responses
 */
export interface RequestResult<T> {
    data?: T;
    error?: ApiError;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    isJson: boolean;
    rawBody?: string;
}