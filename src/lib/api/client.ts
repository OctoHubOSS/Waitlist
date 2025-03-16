import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { ApiContext, ApiMiddleware, NextApiHandler, withMiddlewares } from './middleware';
import { createRateLimitMiddleware } from './middlewares/ratelimit';
import { RateLimitClient } from '../ratelimit/client';
import { CachedRateLimitClient } from '../ratelimit/cache';

export class ApiClient {
    private prisma: PrismaClient;
    private middlewares: ApiMiddleware[];
    private rateLimitClient: CachedRateLimitClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.middlewares = [];

        // Initialize rate limit client
        const baseRateLimitClient = new RateLimitClient(prisma, {
            defaultRule: {
                limit: 100,
                window: 60, // 1 minute
                blockFor: 60, // 1 minute block
                tokenLimit: 1000, // Higher limit for API tokens
                tokenWindow: 60
            },
            rules: [
                {
                    endpoint: '/api/search',
                    limit: 30,
                    window: 60,
                    tokenLimit: 300
                },
                {
                    method: 'POST',
                    limit: 30,
                    window: 60,
                    tokenLimit: 300
                }
            ]
        });

        this.rateLimitClient = new CachedRateLimitClient(baseRateLimitClient, {
            ttl: 2000 // 2 second cache
        });

        // Add default rate limit middleware
        this.use(createRateLimitMiddleware(this.rateLimitClient, {
            defaultRule: {
                limit: 100,
                window: 60
            },
            includeHeaders: true
        }));
    }

    /**
     * Add a middleware to the stack
     */
    use(middleware: ApiMiddleware): this {
        this.middlewares.push(middleware);
        return this;
    }

    /**
     * Create a route handler with all middlewares applied
     */
    handler(handler: NextApiHandler): NextApiHandler {
        return withMiddlewares(handler, ...this.middlewares);
    }

    /**
     * Create context for an API request
     */
    createContext(req: NextRequest, params?: Record<string, string>): ApiContext {
        return {
            req,
            params,
            searchParams: new URL(req.url).searchParams
        };
    }

    /**
     * Get the Prisma client
     */
    getPrisma(): PrismaClient {
        return this.prisma;
    }

    /**
     * Get the rate limit client
     */
    getRateLimitClient(): CachedRateLimitClient {
        return this.rateLimitClient;
    }
} 