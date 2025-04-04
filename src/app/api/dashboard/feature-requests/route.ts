import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

// Schema for getting feature requests
const featureRequestsResponseSchema = z.object({
    featureRequests: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        upvotes: z.number(),
        comments: z.number(),
        isUserUpvoted: z.boolean()
    })),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
        hasMore: z.boolean()
    })
});

// Schema for creating a feature request
const createFeatureRequestSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
});

class FeatureRequestsRoute extends BaseAuthRoute<
    z.infer<typeof createFeatureRequestSchema>, 
    z.infer<typeof featureRequestsResponseSchema>
> {
    constructor() {
        super(createFeatureRequestSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        const method = request.method.toUpperCase();
        
        try {
            switch (method) {
                case 'GET':
                    return await withTimeout(this.getFeatureRequests(request), 5000);
                case 'POST':
                    return await withTimeout(this.createFeatureRequest(request), 5000);
                default:
                    return this.methodNotAllowed(request);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Feature requests operation timed out');
            }
            return this.handleError(error);
        }
    }

    private async getFeatureRequests(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view feature requests');
            }

            // Parse pagination and filter params
            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
            const status = url.searchParams.get('status') || undefined;
            const myRequests = url.searchParams.get('myRequests') === 'true';
            
            // Validate pagination params
            if (page < 1 || pageSize < 1 || pageSize > 50) {
                return errors.badRequest('Invalid pagination parameters');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * pageSize;

            // Prepare filter
            const filter: any = {
                ...(status ? { status } : {}),
                ...(myRequests ? { authorId: session.user.id } : {})
            };

            // Get total count
            const totalFeatureRequests = await prisma.featureRequest.count({
                where: filter
            });

            // Get paginated feature requests
            const featureRequests = await prisma.featureRequest.findMany({
                where: filter,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                include: {
                    _count: {
                        select: {
                            reactions: {
                                where: { type: 'LIKE' }
                            },
                            comments: true
                        }
                    }
                }
            });

            // Get user's upvotes for these requests
            const userReactions = await prisma.reaction.findMany({
                where: {
                    userId: session.user.id,
                    type: 'LIKE',
                    featureRequestId: {
                        in: featureRequests.map(fr => fr.id)
                    }
                }
            });

            const userUpvotedRequestIds = new Set(userReactions.map(r => r.featureRequestId));

            // Format response
            const response = {
                featureRequests: featureRequests.map(fr => ({
                    id: fr.id,
                    title: fr.title,
                    description: fr.description,
                    status: fr.status,
                    createdAt: fr.createdAt.toISOString(),
                    updatedAt: fr.updatedAt.toISOString(),
                    upvotes: fr._count.reactions,
                    comments: fr._count.comments,
                    isUserUpvoted: userUpvotedRequestIds.has(fr.id)
                })),
                pagination: {
                    total: totalFeatureRequests,
                    page,
                    pageSize,
                    hasMore: skip + featureRequests.length < totalFeatureRequests
                }
            };

            return successResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async createFeatureRequest(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to create a feature request');
            }

            // Validate request data
            const { title, description } = await this.validateRequest(request);

            // Create the feature request
            const featureRequest = await prisma.featureRequest.create({
                data: {
                    title,
                    description,
                    status: 'OPEN',
                    authorId: session.user.id,
                }
            });

            // Log the creation
            await this.logAuthAction(
                AuditAction.FEATURE_REQUESTED,
                AuditStatus.SUCCESS,
                session.user.id,
                session.user.email as string,
                {
                    featureRequestId: featureRequest.id,
                    title
                },
                request
            );

            return successResponse({
                message: 'Feature request created successfully',
                featureRequest: {
                    id: featureRequest.id,
                    title: featureRequest.title,
                    description: featureRequest.description,
                    status: featureRequest.status,
                    createdAt: featureRequest.createdAt.toISOString(),
                    updatedAt: featureRequest.updatedAt.toISOString(),
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new FeatureRequestsRoute();
export const GET = route.handle.bind(route);
export const POST = route.handle.bind(route);

// Other methods are not allowed
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
