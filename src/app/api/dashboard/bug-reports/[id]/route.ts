import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { BugStatus, Priority, Severity } from '@prisma/client';

const bugReportDetailResponseSchema = z.object({
    bugReport: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        steps: z.string().nullable(),
        expected: z.string().nullable(),
        actual: z.string().nullable(),
        status: z.string(),
        priority: z.string(),
        severity: z.string(),
        browser: z.string().nullable(),
        os: z.string().nullable(),
        device: z.string().nullable(),
        version: z.string().nullable(),
        environment: z.string().nullable(),
        authorId: z.string(),
        authorName: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        reactions: z.number(),
        userReaction: z.string().nullable(),
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

// Schema for updating a bug report
const updateBugReportSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(2000).optional(),
    steps: z.string().optional(),
    expected: z.string().optional(),
    actual: z.string().optional(),
    status: z.nativeEnum(BugStatus).optional(),
    severity: z.nativeEnum(Severity).optional(),
    priority: z.nativeEnum(Priority).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
    version: z.string().optional(),
    environment: z.string().optional(),
});

class BugReportDetailRoute extends BaseAuthRoute<
    z.infer<typeof updateBugReportSchema>, 
    z.infer<typeof bugReportDetailResponseSchema>
> {
    constructor() {
        super(updateBugReportSchema);
    }

    async handle(request: NextRequest, { params }: { params: { id: string } }): Promise<Response> {
        try {
            const method = request.method.toUpperCase();
            
            switch (method) {
                case 'GET':
                    return await withTimeout(this.getBugReport(request, params.id), 5000);
                case 'PATCH':
                    return await withTimeout(this.updateBugReport(request, params.id), 5000);
                default:
                    return this.methodNotAllowed(request);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Bug report detail request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getBugReport(request: NextRequest, bugReportId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view bug reports');
            }

            // Get the bug report with author info
            const bugReport = await prisma.bugReport.findUnique({
                where: { id: bugReportId },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            reactions: true
                        }
                    },
                    reactions: {
                        where: {
                            userId: session.user.id
                        },
                        take: 1
                    }
                }
            });

            if (!bugReport) {
                return errors.notFound('Bug report not found');
            }

            // Get comments with author info
            const comments = await prisma.comment.findMany({
                where: {
                    bugReportId: bugReportId
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            // Log the view
            await prisma.auditLog.create({
                data: {
                    action: 'BUG_UPDATED',
                    entityType: 'BugReport',
                    entityId: bugReportId,
                    userId: session.user.id,
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined,
                    userAgent: request.headers.get('user-agent') || undefined,
                    metadata: {
                        action: 'bug_report_viewed'
                    }
                }
            });

            // Format the response
            const response = {
                bugReport: {
                    id: bugReport.id,
                    title: bugReport.title,
                    description: bugReport.description,
                    steps: bugReport.steps,
                    expected: bugReport.expected,
                    actual: bugReport.actual,
                    status: bugReport.status,
                    priority: bugReport.priority,
                    severity: bugReport.severity,
                    browser: bugReport.browser,
                    os: bugReport.os,
                    device: bugReport.device,
                    version: bugReport.version,
                    environment: bugReport.environment,
                    authorId: bugReport.authorId,
                    authorName: bugReport.author.name || 'Unknown User',
                    createdAt: bugReport.createdAt.toISOString(),
                    updatedAt: bugReport.updatedAt.toISOString(),
                    reactions: bugReport._count.reactions,
                    userReaction: bugReport.reactions.length > 0 ? bugReport.reactions[0].type : null,
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

    private async updateBugReport(request: NextRequest, bugReportId: string): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to update bug reports');
            }

            // Get the bug report
            const bugReport = await prisma.bugReport.findUnique({
                where: { id: bugReportId },
                select: { authorId: true }
            });

            if (!bugReport) {
                return errors.notFound('Bug report not found');
            }

            // Check if user is authorized to update
            // In a real app, you might also check for admin/moderator roles
            if (bugReport.authorId !== session.user.id) {
                return errors.forbidden('You do not have permission to update this bug report');
            }

            // Validate the request body
            const updateData = await this.validateRequest(request);

            // Update the bug report
            const updatedBugReport = await prisma.bugReport.update({
                where: { id: bugReportId },
                data: updateData
            });

            // Log the update
            await prisma.auditLog.create({
                data: {
                    action: 'BUG_UPDATED',
                    entityType: 'BugReport',
                    entityId: bugReportId,
                    userId: session.user.id,
                    newData: updateData,
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined,
                    userAgent: request.headers.get('user-agent') || undefined,
                }
            });

            return successResponse({
                message: 'Bug report updated successfully',
                bugReport: {
                    id: updatedBugReport.id,
                    title: updatedBugReport.title,
                    status: updatedBugReport.status,
                    severity: updatedBugReport.severity,
                    priority: updatedBugReport.priority,
                    updatedAt: updatedBugReport.updatedAt.toISOString(),
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new BugReportDetailRoute();
export const GET = route.handle.bind(route);
export const PATCH = route.handle.bind(route);
