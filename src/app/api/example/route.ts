import { NextRequest } from "next/server";
import { ApiClient } from '@/lib/api/client';
import { ApiMiddleware } from '@/lib/api/middleware';
import { createRateLimitMiddleware } from '@/lib/api/middlewares/ratelimit';
import { RateLimitClient } from '@/lib/ratelimit/client';
import { CachedRateLimitClient } from '@/lib/ratelimit/cache';
import prisma from '@root/prisma/database';
import { successResponse, errors } from "@/lib/api/responses";
import { validateQuery } from "@/lib/api/validation";
import { z } from "zod";

// Create API client instance
const api = new ApiClient(prisma);

// Query parameters schema
const querySchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    per_page: z.coerce.number().min(1).max(100).default(30)
});

// Example middleware that adds request timing
const withTiming: ApiMiddleware = (handler) => async (context) => {
    const start = Date.now();
    const response = await handler(context);
    const duration = Date.now() - start;

    // Add timing header to the response
    response.headers.set('X-Response-Time', `${duration}ms`);
    return response;
};

// Configure rate limiting
const rateLimitClient = new RateLimitClient({
    defaultRule: {
        limit: 100,
        window: 3600, // 1 hour
        blockFor: 300, // 5 minutes
        tokenLimit: 1000,
        tokenWindow: 3600
    },
    rules: [
        {
            // Higher limit for GET requests
            method: 'GET',
            limit: 200,
            window: 3600
        },
        {
            // Lower limit for POST requests
            method: 'POST',
            limit: 50,
            window: 3600
        }
    ]
});

// Add cache layer to reduce database hits
const cachedRateLimiter = new CachedRateLimitClient(rateLimitClient, {
    ttl: 5000 // 5 seconds cache
});

// Create rate limit middleware
const withRateLimit = createRateLimitMiddleware(cachedRateLimiter, {
    includeHeaders: true
});

// Add middlewares to the API client
api.use(withTiming);
api.use(withRateLimit);

export async function GET(req: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { q: query, page, per_page: perPage } = validation.data;

        // Create context and handle request with middleware
        const context = api.createContext(req);
        const handler = api.handler(async () => {
            return successResponse({
                query,
                page,
                perPage,
                timestamp: new Date().toISOString()
            }, 'Example endpoint response');
        });

        return handler(context);
    } catch (err: any) {
        console.error("Error processing request:", err);
        return errors.internal(err.message);
    }
}

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();

        // Create context and handle request with middleware
        const context = api.createContext(req);
        const handler = api.handler(async () => {
            return successResponse({
                data: body,
                timestamp: new Date().toISOString()
            }, 'Data received successfully');
        });

        return handler(context);
    } catch (err: any) {
        console.error("Error processing request:", err);
        return errors.badRequest(err.message);
    }
}