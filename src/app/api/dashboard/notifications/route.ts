import { NextRequest } from 'next/server';
import { BaseDashboardRoute } from '@/lib/api/routes/dashboard/base';
import { successResponse, errors } from '@/lib/api/responses';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { z } from 'zod';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

// Schema for marking notifications as read
const markReadSchema = z.object({
    notificationIds: z.array(z.string()).optional(),
    markAll: z.boolean().optional()
});

class NotificationsRoute extends BaseDashboardRoute<z.infer<typeof markReadSchema>> {
    constructor() {
        super(markReadSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            if (request.method.toUpperCase() === 'GET') {
                return await withTimeout(this.getNotifications(request), 5000);
            } else if (request.method.toUpperCase() === 'POST') {
                return await withTimeout(this.markAsRead(request), 5000);
            } else {
                return this.methodNotAllowed(request);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Notifications request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getNotifications(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view your notifications');
            }

            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
            const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

            // Validate pagination params
            if (!this.validatePaginationParams(page, pageSize, 50)) {
                return errors.badRequest('Invalid pagination parameters');
            }

            // Use base class method to get notifications
            const result = await this.getUserNotifications(session.user.id, page, pageSize, unreadOnly);

            // Log this view
            await this.logDashboardActivity(
                AuditAction.ADMIN_ACTION,
                AuditStatus.SUCCESS,
                session.user.id,
                { 
                    action: 'view_notifications',
                    unreadOnly 
                },
                request
            );

            return successResponse(result);
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async markAsRead(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to manage your notifications');
            }

            // Validate request data
            const { notificationIds, markAll = false } = await this.validateRequest(request);

            if (!notificationIds && !markAll) {
                return errors.badRequest('You must specify either notificationIds or markAll=true');
            }

            // Use base class method to mark notifications as read
            const result = await this.markNotificationsAsRead(
                session.user.id, 
                notificationIds
            );

            // Log this action
            await this.logDashboardActivity(
                AuditAction.NOTIFICATION_READ,
                AuditStatus.SUCCESS,
                session.user.id,
                { 
                    notificationIds: notificationIds?.length 
                        ? notificationIds 
                        : 'all',
                    count: result.count
                },
                request
            );

            return successResponse({
                message: 'Notifications marked as read',
                count: result.count
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new NotificationsRoute();
export const GET = route.handle.bind(route);
export const POST = route.handle.bind(route);
