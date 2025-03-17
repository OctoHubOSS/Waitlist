import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { changePassword } from "@/lib/account";
import { getSession, verifyPassword } from "@/lib/auth";
import { schemas, validateBody } from "@/lib/api/validation";
import { successResponse, errors, handleApiError } from "@/lib/api/responses";
import { z } from "zod";
/**
 * POST /api/auth/change-password
 * Changes the password for an authenticated user
 */
export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return errors.unauthorized("You must be logged in to change your password");
        }

        // Parse and validate the request body
        const changePasswordSchema = z.object({
            currentPassword: schemas.passwords.currentPassword,
            newPassword: schemas.passwords.newPassword
        })

        const validation = await validateBody(req, changePasswordSchema);
        if (!validation.success) {
            return errors.badRequest(
                "Invalid password data",
                validation.error?.details
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
            return errors.badRequest(
                "Your account doesn't have a password set",
                { suggestion: "Use the 'add password' feature instead" }
            );
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return errors.badRequest(
                "Current password is incorrect",
                { field: "currentPassword" }
            );
        }

        // Change password
        await changePassword(userId, newPassword);

        return successResponse(
            { userId },
            "Your password has been successfully changed",
            undefined,
            200
        );
    } catch (error) {
        return handleApiError(error);
    }
}