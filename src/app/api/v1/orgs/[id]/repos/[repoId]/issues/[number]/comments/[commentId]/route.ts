import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const commentSchema = z.object({
    body: z.string().min(1, "Comment body is required").max(10000),
});

// PATCH /api/base/orgs/[orgId]/repos/[repoId]/issues/[number]/comments/[commentId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string; number: string; commentId: string } }
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

        // Check if comment exists and user has permission to edit it
        const comment = await prisma.issueComment.findFirst({
            where: {
                id: params.commentId,
                issueId: issue.id,
            },
        });

        if (!comment) {
            return errors.notFound('Comment not found');
        }

        // Check if user is the comment author or has admin access
        const isAdmin = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: session.user.id,
                role: { in: ['ADMIN', 'OWNER'] }
            }
        });

        if (comment.authorId !== session.user.id && !isAdmin) {
            return errors.forbidden('You do not have permission to edit this comment');
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

        return successResponse(updatedComment, 'Comment updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/base/orgs/[orgId]/repos/[repoId]/issues/[number]/comments/[commentId]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string; number: string; commentId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
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

        // Check if comment exists and user has permission to delete it
        const comment = await prisma.issueComment.findFirst({
            where: {
                id: params.commentId,
                issueId: issue.id,
            },
        });

        if (!comment) {
            return errors.notFound('Comment not found');
        }

        // Check if user is the comment author or has admin access
        const isAdmin = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: session.user.id,
                role: { in: ['ADMIN', 'OWNER'] }
            }
        });

        if (comment.authorId !== session.user.id && !isAdmin) {
            return errors.forbidden('You do not have permission to delete this comment');
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