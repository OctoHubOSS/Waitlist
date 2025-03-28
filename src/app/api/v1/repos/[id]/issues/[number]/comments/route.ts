import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateQuery } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schemas
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['created', 'updated']).default('created'),
    order: z.enum(['asc', 'desc']).default('asc'),
});

// GET /api/base/repositories/[repoId]/issues/[number]/comments
export async function GET(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string } }
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

        // Check if issue exists
        const issue = await prisma.issue.findFirst({
            where: {
                repositoryId: params.repoId,
                number: parseInt(params.number),
            },
        });

        if (!issue) {
            return errors.notFound('Issue not found');
        }

        // Validate query parameters
        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 10, skip = 0, sort, order } = validation.data;

        // Get comments with pagination
        const [comments, total] = await Promise.all([
            prisma.issueComment.findMany({
                where: {
                    issueId: issue.id,
                },
                take,
                skip,
                orderBy: {
                    [sort + 'At']: order,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            image: true,
                        }
                    },
                    reactions: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    displayName: true,
                                    image: true,
                                }
                            }
                        }
                    }
                }
            }),
            prisma.issueComment.count({
                where: {
                    issueId: issue.id,
                }
            })
        ]);

        return paginatedResponse(
            comments,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Issue comments retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 