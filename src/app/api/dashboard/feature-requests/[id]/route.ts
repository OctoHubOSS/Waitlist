import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

const featureRequestDetailResponseSchema = z.object({
    featureRequest: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.string(),
        authorId: z.string(),
        authorName: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        upvotes: z.number(),
        isUserUpvoted: z.boolean(),
    }),
    comments: z.array(z.object({
        id: z.string(),
        content: z.string(),
        authorId: z.string(),
        authorName: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })),
});

class FeatureRequestDetailRoute extends BaseAuthRoute<void, z.infer<typeof featureRequestDetailResponseSchema>> {
    constructor() {
        super(z.void());
    }

    async handle(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
        try {
            return await withTimeout(this.processRequest(request, params.id), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Feature request detail request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processRequest(request: NextRequest, featureRequestId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view feature requests');
            }

            // Get the feature request with author info
            const featureRequest = await prisma.featureRequest.findUnique({
                where: { id: featureRequestId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    _count: {
                        select: {
                            reactions: {
                                where: { type: 'LIKE' }
                            }
                        }
                    }
                }
            });

            if (!featureRequest) {
                return errors.notFound('Feature request not found');
            }

            // Check if the user has upvoted this request
            const userReaction = await prisma.reaction.findFirst({
                where: {
                    userId: session.user.id,
                    featureRequestId: featureRequestId,
                    type: 'LIKE'
                }
            });

            // Get comments with author info
            const comments = await prisma.comment.findMany({
                where: {
                    featureRequestId: featureRequestId
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            // Log the view
            await this.logAuthAction(
                AuditAction.FEATURE_REQUESTED,
                AuditStatus.SUCCESS,
                session.user.id,
                session.user.email as string,
                {
                    action: 'feature_request_viewed',
                    featureRequestId: featureRequestId
                },
                request
            );

            // Format the response
            const response = {
                featureRequest: {
                    id: featureRequest.id,
                    title: featureRequest.title,
                    description: featureRequest.description,
                    status: featureRequest.status,
                    authorId: featureRequest.authorId,
                    authorName: featureRequest.author.name || 'Unknown User',
                    createdAt: featureRequest.createdAt.toISOString(),
                    updatedAt: featureRequest.updatedAt.toISOString(),
                    upvotes: featureRequest._count.reactions,
                    isUserUpvoted: !!userReaction,
                },
                comments: comments.map(comment => ({
                    id: comment.id,
                    content: comment.content,
                    authorId: comment.authorId,
                    authorName: comment.author.name || 'Unknown User',
                    createdAt: comment.createdAt.toISOString(),
                    updatedAt: comment.updatedAt.toISOString(),
                })),
            };

            return successResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new FeatureRequestDetailRoute();
export const GET = route.handle.bind(route);
