import crypto from "crypto";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { schemas, validateBody } from "@/utils/validation";
import { successResponse, errors, handleApiError } from "@/utils/responses";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";

/**
 * POST /api/auth/forgot-password
 * Initiates the password reset process for a user
 */
export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const forgotPasswordSchema = z.object({
            email: schemas.user.email
        })

        const validation = await validateBody(req, forgotPasswordSchema);

        if (!validation.success) {
            return errors.badRequest(
                "Invalid email format",
                validation.error?.details
            );
        }

        const { email } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // We don't want to reveal if a user exists or not for security reasons
        if (!user) {
            // Return success even if user doesn't exist (security best practice)
            return successResponse(
                null,
                "If the email exists, a password reset link has been sent"
            );
        }

        // Generate a reset token that expires in 1 hour
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Store the reset token in the database
        await prisma.verificationToken.create({
            data: {
                identifier: user.id,
                token: hashedToken,
                expires: new Date(Date.now() + 3600000), // 1 hour
            },
        });

        // Create the reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Get the email template for password reset
        const { subject, text, html } = emailTemplates.passwordReset(resetUrl);

        // Send email with reset link
        await sendEmail({
            to: email,
            subject,
            text,
            html,
        });

        // For development/debug purposes only
        if (process.env.NODE_ENV !== 'production') {
            console.log("Password reset URL:", resetUrl);
        }

        return successResponse(
            null,
            "If the email exists, a password reset link has been sent"
        );
    } catch (error) {
        return handleApiError(error);
    }
}