import { NextRequest } from "next/server";
import { successResponse, errors } from "@/lib/api/responses";
import prisma from "@/lib/database";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return errors.badRequest("Email is required");
        }

        // Check if email is in waitlist
        const subscriber = await prisma.waitlistSubscriber.findUnique({
            where: { email }
        });

        if (!subscriber) {
            return successResponse({
                isSubscriber: false,
                message: "Please subscribe to the waitlist first"
            });
        }

        if (subscriber.status !== "SUBSCRIBED") {
            return successResponse({
                isSubscriber: false,
                message: "Your waitlist subscription is not active"
            });
        }

        return successResponse({
            isSubscriber: true,
            message: "Email found in waitlist"
        });
    } catch (error: any) {
        console.error("Waitlist check error:", error);
        return errors.internal(
            "Failed to check waitlist status",
            error.message
        );
    }
} 