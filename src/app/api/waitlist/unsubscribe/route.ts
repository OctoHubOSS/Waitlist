import { z } from "zod";
import { NextRequest } from "next/server";
import { successResponse, errors } from "@/lib/api/responses";
import { UnsubscribeRequest, WaitlistResponse } from "@/lib/api/types";
import { BaseWaitlistRoute } from "@/lib/api/routes/waitlist/base";
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { withTimeout } from "@/lib/api/utils";

// Unsubscribe request schema validation
const unsubscribeRequestSchema = z.object({
    email: z.string().email(),
}) satisfies z.ZodType<UnsubscribeRequest>;

class UnsubscribeRoute extends BaseWaitlistRoute<UnsubscribeRequest, WaitlistResponse> {
    constructor() {
        super(unsubscribeRequestSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(this.processUnsubscribe(request), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Unsubscribe request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processUnsubscribe(request: NextRequest): Promise<Response> {
        try {
            const { email } = await this.validateRequest(request);

            // Find subscriber
            const subscriber = await this.findSubscriber(email);

            if (!subscriber) {
                return errors.notFound('Email not found in waitlist');
            }

            if (subscriber.status === 'REJECTED') {
                return successResponse<WaitlistResponse>({
                    status: 'REJECTED',
                    subscriber: this.formatSubscriber(subscriber)
                }, 'Email already rejected from waitlist');
            }

            if (subscriber.status === 'REGISTERED') {
                return errors.badRequest('Cannot unsubscribe a registered user. Please contact support if you need assistance.');
            }

            // Update subscriber status
            const updatedSubscriber = await this.updateSubscriberStatus(email, 'REJECTED');

            // Send unsubscribe confirmation email
            await this.sendEmail('unsubscribe', email);

            // Log the unsubscribe action
            await this.logWaitlistActivity(
                AuditAction.UNSUBSCRIBE,
                AuditStatus.SUCCESS,
                email,
                { action: 'unsubscribe', source: 'api' },
                request
            );

            return successResponse<WaitlistResponse>({
                status: 'REJECTED',
                subscriber: this.formatSubscriber(updatedSubscriber)
            }, 'Successfully unsubscribed from waitlist');

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