import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const updateCommentSchema = z.object({
    body: z.string().min(1, "Comment body is required"),
});

// PATCH /api/base/repositories/[repoId]/issues/[number]/comments/[commentId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string; commentId: string } }
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

        // Check if comment exists and user is the author
        const comment = await prisma.issueComment.findFirst({
            where: {
                id: params.commentId,
                issueId: issue.id,
            },
        });

        if (!comment) {
            return errors.notFound('Comment not found');
        }

        // Only allow comment author or repository admin to edit
        const isAdmin = repository.ownerId === session.user.id || await prisma.teamRepositoryAccess.findFirst({
            where: {
                repositoryId: params.repoId,
                permission: 'ADMIN',
                team: {
                    members: {
                        some: {
                            userId: session.user.id
                        }
                    }
                }
            }
        });

        if (comment.authorId !== session.user.id && !isAdmin) {
            return errors.forbidden('Not authorized to edit this comment');
        }

        // Validate request body
        const validation = await validateBody(req, updateCommentSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid comment data', validation.error);
        }

        // Update the comment
        const updatedComment = await prisma.issueComment.update({
            where: {
                id: params.commentId,
            },
            data: {
                body: validation.data.body,
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

        return successResponse(updatedComment, 'Comment updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 