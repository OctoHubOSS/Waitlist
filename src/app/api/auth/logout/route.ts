import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { withTimeout } from '@/lib/api/utils';

// Empty schema since logout doesn't require any data
const logoutSchema = z.object({});

class LogoutRoute extends BaseAuthRoute<z.infer<typeof logoutSchema>> {
  constructor() {
    super(logoutSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processLogout(request), 3000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Logout request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processLogout(request: NextRequest): Promise<Response> {
    try {
      // Get the current session
      const session = await getServerSession(authOptions);
      
      // Log the logout action if there was a session
      if (session?.user) {
        await this.logAuthAction(
          AuditAction.LOGOUT,
          AuditStatus.SUCCESS,
          session.user.id as string,
          session.user.email as string,
          { source: 'api' },
          request
        );
      }

      // Return success response
      return successResponse({
        message: 'Successfully logged out',
        redirectTo: '/auth/login'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new LogoutRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
