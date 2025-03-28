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
    repositoryId: z.string().optional(),
});

/**
 * GET /api/v1/analytics/repositories - Get repository analytics
 * If repositoryId is provided, returns data for that specific repository
 * Otherwise returns aggregated data for all repositories the user has access to
 */
export async function GET(req: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { period, repositoryId } = validation.data;

        return api.handler(withAuth(async (context) => {
            const { user } = context.data.auth;
            
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

            if (repositoryId) {
                // Check if user has access to this repository
                const repository = await prisma.repository.findFirst({
                    where: {
                        id: repositoryId,
                        OR: [
                            // User is the owner
                            { ownerId: user.id },
                            // User is a member of the owning organization
                            { 
                                organization: {
                                    members: {
                                        some: {
                                            userId: user.id
                                        }
                                    }
                                }
                            },
                            // Repository is public
                            { isPrivate: false }
                        ]
                    }
                });

                if (!repository) {
                    return errors.notFound("Repository not found or you don't have access");
                }

                // Get repository stats
                const stats = await prisma.repositoryStats.findUnique({
                    where: {
                        repositoryId
                    }
                });

                // Get view data
                const views = await prisma.repositoryView.findMany({
                    where: {
                        repositoryId,
                        createdAt: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });

                // Get unique viewers
                const uniqueViewers = await prisma.repositoryView.groupBy({
                    by: ['userId'],
                    where: {
                        repositoryId,
                        createdAt: {
                            gte: startDate
                        },
                        userId: {
                            not: null
                        }
                    },
                    _count: true
                });

                // Get stars over time
                const stars = await prisma.star.findMany({
                    where: {
                        repositoryId,
                        createdAt: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                });

                // Get search impressions
                const searchImpressions = await prisma.searchImpression.count({
                    where: {
                        repositoryId,
                        createdAt: {
                            gte: startDate
                        }
                    }
                });

                // Get search clicks
                const searchClicks = await prisma.searchClick.count({
                    where: {
                        repositoryId,
                        createdAt: {
                            gte: startDate
                        }
                    }
                });

                return successResponse({
                    repository: {
                        id: repository.id,
                        name: repository.name,
                        description: repository.description,
                        isPrivate: repository.isPrivate,
                        starCount: repository.starCount,
                        forkCount: repository.forkCount
                    },
                    period: period,
                    periodLabel: period === 'day' ? 'Last 24 hours' : period === 'week' ? 'Last 7 days' : 'Last 30 days',
                    views: {
                        total: views.length,
                        uniqueUsers: uniqueViewers.length,
                        byDate: groupByDate(views.map(v => v.createdAt))
                    },
                    stars: {
                        total: stars.length,
                        byDate: groupByDate(stars.map(s => s.createdAt))
                    },
                    search: {
                        impressions: searchImpressions,
                        clicks: searchClicks,
                        clickThroughRate: searchImpressions > 0 ? (searchClicks / searchImpressions) * 100 : 0
                    },
                    stats: stats || null
                }, `Repository analytics for ${repository.name}`);
            } else {
                // Get aggregated data for all repositories the user has access to
                
                // Get repositories the user has access to
                const repositories = await prisma.repository.findMany({
                    where: {
                        OR: [
                            // User is the owner
                            { ownerId: user.id },
                            // User is a member of the owning organization
                            { 
                                organization: {
                                    members: {
                                        some: {
                                            userId: user.id
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        viewCount: true,
                        starCount: true,
                        forkCount: true,
                        stats: true
                    },
                    take: 10,
                    orderBy: {
                        starCount: 'desc'
                    }
                });

                // Rest of the implementation remains the same as before
                // ...existing code...

                return successResponse({
                    period: period,
                    periodLabel: period === 'day' ? 'Last 24 hours' : period === 'week' ? 'Last 7 days' : 'Last 30 days',
                    repositories: repositories.map(repo => ({
                        id: repo.id,
                        name: repo.name,
                        description: repo.description,
                        starCount: repo.starCount,
                        forkCount: repo.forkCount,
                        viewCount: repo.viewCount,
                        recentViews: 0, // Placeholder
                        recentStars: 0, // Placeholder  
                        stats: repo.stats
                    })),
                    // Placeholder data - would populate with actual counts in full implementation
                    totalViews: 0,
                    totalStars: 0
                }, "Repository analytics overview");
            }
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Group timestamps by date and count occurrences
 */
function groupByDate(timestamps: Date[]): { date: string; count: number }[] {
    const grouped: Record<string, number> = {};
    
    // Group by date
    timestamps.forEach(timestamp => {
        const dateStr = timestamp.toISOString().split('T')[0];
        grouped[dateStr] = (grouped[dateStr] || 0) + 1;
    });
    
    // Convert to array
    return Object.entries(grouped).map(([date, count]) => ({
        date,
        count
    })).sort((a, b) => a.date.localeCompare(b.date));
}
