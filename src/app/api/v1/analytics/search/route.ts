import { NextRequest } from "next/server";
import prisma from "@/lib/database";
import { ApiClient } from '@/lib/api/client';
import { withAuth } from '@/lib/api/middlewares/auth';
import { validateQuery } from "@/lib/api/validation";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { z } from "zod";

// Create API client instance
const api = new ApiClient(prisma);

// Query parameters validation
const querySchema = z.object({
    period: z.enum(['day', 'week', 'month']).default('day'),
});

/**
 * GET /api/v1/analytics/search - Get search analytics
 */
export async function GET(req: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { period } = validation.data;

        return api.handler(withAuth(async (context) => {
            const { user } = context.data.auth;
            
            // Only admin users can access full search analytics
            const isAdmin = user.isAdmin === true;
            
            // Calculate date range based on period
            const now = new Date();
            let startDate = new Date();

            switch (period) {
                case 'day':
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
            }

            // Rest of the implementation remains the same as before
            // Get search analytics data from SearchAnalytics model
            const searchAnalytics = isAdmin ? await prisma.searchAnalytics.findMany({
                where: {
                    startTime: {
                        gte: startDate
                    }
                },
                orderBy: {
                    startTime: 'asc'
                }
            }) : null;

            // Get trending search terms
            const trendingSearches = await prisma.searchTrending.findMany({
                orderBy: {
                    count: 'desc'
                },
                take: 10
            });

            // Get personal search history for the current user
            const personalSearches = await prisma.searchQuery.findMany({
                where: {
                    userId: user.id,
                    createdAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 20
            });

            // Get personal search sessions
            const searchSessions = isAdmin ? await prisma.searchSession.findMany({
                where: {
                    timestamp: {
                        gte: startDate
                    }
                },
                include: {
                    clicks: true,
                    refinementQueries: true
                },
                orderBy: {
                    timestamp: 'desc'
                },
                take: 10
            }) : null;

            // Stats that everyone can see
            const publicStats = {
                period: period,
                periodLabel: period === 'day' ? 'Last 24 hours' : period === 'week' ? 'Last 7 days' : 'Last 30 days',
                trending: trendingSearches.map(term => ({
                    term: term.term,
                    count: term.count,
                    dailyCount: term.dailyCount,
                    weeklyCount: term.weeklyCount
                })),
                personal: {
                    recent: personalSearches.map(search => ({
                        query: search.query,
                        timestamp: search.createdAt,
                        resultsCount: search.resultsCount,
                        filters: search.filters
                    })),
                    queriesCount: await prisma.searchQuery.count({
                        where: {
                            userId: user.id,
                            createdAt: {
                                gte: startDate
                            }
                        }
                    }),
                    uniqueQueries: await prisma.searchQuery.groupBy({
                        by: ['query'],
                        where: {
                            userId: user.id,
                            createdAt: {
                                gte: startDate
                            }
                        },
                        _count: true
                    }).then(results => results.length),
                    clickRate: await calculateUserClickRate(user.id, startDate)
                }
            };

            // Additional stats for admins
            if (isAdmin) {
                return successResponse({
                    ...publicStats,
                    analytics: searchAnalytics,
                    sessions: searchSessions?.map(session => ({
                        id: session.id,
                        query: session.query,
                        timestamp: session.timestamp,
                        totalResults: session.totalResults,
                        userId: session.userId,
                        executionTimeMs: session.executionTimeMs,
                        clicks: session.clicks,
                        refinements: session.refinementQueries,
                        errorOccurred: session.errorOccurred
                    })),
                    metrics: {
                        totalSearches: await prisma.searchQuery.count({
                            where: {
                                createdAt: {
                                    gte: startDate
                                }
                            }
                        }),
                        uniqueUsers: await prisma.searchQuery.groupBy({
                            by: ['userId'],
                            where: {
                                createdAt: {
                                    gte: startDate
                                },
                                userId: {
                                    not: null
                                }
                            }
                        }).then(results => results.length),
                        zeroResults: await prisma.searchQuery.count({
                            where: {
                                createdAt: {
                                    gte: startDate
                                },
                                resultsCount: 0
                            }
                        }),
                        avgResultsCount: await prisma.searchQuery.aggregate({
                            where: {
                                createdAt: {
                                    gte: startDate
                                }
                            },
                            _avg: {
                                resultsCount: true
                            }
                        }).then(result => result._avg.resultsCount || 0),
                        clickThroughRate: await calculateOverallClickRate(startDate)
                    }
                }, "Search analytics overview (admin view)");
            }

            return successResponse(publicStats, "Search analytics overview");
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Calculate click-through rate for a specific user
 */
async function calculateUserClickRate(userId: string, startDate: Date): Promise<number> {
    const searchCount = await prisma.searchQuery.count({
        where: {
            userId,
            createdAt: {
                gte: startDate
            }
        }
    });
    
    const clickCount = await prisma.searchClick.count({
        where: {
            userId,
            createdAt: {
                gte: startDate
            }
        }
    });
    
    return searchCount > 0 ? (clickCount / searchCount) * 100 : 0;
}

/**
 * Calculate overall click-through rate
 */
async function calculateOverallClickRate(startDate: Date): Promise<number> {
    const searchCount = await prisma.searchQuery.count({
        where: {
            createdAt: {
                gte: startDate
            }
        }
    });
    
    const clickCount = await prisma.searchClick.count({
        where: {
            createdAt: {
                gte: startDate
            }
        }
    });
    
    return searchCount > 0 ? (clickCount / searchCount) * 100 : 0;
}
