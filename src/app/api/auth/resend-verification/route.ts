import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { withTimeout } from '@/lib/api/utils';
import { sendVerificationEmail } from '@/lib/email/account';
import { generateVerificationCode, deleteVerificationRecords, createVerificationRecord } from '@/lib/email/verification/code';

// Resend verification schema
const resendVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

class ResendVerificationRoute extends BaseAuthRoute<z.infer<typeof resendVerificationSchema>> {
  constructor() {
    super(resendVerificationSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processResendVerification(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Verification email request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processResendVerification(request: NextRequest): Promise<Response> {
    try {
      // Extract and validate email
      const { email } = await this.validateRequest(request);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          emailVerified: true,
          status: true
        }
      });

      // For security, don't reveal if email exists or not
      if (!user) {
        // Return success but don't actually send an email
        return successResponse({
          message: 'If an account exists with this email, a verification link has been sent.',
          redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
        });
      }

      // Check if email is already verified
      if (user.emailVerified) {
        // Log the redundant verification attempt
        await this.logAuthAction(
          AuditAction.EMAIL_VERIFICATION,
          AuditStatus.WARNING,
          user.id,
          email,
          { reason: 'already_verified' },
          request
        );

        return successResponse({
          message: 'Your email is already verified. Please log in.',
          redirectTo: '/auth/login'
        });
      }

      // Delete any existing verification records for this email
      await deleteVerificationRecords(email, 'email');

      // Generate a new verification code
      const code = generateVerificationCode();
      
      // Store the code in the database
      await createVerificationRecord(email, code, 'email', user.id);

      // Generate verification URL
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`;

      // Send verification email
      await sendVerificationEmail({
        name: user.name || user.displayName || '',
        email: user.email,
        code,
        verifyUrl,
        expiresIn: '24 hours'
      });

      // Log the resend verification
      await this.logAuthAction(
        AuditAction.EMAIL_VERIFICATION,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { action: 'resend' },
        request
      );

      return successResponse({
        message: 'Verification email has been sent.',
        redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new ResendVerificationRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);