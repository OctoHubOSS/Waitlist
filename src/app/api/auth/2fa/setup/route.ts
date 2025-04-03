import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/lib/audit/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import prisma from '@/lib/database';
import { withTimeout } from '@/lib/api/utils';
import { generateTOTP } from '@/lib/auth/server/totp';

// Empty request schema because we don't need any inputs to generate TOTP setup
const twoFactorSetupSchema = z.object({});

class TwoFactorSetupRoute extends BaseAuthRoute<z.infer<typeof twoFactorSetupSchema>> {
  constructor() {
    super(twoFactorSetupSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processTwoFactorSetup(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('2FA setup request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processTwoFactorSetup(request: NextRequest): Promise<Response> {
    try {
      // Get current session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return errors.unauthorized('You must be logged in to set up 2FA');
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          twoFactorEnabled: true,
          twoFactorSecret: true
        }
      });

      if (!user) {
        return errors.notFound('User not found');
      }

      // Check if 2FA is already set up
      if (user.twoFactorEnabled) {
        return errors.badRequest('Two-factor authentication is already enabled for this account');
      }

      // Generate new TOTP secret if needed
      const secret = user.twoFactorSecret || await generateTOTP(user.email);

      // If user doesn't have a 2FA secret yet, save it to the database
      if (!user.twoFactorSecret) {
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorSecret: secret.base32 }
        });
      }

      // Log the setup attempt
      await this.logAuthAction(
        AuditAction.TWO_FACTOR_SETUP,
        AuditStatus.SUCCESS,
        user.id,
        user.email,
        { setup: 'initiated' },
        request
      );

      // Return setup information
      return successResponse({
        secret: secret.base32,
        qrCodeUrl: secret.qrCodeUrl,
        otpAuthUrl: secret.otpAuthUrl,
        message: 'Two-factor authentication setup initiated. Please scan the QR code with your authenticator app, then verify a code to enable 2FA.'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new TwoFactorSetupRoute();
export const POST = route.handle.bind(route);
export const GET = route.handle.bind(route);

// Handle unsupported methods
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);