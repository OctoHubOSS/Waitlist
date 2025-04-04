import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { ReactionType } from '@prisma/client';

const addReactionSchema = z.object({
    type: z.nativeEnum(ReactionType),
});

class ReactionRoute extends BaseAuthRoute<z.infer<typeof addReactionSchema>> {
    constructor() {
        super(addReactionSchema);
    }

    async handle(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
        try {
            return await withTimeout(this.processRequest(request, params.id), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Reaction request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processRequest(request: NextRequest, bugReportId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to react to bug reports');
            }

            // Validate the request body
            const { type } = await this.validateRequest(request);

            // Verify the bug report exists
            const bugReport = await prisma.bugReport.findUnique({
                where: { id: bugReportId }
            });

            if (!bugReport) {
                return errors.notFound('Bug report not found');
            }

            // Check if user already has this reaction
            const existingReaction = await prisma.reaction.findFirst({
                where: {
                    userId: session.user.id,
                    bugReportId,
                    type
                }
            });

            let message: string;
            
            if (existingReaction) {
                // If reaction exists, remove it (toggle off)
                await prisma.reaction.delete({
                    where: { id: existingReaction.id }
                });
                message = `Removed ${type.toLowerCase()} reaction`;
            } else {
                // Add the new reaction
                await prisma.reaction.create({
                    data: {
                        type,
                        userId: session.user.id,
                        bugReportId,
                    }
                });
                message = `Added ${type.toLowerCase()} reaction`;
                
                // Notify the bug report author of the reaction (if not their own)
                if (bugReport.authorId !== session.user.id) {
                    await prisma.notification.create({
                        data: {
                            type: 'REACTION',
                            title: `Someone reacted to your bug report`,
                            content: `${session.user.name || 'Someone'} reacted with ${type.toLowerCase()} to your bug report: "${bugReport.title.substring(0, 50)}${bugReport.title.length > 50 ? '...' : ''}"`,
                            userId: bugReport.authorId,
                            isRead: false,
                        }
                    });
                }
            }

            // Log the reaction action
            await prisma.auditLog.create({
                data: {
                    action: existingReaction ? 'REACTION_REMOVED' : 'REACTION_ADDED',
                    entityType: 'BugReport',
                    entityId: bugReportId,
                    userId: session.user.id,
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined,
                    userAgent: request.headers.get('user-agent') || undefined,
                    metadata: {
                        reactionType: type
                    }
                }
            });

            // Get updated reaction counts
            const reactionCounts = await prisma.reaction.groupBy({
                by: ['type'],
                where: { bugReportId },
                _count: true
            });

            const formattedCounts = Object.fromEntries(
                reactionCounts.map(r => [r.type, r._count])
            );

            // Get user's current reactions
            const userReactions = await prisma.reaction.findMany({
                where: {
                    userId: session.user.id,
                    bugReportId
                },
                select: {
                    type: true
                }
            });

            return successResponse({
                message,
                reactionCounts: formattedCounts,
                userReactions: userReactions.map(r => r.type)
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new ReactionRoute();
export const POST = route.handle.bind(route);
