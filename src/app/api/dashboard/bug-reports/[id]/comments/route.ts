import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';

const addCommentSchema = z.object({
    content: z.string().min(1).max(2000),
    isInternal: z.boolean().optional(),
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

    private async processRequest(request: NextRequest, bugReportId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to add comments');
            }

            // Validate the request body
            const { content, isInternal = false } = await this.validateRequest(request);

            // Verify the bug report exists
            const bugReport = await prisma.bugReport.findUnique({
                where: { id: bugReportId }
            });

            if (!bugReport) {
                return errors.notFound('Bug report not found');
            }

            // Create the comment
            const comment = await prisma.comment.create({
                data: {
                    content,
                    isInternal,
                    authorId: session.user.id,
                    bugReportId,
                },
                include: {
                    author: {
                        select: {
                            name: true,
                        }
                    }
                }
            });

            // Create a notification for the bug report author
            // (only if the commenter is not the author)
            if (bugReport.authorId !== session.user.id) {
                await prisma.notification.create({
                    data: {
                        type: 'COMMENT_REPLY',
                        title: 'New comment on your bug report',
                        content: `${session.user.name} commented on your bug report: "${bugReport.title.substring(0, 50)}${bugReport.title.length > 50 ? '...' : ''}"`,
                        userId: bugReport.authorId,
                        isRead: false,
                    }
                });
            }

            // Log the comment
            await prisma.auditLog.create({
                data: {
                    action: 'COMMENT_ADDED',
                    entityType: 'Comment',
                    entityId: comment.id,
                    userId: session.user.id,
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined,
                    userAgent: request.headers.get('user-agent') || undefined,
                    metadata: {
                        bugReportId,
                        commentContent: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                        isInternal
                    }
                }
            });

            return successResponse({
                message: 'Comment added successfully',
                comment: {
                    id: comment.id,
                    content: comment.content,
                    authorId: comment.authorId,
                    authorName: comment.author.name || 'Unknown User',
                    createdAt: comment.createdAt.toISOString(),
                    updatedAt: comment.updatedAt.toISOString(),
                    isInternal: comment.isInternal,
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new AddCommentRoute();
export const POST = route.handle.bind(route);
