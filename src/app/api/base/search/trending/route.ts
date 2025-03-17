import prisma from '@root/prisma/database';
import { ApiClient } from '@/lib/api/client';
import { apiSchemas, validateQuery } from '@/lib/api/validation';
import { errors, paginatedResponse } from '@/lib/api/responses';
import { cache } from '@/lib/api/cache';
import { Prisma, TrendingPeriod, TrendingType } from '@prisma/client';

const api = new ApiClient(prisma);

type TrendingResult = {
    id: string;
    name: string | null;
    displayName?: string | null;
    description?: string | null;
    image?: string | null;
    type: TrendingType;
    score: number;
    rank: number;
    metrics: {
        views: number;
        stars: number;
        forks?: number;
        contributors?: number;
    };
};

/**
 * Trending search endpoint that returns trending repositories, users, and organizations
 * GET /api/search/trending?type=repository&period=daily&limit=10
 */
export const GET = api.handler(async ({ req }) => {
    // Validate query parameters
    const validation = validateQuery(req, apiSchemas.trending());
    if (!validation.success) {
        return errors.badRequest('Invalid trending parameters', validation.error);
    }

    // Extract validated data with defaults
    const { type, period, limit } = validation.data;
    const take = limit ?? 10; // Ensure limit has a default value

    // Check cache first
    const cacheKey = `trending:${type}:${period}:${take}`;
    const cached = await cache.get<TrendingResult[]>(cacheKey);
    if (cached) {
        return paginatedResponse(
            cached,
            1,
            take,
            cached.length,
            'Trending results retrieved from cache'
        );
    }

    try {
        // Get trending entities
        const trending = await prisma.trendingEntity.findMany({
            where: {
                type: type as TrendingType,
                period: period as TrendingPeriod,
                endTime: {
                    gte: new Date() // Only active trending periods
                }
            },
            orderBy: [
                { score: 'desc' },
                { rank: 'asc' }
            ],
            take,
            include: {
                repository: {
                    select: {
                        name: true,
                        description: true,
                        language: true,
                        owner: {
                            select: {
                                name: true,
                                displayName: true,
                                image: true
                            }
                        },
                        organization: {
                            select: {
                                name: true,
                                displayName: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        name: true,
                        displayName: true,
                        image: true,
                        bio: true
                    }
                },
                organization: {
                    select: {
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                        description: true
                    }
                }
            }
        });

        // Format results based on entity type
        const results: TrendingResult[] = trending.map(entity => {
            let result: TrendingResult;

            switch (entity.type) {
                case 'REPOSITORY':
                    if (!entity.repository) break;
                    result = {
                        id: entity.entityId,
                        name: entity.repository.name,
                        description: entity.repository.description,
                        image: entity.repository.organization?.avatarUrl || entity.repository.owner?.image || null,
                        type: entity.type,
                        score: entity.score,
                        rank: entity.rank,
                        metrics: {
                            views: entity.viewCount,
                            stars: entity.starCount,
                            forks: entity.forkCount,
                            contributors: entity.contributorCount
                        }
                    };
                    break;

                case 'USER':
                    if (!entity.user) break;
                    result = {
                        id: entity.entityId,
                        name: entity.user.name,
                        displayName: entity.user.displayName,
                        description: entity.user.bio,
                        image: entity.user.image,
                        type: entity.type,
                        score: entity.score,
                        rank: entity.rank,
                        metrics: {
                            views: entity.viewCount,
                            stars: entity.starCount
                        }
                    };
                    break;

                case 'ORGANIZATION':
                    if (!entity.organization) break;
                    result = {
                        id: entity.entityId,
                        name: entity.organization.name,
                        displayName: entity.organization.displayName,
                        description: entity.organization.description,
                        image: entity.organization.avatarUrl,
                        type: entity.type,
                        score: entity.score,
                        rank: entity.rank,
                        metrics: {
                            views: entity.viewCount,
                            stars: entity.starCount
                        }
                    };
                    break;
            }

            return result!;
        }).filter(Boolean);

        // Cache results for 15 minutes
        await cache.set(cacheKey, results, 900);

        return paginatedResponse(
            results,
            1,
            take,
            results.length,
            'Trending results retrieved successfully'
        );
    } catch (error) {
        console.error('Trending search error:', error);
        return errors.internal('Failed to retrieve trending results');
    }
}); 