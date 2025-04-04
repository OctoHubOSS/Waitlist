import { z } from "zod";
import { NextRequest } from "next/server";
import { successResponse, errors } from "@/lib/api/responses";
import { BaseWaitlistRoute } from "@/lib/api/routes/waitlist/base";
import { WaitlistStatus } from '@prisma/client';
import prisma from '@/lib/database';

const unsubscribeSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

class UnsubscribeRoute extends BaseWaitlistRoute<z.infer<typeof unsubscribeSchema>> {
  constructor() {
    super(unsubscribeSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      const data = await this.validateRequest(request);
      const { email, reason } = data;

      const subscriber = await prisma.waitlistSubscriber.findUnique({
        where: { email },
      });

      if (!subscriber) {
        return errors.notFound('Subscriber not found');
      }

      await prisma.waitlistSubscriber.update({
        where: { email },
        data: {
          status: WaitlistStatus.UNSUBSCRIBED,
          updatedAt: new Date(),
          ...(reason && {
            metadata: {
              ...(subscriber.metadata as Record<string, any> || {}),
              unsubscribeReason: reason,
              unsubscribedAt: new Date().toISOString(),
            },
          }),
        },
      });

      await this.logWaitlistActivity({
        action: 'WAITLIST_STATUS_CHANGED',
        status: 'SUCCESS',
        email,
        details: {
          oldStatus: subscriber.status,
          newStatus: WaitlistStatus.UNSUBSCRIBED,
          reason,
        },
        request,
      });

      return successResponse({
        message: 'Successfully unsubscribed from the waitlist',
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

const route = new UnsubscribeRoute();
export const POST = route.handle.bind(route);

// Handle invalid methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);