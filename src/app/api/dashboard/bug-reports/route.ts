import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { BugStatus, Priority, Severity } from '@prisma/client';

// Schema for getting bug reports
const bugReportsResponseSchema = z.object({
    bugReports: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.string(),
        priority: z.string(),
        severity: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
        reactions: z.number(),
        comments: z.number(),
        authorName: z.string(),
        browser: z.string().nullable(),
        os: z.string().nullable(),
    })),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
        hasMore: z.boolean()
    })
});

// Schema for creating a bug report
const createBugReportSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(2000),
    steps: z.string().optional(),
    expected: z.string().optional(),
    actual: z.string().optional(),
    severity: z.nativeEnum(Severity).optional(),
    priority: z.nativeEnum(Priority).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
    version: z.string().optional(),
    environment: z.string().optional(),
});

class BugReportsRoute extends BaseAuthRoute<
    z.infer<typeof createBugReportSchema>, 
    z.infer<typeof bugReportsResponseSchema>
> {
    constructor() {
        super(createBugReportSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        const method = request.method.toUpperCase();
        
        try {
            switch (method) {
                case 'GET':
                    return await withTimeout(this.getBugReports(request), 5000);
                case 'POST':
                    return await withTimeout(this.createBugReport(request), 5000);
                default:
                    return this.methodNotAllowed(request);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Bug reports operation timed out');
            }
            return this.handleError(error);
        }
    }

    private async getBugReports(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view bug reports');
            }

            // Parse pagination and filter params
            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
            const status = url.searchParams.get('status') || undefined;
            const severity = url.searchParams.get('severity') || undefined;
            const priority = url.searchParams.get('priority') || undefined;
            const myReports = url.searchParams.get('myReports') === 'true';
            
            // Validate pagination params
            if (page < 1 || pageSize < 1 || pageSize > 50) {
                return errors.badRequest('Invalid pagination parameters');
            }

            // Calculate skip value for pagination
            const skip = (page - 1) * pageSize;

            // Prepare filter
            const filter: any = {
                ...(status ? { status: status as BugStatus } : {}),
                ...(severity ? { severity: severity as Severity } : {}),
                ...(priority ? { priority: priority as Priority } : {}),
                ...(myReports ? { authorId: session.user.id } : {})
            };

            // Get total count
            const totalBugReports = await prisma.bugReport.count({
                where: filter
            });

            // Get paginated bug reports
            const bugReports = await prisma.bugReport.findMany({
                where: filter,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            reactions: true,
                            comments: true
                        }
                    }
                }
            });

            // Format response
            const response = {
                bugReports: bugReports.map(report => ({
                    id: report.id,
                    title: report.title,
                    description: report.description,
                    status: report.status,
                    priority: report.priority,
                    severity: report.severity,
                    createdAt: report.createdAt.toISOString(),
                    updatedAt: report.updatedAt.toISOString(),
                    reactions: report._count.reactions,
                    comments: report._count.comments,
                    authorName: report.author.name || 'Unknown User',
                    browser: report.browser,
                    os: report.os,
                })),
                pagination: {
                    total: totalBugReports,
                    page,
                    pageSize,
                    hasMore: skip + bugReports.length < totalBugReports
                }
            };

            return successResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async createBugReport(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to report a bug');
            }

            // Validate request data
            const data = await this.validateRequest(request);

            // Create the bug report
            const bugReport = await prisma.bugReport.create({
                data: {
                    title: data.title,
                    description: data.description,
                    steps: data.steps,
                    expected: data.expected,
                    actual: data.actual,
                    severity: data.severity || Severity.MINOR,
                    priority: data.priority || Priority.MEDIUM,
                    status: BugStatus.OPEN,
                    browser: data.browser,
                    os: data.os,
                    device: data.device,
                    version: data.version,
                    environment: data.environment,
                    authorId: session.user.id,
                }
            });

            // Log the creation in audit logs
            await prisma.auditLog.create({
                data: {
                    action: 'BUG_REPORTED',
                    entityType: 'BugReport',
                    entityId: bugReport.id,
                    userId: session.user.id,
                    newData: { ...data },
                    ipAddress: request.headers.get('x-forwarded-for') || request.ip || undefined,
                    userAgent: request.headers.get('user-agent') || undefined,
                }
            });

            return successResponse({
                message: 'Bug report created successfully',
                bugReport: {
                    id: bugReport.id,
                    title: bugReport.title,
                    status: bugReport.status,
                    severity: bugReport.severity,
                    priority: bugReport.priority,
                    createdAt: bugReport.createdAt.toISOString(),
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new BugReportsRoute();
export const GET = route.handle.bind(route);
export const POST = route.handle.bind(route);

// Other methods are not allowed
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
