import { ApiMiddleware, ApiRequest, ApiResponse } from '@/types/apiClient';
import { ERROR_CODES, ERROR_MESSAGES, RATE_LIMITS } from '../constants';

// Store rate limit data in memory
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit data periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Middleware to limit the number of requests from a client
 */
export function rateLimit(options: {
    limit?: number;
    windowMs?: number;
    keyGenerator?: (req: ApiRequest) => string;
    message?: string;
    headers?: boolean;
} = {}): ApiMiddleware {
    const {
        limit = RATE_LIMITS.DEFAULT,
        windowMs = 60000, // 1 minute
        keyGenerator = (req: ApiRequest) => req.ip || 'unknown',
        message = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        headers = true
    } = options;

    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        const key = keyGenerator(req);
        const now = Date.now();
        const resetTime = now + windowMs;

        // Get or initialize rate limit data
        const rateLimitData = rateLimitStore.get(key) || { count: 0, resetTime };
        rateLimitData.count++;

        // Check if limit exceeded
        if (rateLimitData.count > limit) {
            res.success = false;
            res.error = {
                name: 'RateLimitError',
                code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
                message,
                statusCode: 429
            };

            if (headers) {
                res.headers = {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitData.resetTime.toString()
                };
            }

            return;
        }

        // Update rate limit data
        rateLimitStore.set(key, rateLimitData);

        if (headers) {
            res.headers = {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': (limit - rateLimitData.count).toString(),
                'X-RateLimit-Reset': rateLimitData.resetTime.toString()
            };
        }

        await next();
    };
} 