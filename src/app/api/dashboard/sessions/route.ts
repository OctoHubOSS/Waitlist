import { NextRequest } from 'next/server';
import { BaseDashboardRoute } from '@/lib/api/routes/dashboard/base';
import { successResponse, errors } from '@/lib/api/responses';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { z } from 'zod';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

// Schema for deleting a session
const deleteSessionSchema = z.object({
    sessionId: z.string().min(1)
});

class SessionsRoute extends BaseDashboardRoute<z.infer<typeof deleteSessionSchema>> {
    constructor() {
        super(deleteSessionSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            if (request.method.toUpperCase() === 'GET') {
                return await withTimeout(this.getSessions(request), 5000);
            } else if (request.method.toUpperCase() === 'DELETE') {
                return await withTimeout(this.deleteSession(request), 5000);
            } else {
                return this.methodNotAllowed(request);
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Sessions request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getSessions(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view your sessions');
            }

            // Use the base class method to get sessions
            const sessions = await this.getUserSessions(session.user.id);

            // Log this view in audit log
            await this.logDashboardActivity(
                AuditAction.ADMIN_ACTION,
                AuditStatus.SUCCESS,
                session.user.id,
                { action: 'view_sessions' },
                request
            );

            return successResponse({ sessions });
        } catch (error) {
            return this.handleError(error);
        }
    }

    private async deleteSession(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to manage your sessions');
            }

            // Validate request data
            const { sessionId } = await this.validateRequest(request);

            // Use base class method to terminate session
            const result = await this.terminateSession(sessionId, session.user.id);

            if (result.count === 0) {
                return errors.notFound('Session not found or you do not have permission to delete it');
            }

            // Log session termination
            await this.logDashboardActivity(
                AuditAction.ACCOUNT_UPDATED,
                AuditStatus.SUCCESS,
                session.user.id,
                { 
                    action: 'terminate_session',
                    sessionId 
                },
                request
            );

            return successResponse({
                message: 'Session terminated successfully'
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new SessionsRoute();
export const GET = route.handle.bind(route);
export const DELETE = route.handle.bind(route);