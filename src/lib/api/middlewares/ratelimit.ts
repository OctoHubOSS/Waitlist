import { NextRequest, NextResponse } from 'next/server';
import { ApiMiddleware } from '../middleware';
import { CachedRateLimitClient } from '@/lib/ratelimit/cache';
import { RateLimitOptions } from '@/types/ratelimit';
import { getToken } from '@/lib/auth/token';

export interface RateLimitMiddlewareOptions extends RateLimitOptions {
    /**
     * Custom identifier function to determine rate limit key
     * Defaults to IP address for anonymous users and user ID for authenticated users
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
     * Headers to include in the response
     * Defaults to true
     */
    includeHeaders?: boolean;
}

/**
 * Create a rate limit middleware
 */
export function createRateLimitMiddleware(
    client: CachedRateLimitClient,
    options: RateLimitMiddlewareOptions
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
        const identifier = await (getIdentifier?.(req) ?? getDefaultIdentifier(req));

        // Get API token if present
        const token = await getToken(req) || undefined;

        // Check rate limit
        const result = await client.check({
            identifier,
            endpoint: includeEndpoint ? req.url : undefined,
            method: includeMethod ? req.method : undefined,
            token
        });

        // Add rate limit headers if enabled
        const response = await handler(context);
        if (includeHeaders) {
            const headers = new Headers(response.headers);
            headers.set('X-RateLimit-Limit', result.info.limit.toString());
            headers.set('X-RateLimit-Remaining', result.info.remaining.toString());
            headers.set('X-RateLimit-Reset', result.info.reset.toString());

            if (!result.success) {
                headers.set('Retry-After', (result.info.retryAfter ?? 60).toString());
                return new NextResponse(null, {
                    status: 429,
                    statusText: 'Too Many Requests',
                    headers
                });
            }

            return new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
        }

        // If headers disabled, just block if rate limited
        if (!result.success) {
            return new NextResponse(null, {
                status: 429,
                statusText: 'Too Many Requests'
            });
        }

        return response;
    };
}

/**
 * Default identifier function that uses IP address
 */
function getDefaultIdentifier(req: NextRequest): string {
    // Try to get IP from various headers
    const xff = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    // Use the first IP from x-forwarded-for, or x-real-ip, or default to localhost
    const ip = xff?.split(',')[0] ?? realIp ?? '127.0.0.1';
    return `ip:${ip}`;
} 