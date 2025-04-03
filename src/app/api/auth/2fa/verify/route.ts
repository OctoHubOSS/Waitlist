import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import prisma from '@/lib/database';
import { verifyTOTP } from '@/lib/auth/server/totp';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { successResponse, errors } from '@/lib/api/responses';
import { withTimeout } from '@/lib/api/utils';
import { signJwtToken } from '@/lib/auth/server/jwt';

const twoFactorVerifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(6).max(6),
  rememberMe: z.boolean().optional().default(false)
});

class TwoFactorVerifyRoute extends BaseAuthRoute<z.infer<typeof twoFactorVerifySchema>> {
  constructor() {
    super(twoFactorVerifySchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processVerifyTwoFactor(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('2FA verification request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processVerifyTwoFactor(request: NextRequest): Promise<Response> {
    try {
      // Validate the request data
      const { email, code, rememberMe } = await this.validateRequest(request);

      // Get user data
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          role: true,
          twoFactorEnabled: true,
          twoFactorSecret: true
        }
      });

      if (!user) {
        return errors.notFound('User not found');
      }

      // Check if 2FA is enabled
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return errors.badRequest('Two-factor authentication is not enabled for this account');
      }

      // Verify TOTP code
      const isValid = verifyTOTP(user.twoFactorSecret, code);
      if (!isValid) {
        // Log failed attempt
        await this.logAuthAction(
          AuditAction.TWO_FACTOR_VERIFICATION,
          AuditStatus.FAILURE,
          user.id,
          email,
          { reason: 'invalid_code' },
          request
        );

        return errors.badRequest('Invalid verification code');
      }

      // Generate session token with 2FA flag
      const token = await signJwtToken({
        userId: user.id,
        email: user.email,
        twoFactorVerified: true
      }, rememberMe ? '30d' : '24h');

      // Log successful verification
      await this.logAuthAction(
        AuditAction.TWO_FACTOR_VERIFICATION,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { rememberMe },
        request
      );

      return successResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          role: user.role
        },
        token,
        message: '2FA verification successful'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new TwoFactorVerifyRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);