import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { addPasswordToAccount, hasPasswordAuth } from "@/lib/account";
import { z } from "zod";

// Add password schema validation
const addPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
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
        const validation = addPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation error", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { password } = validation.data;
        const userId = session.user.id;

        // Check if user already has a password
        const hasPassword = await hasPasswordAuth(userId);
        if (hasPassword) {
            return NextResponse.json(
                { error: "User already has password authentication enabled" },
                { status: 400 }
            );
        }

        // Add password to account
        await addPasswordToAccount(userId, password);

        return NextResponse.json({
            message: "Password added successfully"
        });
    } catch (error: any) {
        console.error("Add password error:", error);
        return NextResponse.json(
            { error: "Failed to add password", details: error.message },
            { status: 500 }
        );
    }
}
