import prisma from '@root/prisma/database';
import { ApiClient } from '@/lib/api/client';
import { apiSchemas, validateQuery } from '@/lib/api/validation';
import { errors, paginatedResponse } from '@/lib/api/responses';
import { cache } from '@/lib/api/cache';
import { Prisma } from '@prisma/client';

const api = new ApiClient(prisma);

type SearchResult = {
    id: string;
    name: string | null;
    displayName?: string | null;
    description?: string | null;
    image?: string | null;
    bio?: string | null;
    type: 'repository' | 'user';
    owner?: {
        id: string;
        name: string | null;
        displayName: string | null;
        image: string | null;
    } | null;
    organization?: {
        id: string;
        name: string;
        displayName: string | null;
        avatarUrl: string | null;
    } | null;
};

/**
 * Standard search endpoint that supports searching across all entity types
 * GET /api/search?q=query&type=all&sort=relevance&order=desc&page=1&per_page=30
 */
export const GET = api.handler(async ({ req }) => {
    // Validate query parameters
    const validation = validateQuery(req, apiSchemas.search());
    if (!validation.success) {
        return errors.badRequest('Invalid search parameters', validation.error);
    }

    const { q = '', type = 'all', sort = 'relevance', order = 'desc', page = 1, per_page = 30 } = validation.data;

    // Check if we have a cached response
    const cacheKey = `search:${type}:${q}:${sort}:${order}:${page}:${per_page}`;
    const cached = await cache.get<{ data: SearchResult[]; totalCount: number }>(cacheKey);
    if (cached) {
        return paginatedResponse(
            cached.data,
            page,
            per_page,
            cached.totalCount,
            'Search results retrieved from cache'
        );
    }

    try {
        let results: SearchResult[] = [];
        let totalCount = 0;

        // Perform search based on type
        switch (type) {
            case 'repositories': {
                const repoWhere: Prisma.RepositoryWhereInput = {
                    OR: [
                        { name: { contains: q } },
                        { description: { contains: q } }
                    ],
                    deletedAt: null,
                    isPrivate: false
                };

                const repoResults = await prisma.repository.findMany({
                    where: repoWhere,
                    orderBy: getRepositoryOrderBy(sort),
                    skip: (page - 1) * per_page,
                    take: per_page,
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true
                            }
                        },
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                avatarUrl: true
                            }
                        }
                    }
                });

                totalCount = await prisma.repository.count({ where: repoWhere });
                results = repoResults.map(repo => ({ ...repo, type: 'repository' }));
                break;
            }

            case 'users':
            case 'organizations': {
                const userWhere: Prisma.UserWhereInput = {
                    OR: [
                        { name: { contains: q } },
                        { displayName: { contains: q } },
                        { email: { contains: q } }
                    ],
                    deletedAt: null
                };

                const userResults = await prisma.user.findMany({
                    where: userWhere,
                    orderBy: getUserOrderBy(sort),
                    skip: (page - 1) * per_page,
                    take: per_page,
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        email: true,
                        image: true,
                        bio: true,
                        createdAt: true
                    }
                });

                totalCount = await prisma.user.count({ where: userWhere });
                results = userResults.map(user => ({ ...user, type: 'user' }));
                break;
            }

            default: {
                // For 'all' type, combine results from all types
                const repoAllWhere: Prisma.RepositoryWhereInput = {
                    OR: [
                        { name: { contains: q } },
                        { description: { contains: q } }
                    ],
                    deletedAt: null,
                    isPrivate: false
                };

                const userAllWhere: Prisma.UserWhereInput = {
                    OR: [
                        { name: { contains: q } },
                        { displayName: { contains: q } }
                    ],
                    deletedAt: null
                };

                const [repos, users] = await Promise.all([
                    prisma.repository.findMany({
                        where: repoAllWhere,
                        take: per_page / 2,
                        orderBy: getRepositoryOrderBy(sort),
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    image: true
                                }
                            }
                        }
                    }),
                    prisma.user.findMany({
                        where: userAllWhere,
                        take: per_page / 2,
                        orderBy: getUserOrderBy(sort),
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            image: true,
                            bio: true
                        }
                    })
                ]);

                results = [
                    ...repos.map(repo => ({ ...repo, type: 'repository' as const })),
                    ...users.map(user => ({ ...user, type: 'user' as const }))
                ];
                totalCount = results.length;
            }
        }

        // Cache the results
        await cache.set(cacheKey, { data: results, totalCount }, 300); // Cache for 5 minutes

        return paginatedResponse(
            results,
            page,
            per_page,
            totalCount,
            'Search completed successfully'
        );
    } catch (error) {
        console.error('Search error:', error);
        return errors.internal('Failed to perform search');
    }
});

function getRepositoryOrderBy(sort: string): Prisma.RepositoryOrderByWithRelationInput {
    switch (sort) {
        case 'stars':
            return { starCount: 'desc' };
        case 'forks':
            return { forkCount: 'desc' };
        case 'updated':
            return { updatedAt: 'desc' };
        case 'created':
            return { createdAt: 'desc' };
        default:
            return { createdAt: 'desc' };
    }
}

function getUserOrderBy(sort: string): Prisma.UserOrderByWithRelationInput {
    switch (sort) {
        case 'updated':
            return { updatedAt: 'desc' };
        case 'created':
            return { createdAt: 'desc' };
        default:
            return { createdAt: 'desc' };
    }
} 