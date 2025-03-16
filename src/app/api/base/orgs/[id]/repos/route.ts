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
    sort: z.enum(['name', 'created', 'updated', 'pushed', 'size']).default('updated'),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    language: z.string().optional(),
    type: z.enum(['all', 'public', 'private']).default('all'),
});

// GET /api/base/orgs/[orgId]/repos
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort, order, search, language, type } = validation.data;

        // Check if organization exists and user has access
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                OR: [
                    { isPublic: true },
                    {
                        members: {
                            some: {
                                userId: session.user.id
                            }
                        }
                    }
                ]
            },
            include: {
                members: {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Build where clause
        const where = {
            orgId: params.orgId,
            deletedAt: null,
            ...(type !== 'all' ? { isPrivate: type === 'private' } : {}),
            ...(language ? { language } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {}),
            // If org is not public and user is not a member, only show public repos
            ...(!organization.isPublic && !organization.members.length ? { isPrivate: false } : {})
        };

        // Get repositories with pagination
        const [repositories, total] = await Promise.all([
            prisma.repository.findMany({
                where,
                orderBy: {
                    [sort === 'created' ? 'createdAt' :
                        sort === 'updated' ? 'updatedAt' :
                            sort === 'pushed' ? 'lastPushedAt' :
                                sort === 'size' ? 'size' : 'name']: order
                },
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                        }
                    },
                    settings: true,
                    _count: {
                        select: {
                            stars: true,
                            issues: true,
                            pullRequests: true,
                            releases: true,
                            contributors: true,
                        }
                    }
                },
                take,
                skip,
            }),
            prisma.repository.count({ where })
        ]);

        // Check if user has starred each repository
        const userStars = await prisma.star.findMany({
            where: {
                userId: session.user.id,
                repositoryId: {
                    in: repositories.map(r => r.id)
                }
            },
            select: {
                repositoryId: true
            }
        });

        const userStarSet = new Set(userStars.map(s => s.repositoryId));

        return paginatedResponse(
            repositories.map(repo => ({
                ...repo,
                starCount: repo._count.stars,
                issueCount: repo._count.issues,
                pullRequestCount: repo._count.pullRequests,
                releaseCount: repo._count.releases,
                contributorCount: repo._count.contributors,
                isStarredByUser: userStarSet.has(repo.id),
                _count: undefined
            })),
            Math.floor(skip / take) + 1,
            take,
            total,
            'Repositories retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 