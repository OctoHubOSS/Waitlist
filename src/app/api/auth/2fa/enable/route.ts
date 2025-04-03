import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import prisma from '@/lib/database';
import { verifyTOTP } from '@/lib/auth/server/totp';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { successResponse, errors } from '@/lib/api/responses';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';

const twoFactorEnableSchema = z.object({
  code: z.string().min(6).max(6)
});

class TwoFactorEnableRoute extends BaseAuthRoute<z.infer<typeof twoFactorEnableSchema>> {
  constructor() {
    super(twoFactorEnableSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processEnableTwoFactor(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('2FA enable request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processEnableTwoFactor(request: NextRequest): Promise<Response> {
    try {
      // Validate the request data
      const { code } = await this.validateRequest(request);

      // Get current session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return errors.unauthorized('You must be logged in to enable 2FA');
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true,
          twoFactorSecret: true
        }
      });

      if (!user) {
        return errors.notFound('User not found');
      }

      // Check if 2FA is already enabled
      if (user.twoFactorEnabled) {
        return errors.badRequest('Two-factor authentication is already enabled');
      }

      // Check if user has a 2FA secret
      if (!user.twoFactorSecret) {
        return errors.badRequest('Two-factor setup not initiated. Please set up 2FA first.');
      }

      // Verify TOTP code
      const isValid = verifyTOTP(user.twoFactorSecret, code);
      if (!isValid) {
        // Log failed attempt
        await this.logAuthAction(
          AuditAction.TWO_FACTOR_SETUP,
          AuditStatus.FAILURE,
          user.id,
          user.email,
          { reason: 'invalid_code' },
          request
        );

        return errors.badRequest('Invalid verification code');
      }

      // Enable 2FA
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true }
      });

      // Log successful 2FA setup
      await this.logAuthAction(
        AuditAction.TWO_FACTOR_SETUP,
        AuditStatus.SUCCESS,
        user.id,
        user.email,
        { action: 'enabled' },
        request
      );

      return successResponse({
        message: 'Two-factor authentication has been enabled successfully'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new TwoFactorEnableRoute();
export const POST = route.handle.bind(route);

// Handle 2FA disable
const twoFactorDisableSchema = z.object({});

class TwoFactorDisableRoute extends BaseAuthRoute<z.infer<typeof twoFactorDisableSchema>> {
  constructor() {
    super(twoFactorDisableSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processDisableTwoFactor(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('2FA disable request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processDisableTwoFactor(request: NextRequest): Promise<Response> {
    try {
      // Get current session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return errors.unauthorized('You must be logged in to disable 2FA');
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          twoFactorEnabled: true
        }
      });

      if (!user) {
        return errors.notFound('User not found');
      }

      // Check if 2FA is already disabled
      if (!user.twoFactorEnabled) {
        return errors.badRequest('Two-factor authentication is not enabled');
      }

      // Disable 2FA - keep the secret but disable the flag
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: false }
      });

      // Log 2FA disable
      await this.logAuthAction(
        AuditAction.TWO_FACTOR_SETUP,
        AuditStatus.SUCCESS,
        user.id,
        user.email,
        { action: 'disabled' },
        request
      );

      return successResponse({
        message: 'Two-factor authentication has been disabled successfully'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const disableRoute = new TwoFactorDisableRoute();
export const DELETE = disableRoute.handle.bind(disableRoute);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);