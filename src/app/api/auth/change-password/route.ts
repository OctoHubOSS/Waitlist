import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { changePassword } from "@/lib/account";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Change password schema validation
const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Parse and validate the request body
        const body = await req.json();
        const validation = changePasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation error", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = validation.data;
        const userId = session.user.id;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true }
        });

        if (!user?.password) {
            return NextResponse.json(
                { error: "User has no password set" },
                { status: 400 }
            );
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 400 }
            );
        }

        // Change password
        await changePassword(userId, newPassword);

        return NextResponse.json({
            message: "Password changed successfully"
        });
    } catch (error: any) {
        console.error("Password change error:", error);
        return NextResponse.json(
            { error: "Failed to change password", details: error.message },
            { status: 500 }
        );
    }
}
