import { NextRequest } from 'next/server';
import { BaseDashboardRoute } from '@/lib/api/routes/dashboard/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

class DashboardRoute extends BaseDashboardRoute {
    constructor() {
        super();
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(this.getDashboardOverview(request), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Dashboard request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getDashboardOverview(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to access the dashboard');
            }

            const userId = session.user.id;

            // Get dashboard stats (using our base class method)
            const stats = await this.getDashboardStats(userId);

            // Get user's recent activity
            const recentActivity = await this.getUserRecentActivity(userId, 5);

            // Get unread notifications count
            const unreadNotifications = await prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            });

            // Get recent bug reports
            const recentBugReports = await prisma.bugReport.findMany({
                where: {},
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });

            // Get recent feature requests
            const recentFeatureRequests = await prisma.featureRequest.findMany({
                where: {},
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });

            // Log this dashboard access
            await this.logDashboardActivity(
                AuditAction.ADMIN_ACTION,
                AuditStatus.SUCCESS,
                userId,
                { action: 'view_dashboard' },
                request
            );

            return successResponse({
                stats,
                recentActivity,
                unreadNotifications,
                recentBugReports: recentBugReports.map(report => ({
                    id: report.id,
                    title: report.title,
                    status: report.status,
                    severity: report.severity,
                    createdAt: report.createdAt.toISOString(),
                    authorName: report.author.name,
                    comments: report._count.comments
                })),
                recentFeatureRequests: recentFeatureRequests.map(request => ({
                    id: request.id,
                    title: request.title,
                    status: request.status,
                    createdAt: request.createdAt.toISOString(),
                    authorName: request.author.name,
                    comments: request._count.comments
                }))
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new DashboardRoute();
export const GET = route.handle.bind(route);