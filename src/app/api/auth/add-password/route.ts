import { z } from "zod";
import { getSession } from "@/lib/auth";
import { NextRequest } from "next/server";
import { schemas, validateBody } from "@/utils/validation";
import { addPasswordToAccount, hasPasswordAuth } from "@/lib/account";
import { successResponse, errors, handleApiError } from "@/utils/responses";

/**
 * POST /api/auth/add-password
 * Adds a password to a user account that was created with OAuth
 */
export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return errors.unauthorized("You must be logged in to add a password");
        }

        // Parse and validate the request body
        const addPasswordSchema = z.object({
            password: schemas.user.password
        });

        const validation = await validateBody(req, addPasswordSchema);

        if (!validation.success) {
            return errors.badRequest(
                "Invalid password format",
                validation.error?.details
            );
        }

        const { password } = validation.data;
        const userId = session.user.id;

        // Check if user already has a password
        const hasPassword = await hasPasswordAuth(userId);
        if (hasPassword) {
            return errors.conflict(
                "Password authentication is already enabled for your account",
                { suggestion: "Use 'change password' instead if you want to update it" }
            );
        }

        // Add password to account
        await addPasswordToAccount(userId, password);

        return successResponse(
            { userId },
            "Password has been successfully added to your account",
            undefined,
            200
        );
    } catch (error) {
        return handleApiError(error);
    }
}