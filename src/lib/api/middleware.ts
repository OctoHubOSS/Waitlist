import { NextRequest } from 'next/server';
import { ApiMiddleware, ApiRequest, ApiResponse } from './types';
import { AuditLogger, AuditAction, AuditStatus } from '@/lib/audit/logger';
import { getClientIp } from '../client/ip';
import { z } from 'zod';
import { ERROR_CODES, ERROR_MESSAGES, RATE_LIMITS, HTTP_METHODS } from './constants';

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
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: ERROR_MESSAGES.VALIDATION_ERROR,
                    details: {
                        validationErrors: formattedErrors
                    }
                };
            } else {
                res.error = {
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: ERROR_MESSAGES.VALIDATION_ERROR,
                    details: error instanceof Error ? error.message : String(error)
                };
            }
        }
    };
}

/**
 * Middleware to log API requests
 */
export function logRequest(level: AuditAction = AuditAction.SYSTEM_WARNING): ApiMiddleware {
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        const start = Date.now();
        const requestId = crypto.randomUUID ? crypto.randomUUID() : 
            `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
            
        // Add request ID to response headers for tracking
        (res as any).headers = {
            ...(res as any).headers || {},
            'X-Request-ID': requestId
        };
        
        try {
            await next();
        } finally {
            const duration = Date.now() - start;
            const status = res.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE;
            
            await AuditLogger.logSystem(
                level,
                status,
                {
                    requestId,
                    path: req.path,
                    method: req.method,
                    duration,
                    ip: getClientIp(req as any),
                    status: res.success ? 200 : 400,
                    params: req.params,
                    error: !res.success ? res.error : undefined
                }
            );
        }
    };
}

/**
 * Middleware to handle rate limiting with a memory store
 */
export function rateLimit(options: {
    limit?: number;
    windowMs?: number;
    keyGenerator?: (req: ApiRequest) => string;
    message?: string;
    headers?: boolean;
}): ApiMiddleware {
    const {
        limit = RATE_LIMITS.DEFAULT,
        windowMs = 60000, // 1 minute
        keyGenerator = (req) => getClientIp(req as any),
        message = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        headers = true
    } = options;
    
    const requests = new Map<string, number[]>();
    
    // Clean up old requests periodically to prevent memory leaks
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        for (const [key, timestamps] of requests.entries()) {
            const recentRequests = timestamps.filter(time => time > windowStart);
            
            if (recentRequests.length === 0) {
                requests.delete(key);
            } else {
                requests.set(key, recentRequests);
            }
        }
    }, windowMs);
    
    // Ensure cleanup interval is cleared when the server shuts down
    if (typeof process !== 'undefined') {
        process.on('SIGTERM', () => clearInterval(cleanupInterval));
        process.on('SIGINT', () => clearInterval(cleanupInterval));
    }

    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get existing requests for this key
        const keyRequests = requests.get(key) || [];

        // Remove old requests
        const recentRequests = keyRequests.filter(time => time > windowStart);

        // Check if rate limit is exceeded
        if (recentRequests.length >= limit) {
            res.success = false;
            res.error = {
                code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
                message,
            };
            
            if (headers) {
                const resetTime = Math.ceil((windowStart + windowMs) / 1000);
                
                (res as any).headers = {
                    ...(res as any).headers || {},
                    'Retry-After': Math.ceil(windowMs / 1000).toString(),
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': resetTime.toString()
                };
            }
            
            return;
        }

        // Add current request
        recentRequests.push(now);
        requests.set(key, recentRequests);
        
        // Add rate limit headers
        if (headers) {
            const remaining = Math.max(0, limit - recentRequests.length);
            const resetTime = Math.ceil((windowStart + windowMs) / 1000);
            
            (res as any).headers = {
                ...(res as any).headers || {},
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': resetTime.toString()
            };
        }

        await next();
    };
}

/**
 * Middleware to handle authentication
 */
export function requireAuth(options: {
    redirectUrl?: string;
    errorMessage?: string;
} = {}): ApiMiddleware {
    const {
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED
    } = options;
    
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        const session = (req as any).session;

        if (!session?.user) {
            res.success = false;
            res.error = {
                code: ERROR_CODES.UNAUTHORIZED,
                message: errorMessage,
            };
            return;
        }

        await next();
    };
}

/**
 * Middleware to handle CORS
 */
export function cors(options: {
    origin?: string | string[] | boolean;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
} = {}): ApiMiddleware {
    const {
        origin = '*',
        methods = [
            HTTP_METHODS.GET, 
            HTTP_METHODS.POST, 
            HTTP_METHODS.PUT, 
            HTTP_METHODS.DELETE, 
            HTTP_METHODS.PATCH, 
            HTTP_METHODS.OPTIONS
        ],
        allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders = [],
        credentials = true,
        maxAge = 86400 // 24 hours
    } = options;
    
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        // Set CORS headers
        const headers: Record<string, string> = {
            'Access-Control-Allow-Methods': methods.join(', '),
            'Access-Control-Allow-Headers': allowedHeaders.join(', '),
            'Access-Control-Max-Age': maxAge.toString()
        };
        
        // Handle origin
        if (origin === '*') {
            headers['Access-Control-Allow-Origin'] = '*';
        } else if (typeof origin === 'string') {
            headers['Access-Control-Allow-Origin'] = origin;
            headers['Vary'] = 'Origin';
        } else if (Array.isArray(origin)) {
            const requestOrigin = (req as any).headers?.origin;
            if (requestOrigin && origin.includes(requestOrigin)) {
                headers['Access-Control-Allow-Origin'] = requestOrigin;
            }
            headers['Vary'] = 'Origin';
        }
        
        // Handle credentials
        if (credentials) {
            headers['Access-Control-Allow-Credentials'] = 'true';
        }
        
        // Handle exposed headers
        if (exposedHeaders.length > 0) {
            headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ');
        }
        
        // Add headers to response
        (res as any).headers = {
            ...(res as any).headers || {},
            ...headers
        };
        
        // Handle preflight requests - using string comparison instead of enum
        // to avoid TypeScript type mismatch
        if (req.method.toUpperCase() === 'OPTIONS') {
            res.success = true;
            return;
        }

        await next();
    };
}

/**
 * Middleware to handle errors
 */
export function errorHandler(): ApiMiddleware {
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        try {
            await next();
        } catch (error) {
            console.error('API error:', error);
            
            res.success = false;
            
            if (error instanceof Error) {
                res.error = {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                    details: {
                        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
                    }
                };
            } else {
                res.error = {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                };
            }
            
            // Log the error
            await AuditLogger.logSystem(
                AuditAction.SYSTEM_ERROR,
                AuditStatus.FAILURE,
                {
                    path: req.path,
                    method: req.method,
                    error: error instanceof Error ? 
                        { message: error.message, stack: error.stack } : 
                        String(error)
                }
            );
        }
    };
}

/**
 * Middleware to handle request timeout
 */
export function timeout(ms: number): ApiMiddleware {
    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        // Initialize timeout ID before use
        let timeoutId: NodeJS.Timeout | undefined = undefined;
        let timedOut = false;
        
        const timeoutPromise = new Promise<void>((_, reject) => {
            timeoutId = setTimeout(() => {
                timedOut = true;
                reject(new Error(`Request timeout after ${ms}ms`));
            }, ms);
        });
        
        try {
            await Promise.race([next(), timeoutPromise]);
        } catch (error) {
            if (timedOut) {
                res.success = false;
                res.error = {
                    code: ERROR_CODES.REQUEST_TIMEOUT,
                    message: `Request timed out after ${ms}ms`,
                };
            } else {
                throw error;
            }
        } finally {
            // Clear timeout only if it was set
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }
    };
}