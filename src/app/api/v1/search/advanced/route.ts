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
    type: 'repository' | 'user' | 'code';
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
    // Code search specific fields
    path?: string;
    language?: string;
    content?: string;
    lineNumber?: number;
};

/**
 * Advanced search endpoint that supports complex queries with multiple filters
 * GET /api/search/advanced?type=repositories&name=test&language=typescript&stars=">100"&sort=stars&order=desc
 */
export const GET = api.handler(async ({ req }) => {
    // Validate query parameters
    const validation = validateQuery(req, apiSchemas.search());
    if (!validation.success) {
        return errors.badRequest('Invalid search parameters', validation.error);
    }

    const { type = 'all', sort = 'relevance', order = 'desc', page = 1, per_page = 30, ...filters } = validation.data;

    // Check if we have a cached response
    const cacheKey = `search:advanced:${type}:${JSON.stringify(filters)}:${sort}:${order}:${page}:${per_page}`;
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

        switch (type) {
            case 'repositories': {
                const whereConditions: Prisma.RepositoryWhereInput[] = [
                    { deletedAt: null }
                ];

                if (filters.name) {
                    whereConditions.push({ name: { contains: filters.name } });
                }
                if (filters.description) {
                    whereConditions.push({ description: { contains: filters.description } });
                }
                if (filters.language) {
                    whereConditions.push({ language: { equals: filters.language } });
                }
                if (filters.owner) {
                    whereConditions.push({ owner: { name: { contains: filters.owner } } });
                }
                if (filters.organization) {
                    whereConditions.push({ organization: { name: { contains: filters.organization } } });
                }
                if (filters.stars) {
                    const starFilter = parseRangeFilter('starCount', filters.stars);
                    if (starFilter) {
                        whereConditions.push({ starCount: starFilter });
                    }
                }
                if (filters.forks) {
                    const forkFilter = parseRangeFilter('forkCount', filters.forks);
                    if (forkFilter) {
                        whereConditions.push({ forkCount: forkFilter });
                    }
                }
                if (filters.size) {
                    const sizeFilter = parseRangeFilter('size', filters.size);
                    if (sizeFilter) {
                        whereConditions.push({ size: sizeFilter });
                    }
                }
                if (filters.created) {
                    const createdFilter = parseDateRangeFilter('createdAt', filters.created);
                    if (createdFilter) {
                        whereConditions.push({ createdAt: createdFilter });
                    }
                }
                if (filters.updated) {
                    const updatedFilter = parseDateRangeFilter('updatedAt', filters.updated);
                    if (updatedFilter) {
                        whereConditions.push({ updatedAt: updatedFilter });
                    }
                }
                if (filters.visibility) {
                    whereConditions.push({ isPrivate: { equals: filters.visibility === 'private' } });
                }

                const repoWhere: Prisma.RepositoryWhereInput = {
                    AND: whereConditions
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
                results = repoResults.map(repo => ({
                    ...repo,
                    type: 'repository',
                    language: repo.language || undefined
                }));
                break;
            }

            case 'users':
            case 'organizations': {
                const whereConditions: Prisma.UserWhereInput[] = [
                    { deletedAt: null }
                ];

                if (filters.username) {
                    whereConditions.push({ name: { contains: filters.username } });
                }
                if (filters.name) {
                    whereConditions.push({ displayName: { contains: filters.name } });
                }
                if (filters.email) {
                    whereConditions.push({ email: { contains: filters.email } });
                }
                if (filters.location) {
                    whereConditions.push({ location: { contains: filters.location } });
                }
                if (filters.joined) {
                    const joinedFilter = parseDateRangeFilter('createdAt', filters.joined);
                    if (joinedFilter) {
                        whereConditions.push({ createdAt: joinedFilter });
                    }
                }

                const userWhere: Prisma.UserWhereInput = {
                    AND: whereConditions
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
                        location: true,
                        createdAt: true,
                        _count: {
                            select: {
                                repositories: true,
                                stars: true
                            }
                        }
                    }
                });

                totalCount = await prisma.user.count({ where: userWhere });
                results = userResults.map(user => ({
                    ...user,
                    type: 'user',
                    repositoriesCount: user._count.repositories,
                    followersCount: user._count.stars
                }));
                break;
            }

            case 'code': {
                // Code search implementation will be added later
                results = [];
                totalCount = 0;
                break;
            }
        }

        // Cache the results
        await cache.set(cacheKey, { data: results, totalCount }, 300); // Cache for 5 minutes

        return paginatedResponse(
            results,
            page,
            per_page,
            totalCount,
            'Advanced search completed successfully'
        );
    } catch (error) {
        console.error('Advanced search error:', error);
        return errors.internal('Failed to perform advanced search');
    }
});

function parseRangeFilter(field: string, value: string): { [key: string]: number } | undefined {
    const match = value.match(/^([<>]=?|=)?\s*(\d+)$/);
    if (!match) return undefined;

    const [, operator = '=', num] = match;
    const numValue = parseInt(num, 10);

    switch (operator) {
        case '>':
            return { gt: numValue };
        case '>=':
            return { gte: numValue };
        case '<':
            return { lt: numValue };
        case '<=':
            return { lte: numValue };
        default:
            return { equals: numValue };
    }
}

function parseDateRangeFilter(field: string, value: string): { [key: string]: Date } | undefined {
    const match = value.match(/^([<>]=?|=)?\s*(.+)$/);
    if (!match) return undefined;

    const [, operator = '=', dateStr] = match;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;

    switch (operator) {
        case '>':
            return { gt: date };
        case '>=':
            return { gte: date };
        case '<':
            return { lt: date };
        case '<=':
            return { lte: date };
        default:
            return { equals: date };
    }
}

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
        case 'followers':
            return { stars: { _count: 'desc' } };
        case 'repos':
            return { repositories: { _count: 'desc' } };
        case 'joined':
            return { createdAt: 'desc' };
        case 'updated':
            return { updatedAt: 'desc' };
        default:
            return { createdAt: 'desc' };
    }
} 