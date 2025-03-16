import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

// Reset password schema validation
const resetPasswordSchema = z.object({
    token: z.string(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();
        const validation = resetPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation error", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { token, email, password } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid reset request" },
                { status: 400 }
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
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
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

        return NextResponse.json({
            message: "Password has been reset successfully"
        });
    } catch (error: any) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password", details: error.message },
            { status: 500 }
        );
    }
}
