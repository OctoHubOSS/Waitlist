import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { withTimeout } from '@/lib/api/utils';
import { sendWelcomeEmail } from '@/lib/email/account';
import prisma from '@/lib/database';

// Email verification schema
const verifyEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(6, 'Verification code must be at least 6 characters')
});

class VerifyEmailRoute extends BaseAuthRoute<z.infer<typeof verifyEmailSchema>> {
  constructor() {
    super(verifyEmailSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processVerification(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Email verification request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processVerification(request: NextRequest): Promise<Response> {
    try {
      // Validate request data (supports both POST and GET)
      let email: string, code: string;
      
      if (request.method === 'GET') {
        const url = new URL(request.url);
        const params = {
          email: url.searchParams.get('email') || '',
          code: url.searchParams.get('code') || ''
        };
        // We don't access this.schema directly, but use validateRequest
        // with an object containing the right properties
        const validatedData = await this.validateRequest({
          ...request,
          json: () => Promise.resolve(params)
        } as NextRequest);
        
        email = validatedData.email;
        code = validatedData.code;
      } else {
        // For POST, parse JSON body
        const data = await this.validateRequest(request);
        email = data.email;
        code = data.code;
      }

      // Find user
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

      if (!user) {
        // Fix: Use proper error response
        return errors.notFound('User not found');
      }

      // Check if already verified
      if (user.emailVerified) {
        return successResponse({
          message: 'Email already verified',
          redirectTo: '/auth/login?verified=true'
        });
      }

      // Verify the code
      const result = await this.validateVerificationCode(email, code, 'email');
      if (!result.success) {
        // Log failed verification
        await this.logAuthAction(
          AuditAction.EMAIL_VERIFICATION,
          AuditStatus.FAILURE,
          user.id,
          email,
          { error: result.error },
          request
        );
        
        // Fix: Use proper error format
        return errors.badRequest(result.error || 'Invalid verification code');
      }

      // Update user in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          status: 'ACTIVE'
        }
      });

      // Send welcome email
      await sendWelcomeEmail({
        name: user.name,
        displayName: user.displayName,
        email: user.email
      });

      // Log successful verification
      await this.logAuthAction(
        AuditAction.EMAIL_VERIFICATION,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { method: 'code' },
        request
      );

      return successResponse({
        message: 'Email successfully verified',
        redirectTo: '/auth/login?verified=true'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new VerifyEmailRoute();
export const POST = route.handle.bind(route);
export const GET = route.handle.bind(route);

// Handle unsupported methods
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
