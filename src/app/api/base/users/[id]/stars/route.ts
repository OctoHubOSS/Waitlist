import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/utils/validation';
import { errors, handleApiError, paginatedResponse } from '@/utils/responses';
import { z } from 'zod';

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['starred', 'name', 'created', 'updated']).default('starred'),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    language: z.string().optional(),
});

// GET /api/base/users/[id]/stars
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            select: { id: true }
        });

        if (!targetUser) {
            return errors.notFound('User not found');
        }

        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort, order, search, language } = validation.data;

        // Get starred repositories with pagination
        const [stars, total] = await Promise.all([
            prisma.star.findMany({
                where: {
                    userId: params.id,
                    repository: {
                        deletedAt: null,
                        ...(language ? { language } : {}),
                        ...(search ? {
                            OR: [
                                { name: { contains: search } },
                                { description: { contains: search } }
                            ]
                        } : {}),
                        // Only show private repos if viewing own stars
                        ...((session.user.id !== params.id) ? { isPrivate: false } : {})
                    }
                },
                orderBy: [
                    {
                        [sort === 'starred' ? 'createdAt' :
                            sort === 'created' ? 'repository.createdAt' :
                                sort === 'updated' ? 'repository.updatedAt' : 'repository.name']: order
                    }
                ],
                include: {
                    repository: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            isPrivate: true,
                            language: true,
                            defaultBranch: true,
                            createdAt: true,
                            updatedAt: true,
                            owner: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    image: true,
                                }
                            },
                            organization: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    avatarUrl: true,
                                }
                            },
                            _count: {
                                select: {
                                    stars: true,
                                    issues: true,
                                    pullRequests: true,
                                    releases: true,
                                    contributors: true,
                                }
                            }
                        }
                    }
                },
                take,
                skip,
            }),
            prisma.star.count({
                where: {
                    userId: params.id,
                    repository: {
                        deletedAt: null,
                        ...(language ? { language } : {}),
                        ...(search ? {
                            OR: [
                                { name: { contains: search } },
                                { description: { contains: search } }
                            ]
                        } : {}),
                        ...((session.user.id !== params.id) ? { isPrivate: false } : {})
                    }
                }
            })
        ]);

        // Get current user's stars for these repositories
        const userStars = session.user ? await prisma.star.findMany({
            where: {
                userId: session.user.id,
                repositoryId: {
                    in: stars.map(s => s.repository.id)
                }
            },
            select: {
                repositoryId: true
            }
        }) : [];

        const userStarSet = new Set(userStars.map(s => s.repositoryId));

        return paginatedResponse(
            stars.map(star => ({
                ...star.repository,
                starCount: star.repository._count.stars,
                issueCount: star.repository._count.issues,
                pullRequestCount: star.repository._count.pullRequests,
                releaseCount: star.repository._count.releases,
                contributorCount: star.repository._count.contributors,
                isStarredByUser: userStarSet.has(star.repository.id),
                starredAt: star.createdAt,
                _count: undefined
            })),
            Math.floor(skip / take) + 1,
            take,
            total,
            'Starred repositories retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 