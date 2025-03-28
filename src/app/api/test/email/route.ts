import { NextRequest, NextResponse } from 'next/server';
import { emailClient } from '@/lib/email/client';

/**
 * POST /api/test/email
 * 
 * Sends a test email to verify the email configuration.
 * 
 * Request body:
 * - to: Array of email addresses or recipient objects to send the test email to
 * 
 * Response:
 * - 200: Email sent successfully
 * - 400: Invalid request or missing recipients
 * - 500: Server error or email sending failed
 */
export async function POST(req: NextRequest) {
    try {
        // Parse request body
        const body = await req.json();
        const recipients = body.to;

        if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
            return NextResponse.json(
                { error: 'No recipients specified. Please provide at least one recipient in the request body.' },
                { status: 400 }
            );
        }

        // Get the test email template
        const template = emailClient.emailTemplates.test();

        // Send the test email
        const result = await emailClient.sendEmail({
            to: recipients,
            ...template
        });

        if (!result.success && result.error) {
            console.error('Failed to send test email:', result.error);
            return NextResponse.json(
                { error: 'Failed to send test email', details: result.error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully',
            recipients
        });
    } catch (error) {
        console.error('Error in test email route:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}         