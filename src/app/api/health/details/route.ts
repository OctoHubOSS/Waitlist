import { NextRequest } from "next/server";
import prisma from '@root/prisma/database';
import { ApiClient } from '@/lib/api/client';
import { withAuth } from '@/lib/api/middlewares/auth';
import { errors, handleApiError, successResponse } from "@/lib/api/responses";

// Create API client instance
const api = new ApiClient(prisma);

/**
 * Detailed health check endpoint for administrators
 * GET /api/health/details - Returns detailed system health metrics
 */
export async function GET(req: NextRequest) {
    try {
        return api.handler(withAuth(async (context) => {
            // Check if user has admin permission
            const { user } = context.data.auth;
            
            if (!user.isAdmin) {
                return errors.forbidden("Administrators only");
            }
            
            const startTime = Date.now();
            
            // Get basic system information
            const systemInfo = {
                platform: process.platform,
                arch: process.arch,
                cpus: require('os').cpus(),
                totalMemory: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)} GB`,
                freeMemory: `${Math.round(require('os').freemem() / 1024 / 1024 / 1024)} GB`,
                uptime: process.uptime(),
                processMemory: process.memoryUsage(),
                nodeVersion: process.version,
                env: process.env.NODE_ENV
            };
            
            // Run database diagnostics
            const dbStats = {};
            let dbStatus = true;
            let dbError = null;
            
            try {
                // Count number of users
                const userCount = await prisma.user.count();
                
                // Count number of repositories
                const repoCount = await prisma.repository.count();
                
                // Count number of organizations
                const orgCount = await prisma.organization.count();
                
                // Get active users in last 24 hours
                const activeUsers = await prisma.user.count({
                    where: {
                        lastActiveAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }
                });
                
                // Get API statistics
                const apiTokenCount = await prisma.apiToken.count();
                
                Object.assign(dbStats, {
                    userCount,
                    repoCount,
                    orgCount,
                    activeUsers,
                    apiTokenCount
                });
            } catch (error) {
                dbStatus = false;
                dbError = error instanceof Error ? error.message : "Unknown database error";
            }
            
            // Get storage statistics
            const storageStats = {
                // This would be where you'd add your storage metrics
                // like S3 usage, file counts, etc.
                totalStorageEstimate: "Unknown" // Replace with actual storage stats if available
            };
            
            // Check rate limiting status
            const rateLimitStats = {
                // This is where you'd add rate limit statistics
                // from your database
                activeRateLimits: "Unknown" // Replace with actual stats
            };
            
            // Build full response
            const healthData = {
                status: dbStatus ? "healthy" : "degraded",
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`,
                system: systemInfo,
                database: {
                    status: dbStatus ? "up" : "down",
                    error: dbError,
                    statistics: dbStats
                },
                storage: storageStats,
                rateLimit: rateLimitStats,
                request: {
                    method: req.method,
                    path: req.nextUrl.pathname,
                    userAgent: req.headers.get('user-agent'),
                    ip: req.headers.get('x-forwarded-for') || 'unknown'
                }
            };

            return successResponse(healthData, "Detailed system health report");
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}
