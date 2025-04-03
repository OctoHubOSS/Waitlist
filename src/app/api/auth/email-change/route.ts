import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { generateVerificationCode } from '@/lib/email/verification/code';
import { sendEmail } from '@/lib/email/client';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

// Email change request schema
const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
});

class EmailChangeRoute extends BaseAuthRoute<z.infer<typeof emailChangeSchema>> {
  constructor() {
    super(emailChangeSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processEmailChange(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Email change request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processEmailChange(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { newEmail } = await this.validateRequest(request);

      // Get current session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return errors.unauthorized('You must be logged in to change your email');
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
        select: {e,
          id: true,
          email: true,
          name: true,
          displayName: true
        }
      });      if (!user) {

      if (!user) {
        return errors.notFound('User not found');
      }      // Check if new email is same as current
l.toLowerCase()) {
      // Check if new email is same as current
      if (user.email.toLowerCase() === newEmail.toLowerCase()) {
        return errors.badRequest('New email address must be different from current email');
      }      // Check if new email already exists

      // Check if new email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      });      if (existingUser) {

      if (existingUser) {
        return errors.conflict('Email address is already in use');
      }      // Generate verification code

      // Generate verification code
      const code = generateVerificationCode();      // Store email change request

      // Store email change request
      await prisma.emailChange.create({d: user.id,
        data: {
          userId: user.id,
          currentEmail: user.email,ionCode: code,
          newEmail,
          verificationCode: code,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });      // Send verification email

      // Send verification email to the new address
      await this.sendEmailChangeConfirmation(user, newEmail, code);      currentEmail: user.email,

      // Log the email change request
      await this.logAuthAction(
        AuditAction.EMAIL_CHANGE,
        AuditStatus.SUCCESS,
        user.id,e request
        user.email,thAction(
        { 
          action: 'request',
          newEmail 
        },
        request{ 
      );          action: 'request',

      return successResponse({
        message: 'Email change requested. Please check your new email for verification instructions.'equest
      });
    } catch (error) {
      return this.handleError(error);
    }.'
  }      });

  /**
   * Send email change confirmation email
   */
  private async sendEmailChangeConfirmation(
    user: { name?: string; displayName?: string; email: string },
    newEmail: string,rification code
    code: string
  ): Promise<void> {
    const name = user.name || user.displayName || 'User';ng(2, 8).toUpperCase();
    const baseUrl = absoluteUrl();
    const confirmUrl = `${baseUrl}/auth/confirm-email?email=${encodeURIComponent(newEmail)}&code=${code}`;
    
    await sendEmail({
      to: newEmail,
      subject: 'Confirm your new email address',
      html: `
        <p>Hello ${name},</p>
        <p>We received a request to change your email address to this one.</p>
        <p>Please use the following code to confirm this change: <strong>${code}</strong></p>
        <p>Or click this link: <a href="${confirmUrl}">Confirm Email Change</a></p>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't request this change, please ignore this email or contact support.</p>
      `,
    });
  }
}

const emailChangeRoute = new EmailChangeRoute();
export const POST = emailChangeRoute.handle.bind(emailChangeRoute);

// Email change confirmation schema
const confirmEmailChangeSchema = z.object({
  code: z.string().min(6, 'Verification code is required'),
  newEmail: z.string().email()
});

class ConfirmEmailChangeRoute extends BaseAuthRoute<z.infer<typeof confirmEmailChangeSchema>> {
  constructor() {
    super(confirmEmailChangeSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processConfirmEmailChange(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Email change confirmation timed out');
      }
      return this.handleError(error);
    }
  }

  private async processConfirmEmailChange(request: NextRequest): Promise<Response> {
    try {
      // Validate request data
      const { code, newEmail } = await this.validateRequest(request);

      // Check for pending email change
      const emailChange = await prisma.emailChange.findFirst({
        where: {
          newEmail,
          verificationCode: code,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      if (!emailChange) {
        return errors.badRequest('Invalid or expired verification code');
      }

      // Update user's email in a transaction
      await prisma.$transaction(async (tx) => {
        // Update user email
        await tx.user.update({
          where: { id: emailChange.userId },
          data: {
            email: newEmail,
            emailVerified: new Date()
          }
        });

        // Delete all pending email changes for this user
        await tx.emailChange.deleteMany({
          where: { userId: emailChange.userId }
        });
      });

      // Log successful email change
      await this.logAuthAction(
        AuditAction.EMAIL_CHANGE,
        AuditStatus.SUCCESS,
        emailChange.userId,
        newEmail,
        { 
          action: 'confirmed',
          previousEmail: emailChange.currentEmail
        },
        request
      );

      return successResponse({
        message: 'Email address has been successfully changed',
        redirectTo: '/auth/login?email_changed=true'
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const confirmRoute = new ConfirmEmailChangeRoute();
export const PUT = confirmRoute.handle.bind(confirmRoute);

// Handle unsupported methods
export const GET = emailChangeRoute.methodNotAllowed.bind(emailChangeRoute);
export const DELETE = emailChangeRoute.methodNotAllowed.bind(emailChangeRoute);
export const PATCH = emailChangeRoute.methodNotAllowed.bind(emailChangeRoute);