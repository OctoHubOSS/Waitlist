import { NextRequest } from "next/server";
import { z } from "zod";
import { BaseAuthRoute } from "@/lib/api/routes/auth/base";
import { successResponse, errors } from "@/lib/api/responses";
import { sendPasswordResetEmail } from "@/lib/email/account";
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { withTimeout } from '@/lib/api/utils';
import { appUrl } from '@/utils/urlBuilder';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

class ForgotPasswordRoute extends BaseAuthRoute<z.infer<typeof forgotPasswordSchema>> {
  constructor() {
    super(forgotPasswordSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processForgotPassword(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Password reset request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processForgotPassword(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { email } = await this.validateRequest(request);

      // Validate required fields
      if (!email) {
        return errors.badRequest("Email is required");
      }

      // Find user
      const user = await this.validateUser(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return successResponse({ 
          message: "If an account exists with this email, password reset instructions will be sent." 
        });
      }

      // Create reset URL using the URL builder utility
      const resetUrl = appUrl(`/auth/reset-password`, { email: encodeURIComponent(email) });

      // Send password reset email
      await sendPasswordResetEmail({
        name: user.name,
        email: user.email,
        resetUrl,
        expiresIn: '1 hour'
      });

      // Log the password reset request
      await this.logAuthAction(
        AuditAction.PASSWORD_RESET,
        AuditStatus.SUCCESS,
        user.id,
        email,
        { source: 'forgot-password-form' },
        request
      );

      return successResponse({ 
        message: "If an account exists with this email, password reset instructions will be sent." 
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new ForgotPasswordRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);