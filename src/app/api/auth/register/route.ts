import { NextRequest } from "next/server";
import { createUser } from "@/lib/account";
import { prisma } from "@/lib/db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { schemas, validateBody } from "@/utils/validation";
import { successResponse, errors, handleApiError } from "@/utils/responses";
import { z } from "zod";

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(req: NextRequest) {
    try {
        const registerSchema = z.object({
            email: schemas.user.email,
            password: schemas.user.password,
            name: schemas.user.name,
            image: z.string().url("Invalid image URL").optional(),
        });

        const validation = await validateBody(req, registerSchema);

        // No need to check for undefined since our function always returns a ValidationResult
        if (!validation.success) {
            return errors.badRequest(
                "Invalid registration data",
                validation.error?.details
            );
        }

        // TypeScript now knows validation.data exists and has the correct shape
        const { email, password, name, image } = validation.data;

        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return errors.conflict(
                "User with this email already exists",
                { suggestion: "Try signing in instead or use a different email" }
            );
        }

        // Create the new user
        const user = await createUser(email, password, name, image);

        // Send welcome email
        const displayName = name || email.split('@')[0];
        const welcomeTemplate = emailTemplates.welcome(displayName);
        await sendEmail({
            to: email,
            ...welcomeTemplate
        });

        // Return the user (omitting sensitive information)
        return successResponse(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                createdAt: user.createdAt,
            },
            "User registered successfully",
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
}