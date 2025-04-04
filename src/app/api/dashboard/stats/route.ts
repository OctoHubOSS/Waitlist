import { NextRequest } from 'next/server';
import { BaseDashboardRoute } from '@/lib/api/routes/dashboard/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

class DashboardStatsRoute extends BaseDashboardRoute {
    constructor() {
        super();
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(this.getStats(request), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Dashboard stats request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getStats(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to access dashboard stats');
            }

            const userId = session.user.id;

            // Get basic dashboard stats
            const stats = await this.getDashboardStats(userId);

            // Get bug report stats
            const bugReportCountsByStatus = await prisma.bugReport.groupBy({
                by: ['status'],
                _count: true
            });

            const bugReportCountsBySeverity = await prisma.bugReport.groupBy({
                by: ['severity'],
                _count: true
            });

            // Get feature request stats
            const featureRequestCountsByStatus = await prisma.featureRequest.groupBy({
                by: ['status'],
                _count: true
            });

            // Format the response
            return successResponse({
                ...stats,
                bugReports: {
                    total: await prisma.bugReport.count(),
                    byStatus: Object.fromEntries(
                        bugReportCountsByStatus.map(item => [item.status, item._count])
                    ),
                    bySeverity: Object.fromEntries(
                        bugReportCountsBySeverity.map(item => [item.severity, item._count])
                    ),
                    userSubmitted: await prisma.bugReport.count({
                        where: { authorId: userId }
                    })
                },
                featureRequests: {
                    total: await prisma.featureRequest.count(),
                    byStatus: Object.fromEntries(
                        featureRequestCountsByStatus.map(item => [item.status, item._count])
                    ),
                    userSubmitted: await prisma.featureRequest.count({
                        where: { authorId: userId }
                    })
                }
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new DashboardStatsRoute();
export const GET = route.handle.bind(route);
