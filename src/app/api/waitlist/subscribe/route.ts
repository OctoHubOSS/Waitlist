import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseWaitlistRoute } from '@/lib/api/routes/waitlist/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { withRetry } from '@/lib/api/utils';
import { WaitlistStatus } from '@prisma/client';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  referralCode: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

class SubscribeRoute extends BaseWaitlistRoute<z.infer<typeof subscribeSchema>> {
  constructor() {
    super(subscribeSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      return await withRetry(() => this.processSubscription(request), {
        maxRetries: 3,
        retryDelay: 500,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async processSubscription(request: NextRequest): Promise<Response> {
    try {
      const data = await this.validateRequest(request);
      const { email, name, referralCode, source, metadata = {} } = data;

      // Check if this is a duplicate email - key fix to avoid the unique constraint error
      const existingSubscriber = await this.findSubscriber(email);
      
      if (existingSubscriber) {
        // If the user is already subscribed, return a success response
        if (existingSubscriber.status === 'SUBSCRIBED') {
          return successResponse({
            message: 'You are already subscribed to the waitlist!',
            alreadySubscribed: true,
            subscriber: this.formatSubscriber(existingSubscriber),
          });
        }
        
        // If the user was previously unsubscribed, resubscribe them
        if (existingSubscriber.status === 'UNSUBSCRIBED' || existingSubscriber.status === 'BOUNCED') {
          // Update the subscriber to resubscribe them
          const updatedSubscriber = await prisma.waitlistSubscriber.update({
            where: { email },
            data: {
              status: WaitlistStatus.SUBSCRIBED,
              name: name || existingSubscriber.name, // Keep existing name if new one not provided
              updatedAt: new Date(),
              source: source || existingSubscriber.source,
              metadata: {
                ...(existingSubscriber.metadata as Record<string, any> || {}),
                ...metadata,
                resubscribedAt: new Date().toISOString(),
              },
            },
          });

          // Log the resubscribe
          await this.logWaitlistActivity({
            action: 'WAITLIST_STATUS_CHANGED',
            status: 'SUCCESS',
            email,
            details: {
              oldStatus: existingSubscriber.status,
              newStatus: 'SUBSCRIBED',
              isResubscribe: true,
            },
            request,
          });

          // Send confirmation email
          await this.sendEmail('confirmation', email);

          return successResponse({
            message: 'Welcome back to the waitlist!',
            resubscribed: true,
            subscriber: this.formatSubscriber(updatedSubscriber),
          });
        }
      }

      // Handle referral code
      if (referralCode) {
        const referrer = await prisma.waitlistSubscriber.findUnique({
          where: { referralCode },
        });

        if (referrer) {
          // Increment the referrer's count
          await prisma.waitlistSubscriber.update({
            where: { id: referrer.id },
            data: {
              referralCount: { increment: 1 },
            },
          });

          // Create new subscriber with referral info
          const subscriber = await prisma.waitlistSubscriber.create({
            data: {
              email,
              name,
              status: WaitlistStatus.SUBSCRIBED,
              source: source || 'referral',
              referredBy: referrer.id,
              metadata: {
                ...metadata,
                referralSource: true,
                referralDate: new Date().toISOString(),
              },
            },
          });

          // Log the subscription with referral
          await this.logWaitlistActivity({
            action: 'WAITLIST_JOINED',
            status: 'SUCCESS',
            email,
            details: {
              referredBy: referrer.email,
              source: source || 'referral',
            },
            request,
          });

          // Send confirmation email
          await this.sendEmail('confirmation', email);

          return successResponse({
            message: 'Successfully joined the waitlist via referral!',
            subscriber: this.formatSubscriber(subscriber),
          });
        }
      }

      // Create new subscriber
      const subscriber = await prisma.waitlistSubscriber.create({
        data: {
          email,
          name,
          status: WaitlistStatus.SUBSCRIBED,
          source: source || 'direct',
          metadata: metadata,
        },
      });

      // Log the subscription
      await this.logWaitlistActivity({
        action: 'WAITLIST_JOINED',
        status: 'SUCCESS',
        email,
        details: {
          source: source || 'direct',
        },
        request,
      });

      // Send confirmation email
      await this.sendEmail('confirmation', email);

      return successResponse({
        message: 'Successfully joined the waitlist!',
        subscriber: this.formatSubscriber(subscriber),
      });
    } catch (error) {
      // Handle Prisma errors properly
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        // This shouldn't happen now with our existingSubscriber check, but just in case
        return errors.conflict('This email is already on the waitlist');
      }
      
      return this.handleError(error);
    }
  }
}

const route = new SubscribeRoute();
export const POST = route.handle.bind(route);

// Handle invalid methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);