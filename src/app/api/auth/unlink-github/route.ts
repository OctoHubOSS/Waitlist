import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { unlinkGithubAccount } from "@/lib/account";
import { successResponse, errors, handleApiError } from "@/utils/responses";

/**
 * POST /api/auth/unlink-github
 * Unlinks a GitHub account from the current user's account
 */
export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return errors.unauthorized("You must be logged in to unlink your GitHub account");
        }

        const userId = session.user.id;

        // Unlink GitHub account
        await unlinkGithubAccount(userId);

        return successResponse(
            null,
            "GitHub account unlinked successfully"
        );
    } catch (error) {
        return handleApiError(error);
    }
}