import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const createCommentSchema = z.object({
    body: z.string().min(1, "Comment body is required"),
});

// POST /api/base/repositories/[repoId]/issues/[number]/comments/create
export async function POST(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has write access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        teams: {
                            some: {
                                permission: { in: ['WRITE', 'ADMIN'] },
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
            return errors.notFound('Repository not found or write access denied');
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

        // Validate request body
        const validation = await validateBody(req, createCommentSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid comment data', validation.error);
        }

        // Create the comment
        const comment = await prisma.issueComment.create({
            data: {
                body: validation.data.body,
                issue: { connect: { id: issue.id } },
                author: { connect: { id: session.user.id } },
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
        });

        return successResponse(
            comment,
            'Comment created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 