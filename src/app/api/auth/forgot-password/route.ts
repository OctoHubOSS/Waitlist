import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";
// Note: You'll need to implement sendEmail function or use a library like nodemailer
// import { sendEmail } from "@/lib/email";

// Email validation schema
const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();
        const validation = emailSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // We don't want to reveal if a user exists or not for security reasons
        if (!user) {
            return NextResponse.json(
                { message: "If the email exists, a password reset link has been sent" },
                { status: 200 }
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

        // Send email with reset link
        // await sendEmail({
        //   to: email,
        //   subject: "Password Reset Request",
        //   text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
        //   html: `<p>You requested a password reset.</p><p>Please click <a href="${resetUrl}">this link</a> to reset your password.</p>`,
        // });

        // For now, just log the reset URL (REMOVE THIS IN PRODUCTION)
        console.log("Password reset URL:", resetUrl);

        return NextResponse.json({
            message: "If the email exists, a password reset link has been sent",
        });
    } catch (error: any) {
        console.error("Password reset request error:", error);
        return NextResponse.json(
            { error: "Failed to process password reset request" },
            { status: 500 }
        );
    }
}
