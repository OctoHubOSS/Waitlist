import { NextRequest } from "next/server";
import prisma from '@/lib/database';
import { CachedRateLimitClient } from '@/lib/ratelimit/cache';
import { RateLimitClient } from '@/lib/ratelimit/client';
import { ApiClient } from '@/lib/api/client';
import { handleApiError, successResponse } from "@/lib/api/responses";
import { headers } from 'next/headers';

// Create API client instance
const api = new ApiClient(prisma);

/**
 * Simple health check endpoint for monitoring
 * GET /api/health - Returns overall system health status
 */
export async function GET(req: NextRequest) {
    // Record request received time at the very start
    const requestStartTime = performance.now();
    
    try {
        return api.handler(async (context) => {
            // Track handler start time - this is after middleware processing
            const handlerStartTime = performance.now();
            
            // Default status is 200 OK, will change to 503 if any critical service is down
            let statusCode = 200;
            let dbStatus = true;
            let dbResponseTime = 0;
            let dbError = null;
            
            // Check database health with a simple query
            try {
                const dbStartTime = performance.now();
                await prisma.$queryRaw`SELECT 1`;
                dbResponseTime = Math.round(performance.now() - dbStartTime);
            } catch (error) {
                dbStatus = false;
                dbError = error instanceof Error ? error.message : "Unknown database error";
                statusCode = 503; // Service Unavailable if DB is down
            }
            
            // Test rate limiter to ensure it's functional
            let rateLimitStatus = true;
            let rateLimitError = null;
            try {
                // Create a test rate limit client
                const rateLimitClient = new RateLimitClient({
                    defaultRule: { limit: 100, window: 60 }
                });
                const cachedClient = new CachedRateLimitClient(rateLimitClient);
                
                // Just initialize the client - no need to check for health check endpoint
                rateLimitStatus = !!cachedClient;
            } catch (error) {
                rateLimitStatus = false;
                rateLimitError = error instanceof Error ? error.message : "Unknown rate limit error";
            }
            
            // Get system memory status
            const memoryUsage = process.memoryUsage();
            
            // Calculate processing times
            const handlerProcessingTime = Math.round(performance.now() - handlerStartTime);
            const totalProcessingTime = Math.round(performance.now() - requestStartTime);
            const middlewareTime = Math.round(handlerStartTime - requestStartTime);
            
            // Build the health response
            const healthData = {
                status: statusCode === 200 ? "healthy" : "unhealthy",
                version: process.env.npm_package_version || "unknown",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
                services: {
                    database: {
                        status: dbStatus ? "up" : "down",
                        responseTime: `${dbResponseTime}ms`,
                        error: dbError
                    },
                    rateLimit: {
                        status: rateLimitStatus ? "up" : "down",
                        error: rateLimitError
                    }
                },
                system: {
                    memory: {
                        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
                    },
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version
                },
                timing: {
                    middleware: `${middlewareTime}ms`,
                    handler: `${handlerProcessingTime}ms`,
                    total: `${totalProcessingTime}ms`,
                },
                requestInfo: {
                    method: req.method,
                    path: req.nextUrl.pathname,
                    userAgent: req.headers.get('user-agent'),
                }
            };

            // Get server timing header if available
            const headersList = headers();
            const serverTiming = headersList.get('server-timing');
            if (serverTiming) {
                healthData.timing.serverHeader = serverTiming;
            }

            // Use performance.mark to enable server-timing headers
            performance.mark('health-check-end');

            // Return response with appropriate status code
            return successResponse(healthData, "System health status", statusCode);
        })(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}
