import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

// Email request schema validation
const emailRequestSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    text: z.string(),
    html: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated with admin privileges
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Only allow admin users to send arbitrary emails
        if (!session.user.isAdmin) {
            return NextResponse.json(
                { error: "Permission denied" },
                { status: 403 }
            );
        }

        // Parse and validate the request body
        const body = await req.json();
        const validation = emailRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid email request", details: validation.error.format() },
                { status: 400 }
            );
        }

        // Send the email
        const { to, subject, text, html = text } = validation.data;
        const result = await sendEmail({ to, subject, text, html });

        if (!result.success) {
            return NextResponse.json(
                { error: "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Email sent successfully",
            messageId: result.messageId
        });
    } catch (error: any) {
        console.error("Email sending error:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: error.message },
            { status: 500 }
        );
    }
}
