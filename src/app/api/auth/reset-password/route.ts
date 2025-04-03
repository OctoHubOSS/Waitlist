import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { hashPassword } from '@/lib/auth/server/password';
import prisma from '@/lib/database';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { withTimeout } from '@/lib/api/utils';

const resetPasswordSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

class ResetPasswordRoute extends BaseAuthRoute<z.infer<typeof resetPasswordSchema>> {
  constructor() {
    super(resetPasswordSchema);
  }

  async handle(request: NextRequest) {
    try {
      return await withTimeout(this.processResetPassword(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Password reset request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processResetPassword(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { code, email, password } = await this.validateRequest(request);

      // Verify the code
      const result = await this.validateVerificationCode(email, code, 'password');
      if (!result.success) {
        return errors.badRequest(result.error || 'Invalid verification code');
      }

      // Find user
      const user = await this.validateUser(email);
      if (!user) {
        return errors.badRequest('Invalid reset attempt');
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update the user's password
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          // Also ensure account is active after password reset
          status: 'ACTIVE'
        },
      });

      // Log the password reset
      await this.logAuthAction(
        AuditAction.PASSWORD_RESET,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { source: 'reset-password-form' },
        request
      );

      return successResponse({ 
        message: 'Password reset successful',
        redirectTo: '/auth/login?reset=success'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new ResetPasswordRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);