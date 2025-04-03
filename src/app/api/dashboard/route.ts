import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { RequestStatus } from '@prisma/client';
import { AuditAction, AuditStatus } from '@/lib/audit/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';

const dashboardResponseSchema = z.object({
    user: z.object({
        name: z.string(),
        email: z.string(),
        displayName: z.string().nullable(),
        createdAt: z.string(),
    }),
    waitlistPosition: z.number(),
    featureRequestsCount: z.number(),
    unreadNotificationsCount: z.number(),
    recentActivity: z.array(z.object({
        id: z.string(),
        action: z.string(),
        status: z.string(),
        details: z.any(),
        createdAt: z.string(),
    })),
});

class DashboardRoute extends BaseAuthRoute<void, z.infer<typeof dashboardResponseSchema>> {
    constructor() {
        super(z.void());
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            // Use timeout for database operations to prevent long-running requests
            return await withTimeout(this.processRequest(request), 10000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Dashboard data request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processRequest(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                return errors.unauthorized('You must be logged in to view dashboard');
            }

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    subscriber: true,
                    featureRequests: {
                        where: { status: RequestStatus.OPEN },
                        take: 5
                    },
                    notifications: {
                        where: { isRead: false },
                        take: 5
                    },
                    auditLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });

            if (!user) {
                return errors.notFound('User not found');
            }

            // Calculate waitlist position
            const waitlistPosition = await prisma.waitlistSubscriber.count({
                where: {
                    createdAt: {
                        lt: user.subscriber?.createdAt || new Date(),
                    },
                },
            });

            // Log dashboard access
            await this.logAuthAction(
                AuditAction.LOGIN,
                AuditStatus.SUCCESS,
                user.id,
                user.email,
                {
                    clientInfo: {
                        ip: getClientIp(request),
                        userAgent: request.headers.get('user-agent'),
                        referer: request.headers.get('referer'),
                        origin: request.headers.get('origin')
                    }
                }
            );

            const response = {
                user: {
                    name: user.name,
                    email: user.email,
                    displayName: user.displayName,
                    createdAt: user.createdAt.toISOString(),
                },
                waitlistPosition: waitlistPosition + 1,
                featureRequestsCount: user.featureRequests.length,
                unreadNotificationsCount: user.notifications.length,
                recentActivity: user.auditLogs.map(log => ({
                    id: log.id,
                    action: log.action,
                    status: log.status,
                    details: log.details,
                    createdAt: log.createdAt.toISOString(),
                })),
            };

            return successResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new DashboardRoute();
export const GET = route.handle.bind(route);