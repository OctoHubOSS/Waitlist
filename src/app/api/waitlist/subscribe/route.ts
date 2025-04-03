import { z } from "zod";
import { NextRequest } from "next/server";
import { successResponse, errors } from "@/lib/api/responses";
import { SubscribeRequest, WaitlistResponse } from "@/lib/api/types";
import { withTimeout, withRetry } from "@/lib/api/utils";
import { AuditLogger } from "@/lib/audit/logger";
import { getClientIp } from "@/lib/client/ip";
import { BaseWaitlistRoute } from "@/lib/api/routes/waitlist/base";
import { AuditAction, AuditStatus } from "@/types/auditLogs";

// Waitlist subscription request schema validation
const subscribeRequestSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
}) satisfies z.ZodType<SubscribeRequest>;

class SubscribeRoute extends BaseWaitlistRoute<SubscribeRequest, WaitlistResponse> {
    constructor() {
        super(subscribeRequestSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            // Process the request with timeout and retry for database operations
            return await withTimeout(
                withRetry(
                    () => this.processSubscription(request),
                    { retries: 2, initialDelay: 500 }
                ),
                5000
            );
        } catch (error) {
            // Log the error
            await AuditLogger.logSystem(
                AuditAction.SYSTEM_ERROR,
                AuditStatus.FAILURE,
                {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    component: 'waitlist-subscribe',
                    ip: getClientIp(request)
                }
            );

            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Subscription request timed out');
            }

            return this.handleError(error);
        }
    }

    private async processSubscription(request: NextRequest): Promise<Response> {
        try {
            const { email, name } = await this.validateRequest(request);
            
            // Check if email already exists
            const existingSubscriber = await this.findSubscriber(email);

            if (existingSubscriber) {
                if (existingSubscriber.status === 'REJECTED') {
                    // Re-subscribe if previously rejected
                    const updatedSubscriber = await this.updateSubscriberStatus(
                        email, 
                        'SUBSCRIBED',
                        { name: name || existingSubscriber.name }
                    );

                    // Send resubscription confirmation email
                    await this.sendEmail('confirmation', email);

                    // Log the subscription
                    await this.logWaitlistActivity(
                        AuditAction.SUBSCRIBE,
                        AuditStatus.SUCCESS,
                        email,
                        { action: 'resubscribe' },
                        request
                    );

                    return successResponse<WaitlistResponse>({
                        status: 'SUBSCRIBED',
                        subscriber: this.formatSubscriber(updatedSubscriber)
                    }, 'Successfully re-subscribed to waitlist');
                }

                if (existingSubscriber.status === 'SUBSCRIBED') {
                    return errors.conflict('Email already subscribed to waitlist');
                }

                if (existingSubscriber.status === 'INVITED') {
                    return errors.conflict('Email has been invited to join. Please check your email for the invitation.');
                }

                if (existingSubscriber.status === 'REGISTERED') {
                    return errors.conflict('Email is already registered as a user.');
                }
            }

            // Create new subscriber
            const subscriber = await this.createSubscriber(email, name);

            // Send confirmation email
            await this.sendEmail('confirmation', email);

            // Log the subscription
            await this.logWaitlistActivity(
                AuditAction.SUBSCRIBE,
                AuditStatus.SUCCESS,
                email,
                { action: 'new-subscribe' },
                request
            );

            return successResponse<WaitlistResponse>({
                status: 'SUBSCRIBED',
                subscriber: this.formatSubscriber(subscriber)
            }, 'Successfully subscribed to waitlist');
            
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new SubscribeRoute();

// Explicitly bind to POST method and export
export const POST = route.bindToMethod('POST');

// Handle invalid methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);