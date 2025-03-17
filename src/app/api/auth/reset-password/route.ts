import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { schemas, validateBody } from "@/lib/api/validation";
import { successResponse, errors, handleApiError } from "@/lib/api/responses";
import { z } from "zod";
import crypto from "crypto";

/**
 * POST /api/auth/reset-password
 * Reset user password using a token sent via email
 */
export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const resetPasswordSchema = z.object({
            email: schemas.authentication.email,
            password: schemas.authentication.password,
            token: schemas.authentication.token,
        })

        const validation = await validateBody(req, resetPasswordSchema);

        if (!validation.success) {
            return errors.badRequest(
                "Invalid reset password data",
                validation.error.details
            );
        }

        const { token, email, password } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return errors.badRequest(
                "Invalid reset request",
                { suggestion: "Check your email address and try again" }
            );
        }

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find the valid token
        const resetToken = await prisma.verificationToken.findFirst({
            where: {
                identifier: user.id,
                token: hashedToken,
                expires: { gt: new Date() }
            }
        });

        if (!resetToken) {
            return errors.badRequest(
                "Invalid or expired reset token",
                { suggestion: "Please request a new password reset link" }
            );
        }

        // Update the user's password
        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Delete used token
        await prisma.verificationToken.delete({
            where: { token: resetToken.token }
        });

        return successResponse(
            { email },
            "Password has been reset successfully",
            undefined,
            200
        );
    } catch (error) {
        return handleApiError(error);
    }
}