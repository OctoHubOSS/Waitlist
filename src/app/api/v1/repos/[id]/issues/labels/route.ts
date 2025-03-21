import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schemas
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['name', 'created']).default('name'),
    order: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional(),
});

// GET /api/base/repos/[repoId]/issues/labels
export async function GET(
    req: NextRequest,
    { params }: { params: { repoId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { isPrivate: false },
                    { ownerId: session.user.id },
                    {
                        teams: {
                            some: {
                                team: {
                                    members: {
                                        some: {
                                            userId: session.user.id
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found or access denied');
        }

        // Validate query parameters
        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort, order, search } = validation.data;

        // Build where clause
        const where = {
            repositoryId: params.repoId,
            ...(search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {})
        };

        // Get labels with pagination
        const [labels, total] = await Promise.all([
            prisma.label.findMany({
                where,
                take,
                skip,
                orderBy: {
                    [sort === 'created' ? 'createdAt' : 'name']: order,
                },
                include: {
                    _count: {
                        select: {
                            issues: true,
                            pullRequests: true
                        }
                    }
                }
            }),
            prisma.label.count({ where })
        ]);

        return paginatedResponse(
            labels.map(label => ({
                ...label,
                issueCount: label._count.issues,
                pullRequestCount: label._count.pullRequests,
                _count: undefined
            })),
            Math.floor(skip / take) + 1,
            take,
            total,
            'Labels retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 