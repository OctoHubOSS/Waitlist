import { z } from "zod";
import prisma from "@/lib/database";
import { NextRequest } from "next/server";
import { emailClient } from "@/lib/email/client";
import { successResponse, errors } from "@/lib/api/responses";
import { validate } from "@/lib/api/validation";

// Waitlist subscription request schema validation
const subscribeRequestSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    source: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();
        const validation = validate(subscribeRequestSchema, body);

        if (!validation.success) {
            return errors.badRequest('Invalid subscription request', validation.error);
        }

        const { email, name, source, metadata } = validation.data;

        // Check if email already exists
        const existingSubscriber = await prisma.waitlistSubscriber.findUnique({
            where: { email }
        });

        if (existingSubscriber) {
            if (existingSubscriber.status === 'UNSUBSCRIBED') {
                // Re-subscribe if previously unsubscribed
                await prisma.waitlistSubscriber.update({
                    where: { email },
                    data: {
                        status: 'SUBSCRIBED',
                        updatedAt: new Date(),
                    }
                });

                // Send resubscription confirmation email
                const template = emailClient.emailTemplates.waitlistConfirmation(email);
                const emailResult = await emailClient.sendEmail({
                    to: email,
                    ...template
                });

                if (!emailResult.success) {
                    console.error('Failed to send resubscription confirmation email:', emailResult.error);
                    // Don't return error to client, as resubscription was successful
                }

                return successResponse({
                    status: 'RESUBSCRIBED'
                }, 'Successfully re-subscribed to waitlist');
            }

            return errors.conflict('Email already subscribed to waitlist');
        }

        // Create new subscriber
        const subscriber = await prisma.waitlistSubscriber.create({
            data: {
                email,
                name,
                source,
                metadata,
                status: 'SUBSCRIBED'
            }
        });

        // Send confirmation email
        const template = emailClient.emailTemplates.waitlistConfirmation(email);
        const emailResult = await emailClient.sendEmail({
            to: email,
            ...template
        });

        if (!emailResult.success) {
            console.error('Failed to send confirmation email:', emailResult.error);
            // Don't return error to client, as subscription was successful
        }

        return successResponse({
            status: 'SUBSCRIBED',
            subscriber: {
                id: subscriber.id,
                email: subscriber.email,
                name: subscriber.name,
                createdAt: subscriber.createdAt
            }
        }, 'Successfully subscribed to waitlist');

    } catch (error: any) {
        console.error("Waitlist subscription error:", error);
        return errors.internal('Failed to process subscription', error.message);
    }
} 