import { NextRequest } from "next/server";
import { z } from "zod";
import { BaseAuthRoute } from "@/lib/api/routes/auth/base";
import { successResponse, errors } from "@/lib/api/responses";
import prisma from "@/lib/database";
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { sendVerificationEmail } from "@/lib/email/account";
import { hashPassword } from '@/lib/auth/server/password';
import { withTimeout } from '@/lib/api/utils';
import { appUrl } from '@/utils/urlBuilder';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

class RegisterRoute extends BaseAuthRoute<z.infer<typeof registerSchema>> {
  constructor() {
    super(registerSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processRegistration(request), 10000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Registration request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processRegistration(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { name, displayName, email, password } = await this.validateRequest(request);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return errors.conflict('Email already registered');
      }

      // Check if this email is in the waitlist
      const waitlistCheck = await this.checkWaitlistStatus(email);
      if (!waitlistCheck.isSubscriber) {
        return errors.forbidden('You need to join the waitlist before registering');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          displayName,
          email,
          password: hashedPassword,
          status: 'INACTIVE',
          role: 'MEMBER',
          subscriber: {
            connect: {
              email
            }
          }
        }
      });

      // Generate verification code
      const code = this.generateVerificationCode();
      
      // Use our enhanced URL builder to create the verification URL
      const verifyUrl = appUrl(`/auth/verify-email`, { 
        email: encodeURIComponent(email), 
        code 
      });

      // Send verification email
      await sendVerificationEmail({
        name,
        email,
        code,
        verifyUrl,
        expiresIn: '24 hours'
      });

      // Log the registration
      await this.logAuthAction(
        AuditAction.REGISTER,
        AuditStatus.SUCCESS,
        user.id,
        email,
        {
          registrationMethod: 'email',
          verificationCode: code
        },
        request
      );

      return successResponse({
        message: 'Registration successful. Please check your email to verify your account.',
        redirectTo: `/auth/verify-email?email=${encodeURIComponent(email)}`
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check waitlist status for an email
   */
  private async checkWaitlistStatus(email: string): Promise<{ isSubscriber: boolean }> {
    try {
      const subscriber = await prisma.waitlistSubscriber.findUnique({
        where: { email }
      });

      if (!subscriber) {
        return { isSubscriber: false };
      }

      if (subscriber.status !== "SUBSCRIBED" && subscriber.status !== "INVITED") {
        return { isSubscriber: false };
      }

      return { isSubscriber: true };
    } catch (error) {
      console.error("Error checking waitlist status:", error);
      return { isSubscriber: false };
    }
  }

  /**
   * Generate a verification code
   */
  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

const route = new RegisterRoute();
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
