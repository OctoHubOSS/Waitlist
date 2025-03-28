import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/database";
import { validateQuery } from "@/lib/api/validation";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { z } from "zod";

// Query parameters validation
const querySchema = z.object({
    period: z.enum(['day', 'week', 'month']).default('day'),
    detailed: z.enum(['true', 'false']).transform(val => val === 'true').default('false')
});

// GET /api/base/users/[id]/tokens/[tokenId]/stats
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string, tokenId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is accessing their own token stats or has admin permission
        const isOwnToken = session.user.id === params.id;
        const hasAdminAccess = session.user.isAdmin === true;
        
        if (!isOwnToken && !hasAdminAccess) {
            return errors.forbidden('You can only view statistics for your own tokens');
        }
        
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { period, detailed } = validation.data;

        // Check if token exists and belongs to the specified user
        const token = await prisma.apiToken.findFirst({
            where: {
                id: params.tokenId,
                userId: params.id
            }
        });

        if (!token) {
            return errors.notFound('Token not found');
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

        // Get basic usage statistics
        const totalUsage = await prisma.apiTokenUsage.count({
            where: {
                tokenId: params.tokenId
            }
        });

        const recentUsage = await prisma.apiTokenUsage.count({
            where: {
                tokenId: params.tokenId,
                createdAt: {
                    gte: startDate
                }
            }
        });

        // Get error rate
        const errorUsage = await prisma.apiTokenUsage.count({
            where: {
                tokenId: params.tokenId,
                createdAt: {
                    gte: startDate
                },
                status: {
                    gte: 400
                }
            }
        });

        const errorRate = recentUsage > 0 ? (errorUsage / recentUsage) * 100 : 0;

        // Get detailed stats if requested
        let detailedStats = null;
        if (detailed) {
            // Most used endpoints
            const endpointStats = await prisma.apiTokenUsage.groupBy({
                by: ['endpoint', 'method'],
                where: {
                    tokenId: params.tokenId,
                    createdAt: {
                        gte: startDate
                    }
                },
                _count: true,
                orderBy: {
                    _count: {
                        endpoint: 'desc'
                    }
                },
                take: 5
            });

            // Status code distribution
            const statusStats = await prisma.apiTokenUsage.groupBy({
                by: ['status'],
                where: {
                    tokenId: params.tokenId,
                    createdAt: {
                        gte: startDate
                    }
                },
                _count: true
            });

            // Usage by hour (for charts)
            const hourlyUsage = await prisma.$queryRaw`
                SELECT 
                    HOUR(createdAt) as hour,
                    COUNT(*) as count
                FROM ApiTokenUsage
                WHERE tokenId = ${params.tokenId}
                AND createdAt >= ${startDate}
                GROUP BY HOUR(createdAt)
                ORDER BY hour
            `;

            detailedStats = {
                topEndpoints: endpointStats,
                statusDistribution: statusStats,
                hourlyUsage
            };
        }

        // Usage summary
        const stats = {
            totalUsage,
            periodUsage: recentUsage,
            errorRate: parseFloat(errorRate.toFixed(2)),
            periodDescription: `Last ${period === 'day' ? '24 hours' : period === 'week' ? '7 days' : '30 days'}`,
            lastUsed: token.lastUsedAt,
            detailedStats
        };

        return successResponse(stats, 'Token statistics retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
