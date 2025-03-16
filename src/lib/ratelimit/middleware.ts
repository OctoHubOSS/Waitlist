import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { RateLimitClient } from './client';
import { RateLimitOptions } from '@/types/ratelimit';
import { getToken } from '@/lib/auth/token';

/**
 * Create a middleware function for rate limiting
 */
export function createRateLimitMiddleware(prisma: PrismaClient, options: RateLimitOptions) {
    const rateLimiter = new RateLimitClient(prisma, options);

    return async function rateLimitMiddleware(req: NextRequest) {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const path = req.nextUrl.pathname;
        const method = req.method;

        // Try to get API token
        const token = await getToken(req);

        // Check rate limit
        const result = await rateLimiter.check({
            identifier: token ? `token:${token.id}` : `ip:${ip}`,
            token: token || undefined,
            endpoint: path,
            method,
        });

        // Create response headers
        const responseHeaders: Record<string, string> = {
            'X-RateLimit-Limit': result.info.limit.toString(),
            'X-RateLimit-Remaining': result.info.remaining.toString(),
            'X-RateLimit-Reset': result.info.reset.toString(),
        };

        // If blocked, add Retry-After header
        if (result.info.retryAfter) {
            responseHeaders['Retry-After'] = result.info.retryAfter.toString();
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
        const response = NextResponse.next();

        // Add rate limit headers to response
        Object.entries(responseHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    };
} 