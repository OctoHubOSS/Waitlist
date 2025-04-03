import { z } from "zod";
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api/responses";
import { BaseWaitlistRoute } from "@/lib/api/routes/waitlist/base";
import { withTimeout } from "@/lib/api/utils";

// Check request schema validation
const checkRequestSchema = z.object({
    email: z.string().email(),
});

class CheckRoute extends BaseWaitlistRoute<z.infer<typeof checkRequestSchema>> {
    constructor() {
        super(checkRequestSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(this.processCheck(request), 3000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return successResponse({
                    isSubscriber: false,
                    message: "Request timed out. Please try again later."
                });
            }
            return this.handleError(error);
        }
    }

    private async processCheck(request: NextRequest): Promise<Response> {
        try {
            const { email } = await this.validateRequest(request);

            // Check if email is in waitlist
            const subscriber = await this.findSubscriber(email);

            if (!subscriber) {
                return successResponse({
                    isSubscriber: false,
                    message: "Please subscribe to the waitlist first"
                });
            }

            // Return appropriate message based on status
            switch (subscriber.status) {
                case 'SUBSCRIBED':
                    return successResponse({
                        isSubscriber: true,
                        status: 'SUBSCRIBED',
                        message: "Email found in waitlist"
                    });
                case 'INVITED':
                    return successResponse({
                        isSubscriber: true,
                        status: 'INVITED',
                        message: "You have been invited to join. Please check your email for the invitation."
                    });
                case 'REGISTERED':
                    return successResponse({
                        isSubscriber: true,
                        status: 'REGISTERED',
                        message: "Email is already registered as a user."
                    });
                case 'REJECTED':
                    return successResponse({
                        isSubscriber: false,
                        status: 'REJECTED',
                        message: "Email was previously unsubscribed from the waitlist."
                    });
                default:
                    return successResponse({
                        isSubscriber: false,
                        message: "Unknown waitlist status"
                    });
            }
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new CheckRoute();
export const POST = route.handle.bind(route);

// Handle invalid methods
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);