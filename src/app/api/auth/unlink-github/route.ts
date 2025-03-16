import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { unlinkGithubAccount } from "@/lib/account";

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

        const userId = session.user.id;

        // Unlink GitHub account
        await unlinkGithubAccount(userId);

        return NextResponse.json({
            message: "GitHub account unlinked successfully",
        });
    } catch (error: any) {
        console.error("GitHub account unlinking error:", error);
        return NextResponse.json(
            { error: "Failed to unlink GitHub account", details: error.message },
            { status: 500 }
        );
    }
}
