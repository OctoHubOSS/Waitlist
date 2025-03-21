import { NextRequest } from "next/server";
import prisma from "@root/prisma/database";
import { ApiClient } from '@/lib/api/client';
import { withAuth } from '@/lib/api/middlewares/auth';
import { handleApiError, successResponse } from "@/lib/api/responses";

// Create API client instance
const api = new ApiClient(prisma);

/**
 * GET /api/v1/analytics - Get an overview of system-wide analytics
 * This endpoint requires authentication and provides a summary of key metrics
 */
export async function GET(req: NextRequest) {
    try {
        return api.handler(withAuth(async (context) => {
            const { user } = context.data.auth;
            
            // Only admin users can access system-wide analytics
            if (!user.isAdmin) {
                return successResponse({
                    message: "Use a specific analytics endpoint to access your own analytics data",
                    availableEndpoints: [
                        "/api/v1/analytics/user",
                        "/api/v1/analytics/repositories",
                        "/api/v1/analytics/search"
                    ]
                }, "Analytics endpoints");
            }

            // Get current date for time calculations
            const now = new Date();
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Get platform statistics
            const platformStats = await prisma.platformStats.findFirst({
                where: {
                    period: 'DAILY',
                },
                orderBy: {
                    timestamp: 'desc'
                }
            });

            // Get search analytics
            const searchAnalytics = await prisma.searchAnalytics.findFirst({
                where: {
                    period: 'DAILY',
                },
                orderBy: {
                    timestamp: 'desc'
                }
            });

            // Get trending repositories
            const trendingRepos = await prisma.trendingEntity.findMany({
                where: {
                    type: 'REPOSITORY',
                    period: 'DAILY',
                },
                orderBy: {
                    score: 'desc'
                },
                take: 5,
                include: {
                    repository: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            language: true,
                            starCount: true,
                            forkCount: true
                        }
                    }
                }
            });

            // Get trending users
            const trendingUsers = await prisma.trendingEntity.findMany({
                where: {
                    type: 'USER',
                    period: 'DAILY',
                },
                orderBy: {
                    score: 'desc'
                },
                take: 5,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            image: true
                        }
                    }
                }
            });

            // Get user activity summary
            const userActivity = await prisma.userActivity.groupBy({
                by: ['action'],
                where: {
                    createdAt: {
                        gte: last24h
                    }
                },
                _count: true,
                orderBy: {
                    _count: {
                        action: 'desc'
                    }
                },
                take: 10
            });

            return successResponse({
                systemOverview: platformStats || { message: "No platform stats available" },
                search: searchAnalytics || { message: "No search analytics available" },
                trending: {
                    repositories: trendingRepos.map(trend => ({
                        ...trend.repository,
                        score: trend.score,
                        rank: trend.rank
                    })),
                    users: trendingUsers.map(trend => ({
                        ...trend.user,
                        score: trend.score,
                        rank: trend.rank
                    }))
                },
                activity: {
                    topActions: userActivity,
                    periods: {
                        last24h: await prisma.userActivity.count({
                            where: { createdAt: { gte: last24h } }
                        }),
                        last7d: await prisma.userActivity.count({
                            where: { createdAt: { gte: last7d } }
                        }),
                        last30d: await prisma.userActivity.count({
                            where: { createdAt: { gte: last30d } }
                        })
                    }
                }
            }, "Analytics overview");
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}
