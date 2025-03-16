import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { z } from "zod";
import { successResponse, errors } from "@/utils/responses";
import { validate } from "@/utils/validation";

// Email request schema validation
const emailRequestSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    text: z.string(),
    html: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return errors.unauthorized();
        }

        // Only allow admin users to send arbitrary emails
        if (!session.user.isAdmin) {
            return errors.forbidden('Only administrators can send emails');
        }

        // Parse and validate the request body
        const body = await req.json();
        const validation = validate(emailRequestSchema, body);

        if (!validation.success) {
            return errors.badRequest('Invalid email request', validation.error);
        }

        // Send the email
        const { to, subject, text, html = text } = validation.data;
        const result = await sendEmail({ to, subject, text, html });

        if (!result.success) {
            return errors.internal('Failed to send email');
        }

        return successResponse({
            messageId: result.messageId
        }, 'Email sent successfully');
    } catch (error: any) {
        console.error("Email sending error:", error);
        return errors.internal('Failed to send email', error.message);
    }
}
