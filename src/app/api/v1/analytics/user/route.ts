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
    userId: z.string().optional(),
});

/**
 * GET /api/v1/analytics/user - Get analytics for a specific user
 * If no userId is provided, returns data for the authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { period, userId } = validation.data;

        return api.handler(withAuth(async (context) => {
            const { user } = context.data.auth;
            
            // Determine which user to fetch analytics for
            const targetUserId = userId || user.id;
            
            // Only allow admins to view other users' analytics
            if (targetUserId !== user.id && !user.isAdmin) {
                return errors.forbidden("You can only view your own analytics");
            }

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

            // Get user activity data
            const activityData = await prisma.userActivity.findMany({
                where: {
                    userId: targetUserId,
                    createdAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 100
            });

            // Get activity summary by action type
            const activitySummary = await prisma.userActivity.groupBy({
                by: ['action'],
                where: {
                    userId: targetUserId,
                    createdAt: {
                        gte: startDate
                    }
                },
                _count: true,
                orderBy: {
                    _count: {
                        action: 'desc'
                    }
                }
            });

            // Get repository views
            const repoViews = await prisma.repositoryView.findMany({
                where: {
                    userId: targetUserId,
                    createdAt: {
                        gte: startDate
                    }
                },
                include: {
                    repository: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            });

            // Get search history
            const searches = await prisma.searchQuery.findMany({
                where: {
                    userId: targetUserId,
                    createdAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            });

            // Get presence history
            const presence = await prisma.userPresence.findMany({
                where: {
                    userId: targetUserId,
                    startedAt: {
                        gte: startDate
                    }
                },
                orderBy: {
                    startedAt: 'desc'
                }
            });

            // Calculate total active time
            const totalActiveTime = presence.reduce((total, p) => {
                if (p.duration) {
                    return total + p.duration;
                }
                
                // If no duration (still active), calculate from startedAt to now
                if (!p.endedAt) {
                    return total + Math.floor((now.getTime() - p.startedAt.getTime()) / 1000);
                }
                
                return total + Math.floor((p.endedAt.getTime() - p.startedAt.getTime()) / 1000);
            }, 0);

            return successResponse({
                period: period,
                periodLabel: period === 'day' ? 'Last 24 hours' : period === 'week' ? 'Last 7 days' : 'Last 30 days',
                activity: {
                    total: activityData.length,
                    bySeries: activitySummary.map(item => ({
                        action: item.action,
                        count: item._count
                    })),
                    recent: activityData.map(a => ({
                        id: a.id,
                        action: a.action,
                        timestamp: a.createdAt,
                        metadata: a.metadata
                    }))
                },
                engagement: {
                    totalActiveTime: totalActiveTime,
                    formattedActiveTime: formatDuration(totalActiveTime),
                    statusBreakdown: presence.reduce((acc, p) => {
                        acc[p.status] = (acc[p.status] || 0) + (p.duration || 0);
                        return acc;
                    }, {} as Record<string, number>)
                },
                repositories: {
                    viewed: repoViews.map(view => ({
                        id: view.repository.id,
                        name: view.repository.name,
                        description: view.repository.description,
                        viewedAt: view.createdAt
                    }))
                },
                search: {
                    recent: searches.map(s => ({
                        query: s.query,
                        timestamp: s.createdAt,
                        resultsCount: s.resultsCount
                    })),
                    totalQueries: searches.length
                }
            }, `User analytics for ${period}`);
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Format duration in seconds to a human-readable string
 */
function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
}
