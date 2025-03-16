import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError } from '@/utils/responses';

// DELETE /api/base/repositories/[repoId]/issues/[number]/comments/[commentId]/remove
export async function DELETE(
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
                                permission: 'ADMIN',
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

        // Only allow comment author or repository admin to delete
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
            return errors.forbidden('Not authorized to delete this comment');
        }

        // Delete the comment
        await prisma.issueComment.delete({
            where: {
                id: params.commentId,
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 