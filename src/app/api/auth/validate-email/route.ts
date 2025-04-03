import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { withTimeout } from '@/lib/api/utils';

// Validation schema
const validateEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

class ValidateEmailRoute extends BaseAuthRoute<z.infer<typeof validateEmailSchema>> {
  constructor() {
    super(validateEmailSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withTimeout(this.processValidation(request), 5000);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        return errors.timeout('Email validation request timed out');
      }
      return this.handleError(error);
    }
  }

  private async processValidation(request: NextRequest): Promise<Response> {
    try {
      let email: string;
      
      // Handle both GET and POST methods
      if (request.method === 'GET') {
        email = request.nextUrl.searchParams.get('email') || '';
      } else {
        const data = await this.validateRequest(request);
        email = data.email;
      }

      // Validate required fields
      if (!email) {
        return errors.badRequest('Email is required');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return successResponse({ needsVerification: false });
      }

      // Check if email is already verified
      // The emailVerified field will be null for unverified emails
      // and a valid date for verified emails
      if (user.emailVerified) {
        try {
          const verifiedDate = new Date(user.emailVerified);
          if (!isNaN(verifiedDate.getTime())) {
            return successResponse({ needsVerification: false });
          }
        } catch (e) {
          // If we can't parse the date, treat it as unverified
          console.error('Error parsing emailVerified date:', e);
        }
      }

      // If we get here, either:
      // 1. emailVerified is null
      // 2. emailVerified is an invalid date
      // 3. emailVerified couldn't be parsed
      // In all these cases, the email needs verification
      return successResponse({ needsVerification: true });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new ValidateEmailRoute();
export const GET = route.handle.bind(route);
export const POST = route.handle.bind(route);

// Handle unsupported methods
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);