import { NextRequest, NextResponse } from 'next/server';
import { ApiMiddleware } from '../middleware';
import { RateLimitClient } from '@/lib/ratelimit/client';
import { CachedRateLimitClient } from '@/lib/ratelimit/cache';
import { RateLimitContext } from '@/types/ratelimit';
import { getToken } from '@/lib/auth/token';

// Type for both types of rate limit clients
type RateLimitClientType = RateLimitClient | CachedRateLimitClient;

export interface RateLimitMiddlewareOptions {
    /**
     * Custom identifier function to determine rate limit key
     * Defaults to IP address for anonymous users
     */
    getIdentifier?: (req: NextRequest) => string | Promise<string>;

    /**
     * Whether to include the current endpoint in rate limit key
     * Defaults to true
     */
    includeEndpoint?: boolean;

    /**
     * Whether to include the HTTP method in rate limit key
     * Defaults to true
     */
    includeMethod?: boolean;

    /**
     * Whether to include rate limit headers in the response
     * Defaults to true
     */
    includeHeaders?: boolean;
}

/**
 * Create a middleware function for API rate limiting
 * This is a thin wrapper around the core RateLimitClient implementation
 */
export function createRateLimitMiddleware(
    rateLimiter: RateLimitClientType,
    options: RateLimitMiddlewareOptions = {}
): ApiMiddleware {
    const {
        getIdentifier,
        includeEndpoint = true,
        includeMethod = true,
        includeHeaders = true
    } = options;

    return (handler) => async (context) => {
        const { req } = context;
        
        // Get identifier (IP address or custom)
        const identifier = await (getIdentifier ? 
            getIdentifier(req) : 
            getDefaultIdentifier(req));
        
        const path = req.nextUrl.pathname;
        const method = req.method;

        // Try to get API token
        const token = await getToken(req);

        // Create context for rate limit check
        const rateLimitContext: RateLimitContext = {
            identifier,
            token: token || undefined,
            endpoint: includeEndpoint ? path : undefined,
            method: includeMethod ? method : undefined,
        };

        // Check rate limit using the client
        const result = await rateLimiter.check(rateLimitContext);

        // Create response headers
        const responseHeaders: Record<string, string> = {};
        
        if (includeHeaders) {
            responseHeaders['X-RateLimit-Limit'] = result.info.limit.toString();
            responseHeaders['X-RateLimit-Remaining'] = result.info.remaining.toString();
            responseHeaders['X-RateLimit-Reset'] = result.info.reset.toString();
            
            if (result.info.retryAfter) {
                responseHeaders['Retry-After'] = result.info.retryAfter.toString();
            }
        }

        // If rate limit exceeded, return 429 Too Many Requests
        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded',
                    retryAfter: result.info.retryAfter,
                },
                {
                    status: 429,
                    headers: responseHeaders,
                }
            );
        }

        // Continue with the request
        const response = await handler(context);
        
        // Add rate limit headers to response if enabled
        if (includeHeaders) {
            Object.entries(responseHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
        }

        return response;
    };
}

/**
 * Default identifier function that uses IP address
 */
function getDefaultIdentifier(req: NextRequest): string {
    // Safely check if headers exists
    if (!req?.headers) {
        return 'ip:unknown';
    }

    // Try to get IP from various headers
    const xff = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    // Use the first IP from x-forwarded-for, or x-real-ip, or default to unknown
    const ip = xff ? xff.split(',')[0].trim() : (realIp || 'unknown');
    
    return `ip:${ip}`;
}