import { z } from "zod";
import prisma from "@/lib/database";
import { NextRequest } from "next/server";
import { successResponse, errors } from "@/lib/api/responses";
import { validate } from "@/lib/api/validation";
import { emailClient } from "@/lib/email/client";

// Unsubscribe request schema validation
const unsubscribeRequestSchema = z.object({
    email: z.string().email(),
});

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();
        const validation = validate(unsubscribeRequestSchema, body);

        if (!validation.success) {
            return errors.badRequest('Invalid unsubscribe request', validation.error);
        }

        const { email } = validation.data;

        // Find and update subscriber
        const subscriber = await prisma.waitlistSubscriber.findUnique({
            where: { email }
        });

        if (!subscriber) {
            return errors.notFound('Email not found in waitlist');
        }

        if (subscriber.status === 'UNSUBSCRIBED') {
            return successResponse({
                status: 'ALREADY_UNSUBSCRIBED'
            }, 'Email already unsubscribed from waitlist');
        }

        // Update subscriber status
        await prisma.waitlistSubscriber.update({
            where: { email },
            data: {
                status: 'UNSUBSCRIBED',
                updatedAt: new Date(),
            }
        });

        // Send unsubscribe confirmation email
        const template = emailClient.emailTemplates.waitlistUnsubscribe(email);
        const emailResult = await emailClient.sendEmail({
            to: email,
            ...template
        });

        if (!emailResult.success) {
            console.error('Failed to send unsubscribe confirmation email:', emailResult.error);
            // Don't return error to client as the unsubscribe was successful
        }

        return successResponse({
            status: 'UNSUBSCRIBED'
        }, 'Successfully unsubscribed from waitlist');

    } catch (error: any) {
        console.error("Waitlist unsubscribe error:", error);
        return errors.internal('Failed to process unsubscribe request', error.message);
    }
} 