import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateQuery, validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
});

const commentSchema = z.object({
    body: z.string().min(1, "Comment body is required").max(10000),
});

// GET /api/base/orgs/[orgId]/repos/[repoId]/issues/[number]/comments
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string; number: string } }
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
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Check if repository exists and user has access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
            },
            include: {
                settings: true
            }
        });

        if (!repository) {
            return errors.notFound('Repository not found');
        }

        if (!repository.settings?.hasIssues) {
            return errors.badRequest('Issues are disabled for this repository');
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

        // Get comments with pagination
        const [comments, total] = await Promise.all([
            prisma.issueComment.findMany({
                where: {
                    issueId: issue.id,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    reactions: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                },
                skip: validation.data.skip,
                take: validation.data.take,
            }),
            prisma.issueComment.count({
                where: {
                    issueId: issue.id,
                }
            })
        ]);

        return successResponse({
            comments,
            pagination: {
                total,
                hasMore: validation.data.skip + validation.data.take < total,
                skip: validation.data.skip,
                take: validation.data.take,
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/base/orgs/[orgId]/repos/[repoId]/issues/[number]/comments/create
export async function POST(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string; number: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Validate request body
        const validation = await validateBody(req, commentSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid comment data', validation.error);
        }

        // Check if organization exists and user has access
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Check if repository exists
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
            },
            include: {
                settings: true
            }
        });

        if (!repository) {
            return errors.notFound('Repository not found');
        }

        if (!repository.settings?.hasIssues) {
            return errors.badRequest('Issues are disabled for this repository');
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

        // Create the comment
        const comment = await prisma.issueComment.create({
            data: {
                body: validation.data.body,
                authorId: session.user.id,
                issueId: issue.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            }
                        }
                    }
                }
            }
        });

        return successResponse(comment, 'Comment created successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 