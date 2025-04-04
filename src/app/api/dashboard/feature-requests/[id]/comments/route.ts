import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

const addCommentSchema = z.object({
    content: z.string().min(1).max(2000),
});

class AddCommentRoute extends BaseAuthRoute<z.infer<typeof addCommentSchema>> {
    constructor() {
        super(addCommentSchema);
    }

    async handle(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
        try {
            return await withTimeout(this.processRequest(request, params.id), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Add comment request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processRequest(request: NextRequest, featureRequestId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to add comments');
            }

            // Validate the request body
            const { content } = await this.validateRequest(request);

            // Verify the feature request exists
            const featureRequest = await prisma.featureRequest.findUnique({
                where: { id: featureRequestId }
            });

            if (!featureRequest) {
                return errors.notFound('Feature request not found');
            }

            // Create the comment
            const comment = await prisma.comment.create({
                data: {
                    content,
                    authorId: session.user.id,
                    featureRequestId,
                },
                include: {
                    author: {
                        select: {
                            name: true,
                        }
                    }
                }
            });

            // Create a notification for the feature request author
            // (only if the commenter is not the author)
            if (featureRequest.authorId !== session.user.id) {
                await prisma.notification.create({
                    data: {
                        type: 'COMMENT_REPLY',
                        title: 'New comment on your feature request',
                        content: `${session.user.name} commented on your feature request: "${featureRequest.title.substring(0, 50)}${featureRequest.title.length > 50 ? '...' : ''}"`,
                        userId: featureRequest.authorId,
                        isRead: false,
                    }
                });
            }

            // Log the action
            await this.logAuthAction(
                AuditAction.COMMENT_ADDED,
                AuditStatus.SUCCESS,
                session.user.id,
                session.user.email as string,
                {
                    featureRequestId,
                    commentId: comment.id,
                    commentContent: content.substring(0, 100) + (content.length > 100 ? '...' : '')
                },
                request
            );

            return successResponse({
                message: 'Comment added successfully',
                comment: {
                    id: comment.id,
                    content: comment.content,
                    authorId: comment.authorId,
                    authorName: comment.author.name || 'Unknown User',
                    createdAt: comment.createdAt.toISOString(),
                    updatedAt: comment.updatedAt.toISOString(),
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new AddCommentRoute();
export const POST = route.handle.bind(route);
