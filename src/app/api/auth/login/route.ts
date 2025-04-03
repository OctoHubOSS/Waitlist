import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { withTimeout } from '@/lib/api/utils';
import prisma from '@/lib/database';
import { verifyPassword } from '@/lib/auth/server/password';
import { signJwtToken } from '@/lib/auth/server/jwt';

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional().default(false)
});

class LoginRoute extends BaseAuthRoute<z.infer<typeof loginSchema>> {
  constructor() {
    super(loginSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processLogin(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Login request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processLogin(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { email, password, rememberMe } = await this.validateRequest(request);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          password: true,
          role: true,
          status: true,
          emailVerified: true,
          twoFactorEnabled: true
        }
      });

      // If user doesn't exist or password doesn't match
      if (!user || !(await verifyPassword(password, user.password))) {
        // Log failed login attempt
        await this.logAuthAction(
          AuditAction.LOGIN,
          AuditStatus.FAILURE,
          user?.id, // Only log user ID if user exists
          email,
          { reason: !user ? 'user_not_found' : 'invalid_password' },
          request
        );

        return errors.unauthorized('Invalid email or password');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        await this.logAuthAction(
          AuditAction.LOGIN,
          AuditStatus.FAILURE,
          user.id,
          email,
          { reason: 'email_not_verified' },
          request
        );

        return errors.forbidden('Please verify your email before logging in', {
          code: 'EMAIL_NOT_VERIFIED',
          redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
        });
      }

      // Check if account is active
      if (user.status !== 'ACTIVE') {
        await this.logAuthAction(
          AuditAction.LOGIN,
          AuditStatus.FAILURE,
          user.id,
          email,
          { reason: 'account_inactive', status: user.status },
          request
        );

        return errors.forbidden('Your account is not active');
      }

      // Generate session token
      const token = await signJwtToken({
        userId: user.id,
        email: user.email
      }, rememberMe ? '30d' : '24h');

      // Log successful login
      await this.logAuthAction(
        AuditAction.LOGIN,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { rememberMe },
        request
      );

      // Return success with user data
      return successResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        },
        token
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new LoginRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
