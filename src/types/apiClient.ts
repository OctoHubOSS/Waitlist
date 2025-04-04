import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AuditAction, AuditStatus } from './auditLogs';

/**
 * Extended NextRequest interface for Edge Runtime features
 * This allows us to access runtime properties that aren't in the NextRequest type
 */
export interface ExtendedNextRequest extends NextRequest {
    // Properties available in edge runtime
    ip?: string;
    geo?: {
        country?: string;
        city?: string;
        region?: string;
        latitude?: string;
        longitude?: string;
    };
}

/**
 * Extended client info interface with debug headers
 */
export interface DebugClientInfo {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    referer?: string;
    origin?: string;
    language?: string;
    timestamp: string;
    isBot?: boolean;
    debugHeaders?: Record<string, string>;
    [key: string]: any;
}

/**
 * Edge runtime information from NextRequest
 */
export interface EdgeRuntimeInfo {
    name?: string;
    region?: string;
    requestRegion?: string;
}

/**
 * Flexible header types to cover different request structures
 */
export type RequestHeaders =
    | Headers
    | { get?: (name: string) => string | null }
    | Record<string, string | string[] | null | undefined>;

/**
 * Common request object that works across different runtimes
 */
export interface CommonRequest {
    url: string;
    headers: RequestHeaders;
    method: string;
    ip?: string;
    geo?: any;
    cookies?: any;
    nextUrl?: URL;
    body?: any;
}

/**
 * API request interface
 */
export interface ApiRequest<T = any> extends CommonRequest {
    path: string;
    data?: T;
    params?: Record<string, string>;
    query?: Record<string, string>;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    status?: number;
    headers?: Record<string, string>;
}

/**
 * API error interface
 */
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    statusCode?: number;
}

/**
 * Validation schema interface
 */
export interface ApiValidationSchema<T = any, R = any> {
    request?: z.ZodType<T>;
    response?: z.ZodType<R>;
}

/**
 * Middleware type
 */
export type ApiMiddleware = (
    req: ApiRequest,
    res: ApiResponse,
    next: () => Promise<void>
) => Promise<void>;

/**
 * Route handler type
 */
export type ApiHandler<T = any, R = any> = (request: ApiRequest<T>) => Promise<ApiResponse<R>>;

/**
 * Route configuration
 */
export interface RouteConfig<T = any, R = any> {
    path?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    schema?: ApiValidationSchema<T>;
    middleware?: ApiMiddleware[];
    auditAction?: AuditAction;
    requireAuth?: boolean;
    rateLimit?: {
        limit?: number;
        windowMs?: number;
    };
    timeout?: number;
    cache?: {
        enabled?: boolean;
        ttl?: number;
        key?: string;
    };
}

/**
 * API configuration
 */
export interface ApiConfig {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
    auth?: {
        token?: string;
        type?: 'Bearer' | 'Basic';
    };
    retry?: {
        attempts?: number;
        delay?: number;
    };
    cache?: {
        enabled?: boolean;
        ttl?: number;
    };
    useSession?: boolean;
    retries?: number;
    retryDelay?: number;
}

/**
 * Validation result types
 */
export type ValidationSuccess<T> = {
    success: true;
    data: T;
    error?: never;
};

export type ValidationErrorResult = {
    success: false;
    data?: never;
    error: {
        message: string;
        details: z.ZodError | any;
    };
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationErrorResult;

/**
 * Error classes
 */
export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: any,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, details?: any) {
        super('VALIDATION_ERROR', message, details);
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Unauthorized') {
        super('AUTHENTICATION_ERROR', message, undefined, 401);
    }
}

export class AuthorizationError extends ApiError {
    constructor(message: string = 'Forbidden') {
        super('AUTHORIZATION_ERROR', message, undefined, 403);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Not Found') {
        super('NOT_FOUND', message, undefined, 404);
    }
}

export class RateLimitError extends ApiError {
    constructor(message: string = 'Too Many Requests') {
        super('RATE_LIMIT_EXCEEDED', message, undefined, 429);
    }
}

export class InternalError extends ApiError {
    constructor(message: string = 'Internal Server Error') {
        super('INTERNAL_ERROR', message, undefined, 500);
    }
}

/**
 * API client configuration
 */
export interface ApiClientConfig extends ApiConfig {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    requestInterceptor?: (options: RequestInit) => Promise<RequestInit>;
    responseInterceptor?: (response: Response) => Promise<Response>;
    errorInterceptor?: (error: any) => Promise<any>;
}

/**
 * API client interface
 */
export interface ApiClient {
    config: ApiClientConfig;
    getBaseUrl(): string;
    get<T = any>(path: string, params?: Record<string, string>, options?: RequestOptions): Promise<ApiResponse<T>>;
    post<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    put<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    delete<T = any>(path: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    patch<T = any>(path: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
}

/**
 * Request cache interface
 */
export interface RequestCache {
    data: any;
    timestamp: number;
}

/**
 * Request options interface
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retry?: boolean;
    retryCount?: number;
    retryDelay?: number;
    cache?: {
        enabled: boolean;
        ttl?: number;
    };
    fetchOptions?: RequestInit;
}

/**
 * Request parameters interface
 */
export interface RequestParams {
    method: string;
    path: string;
    data?: any;
    params?: Record<string, string>;
    options?: RequestOptions;
}

/**
 * API service interface
 */
export interface ApiService {
    client: any; // We'll use any here since the client type is complex
    validate<T = any>(schema: ApiValidationSchema<T>, data: any): Promise<T>;
    handleError(error: any): ApiError;
}
