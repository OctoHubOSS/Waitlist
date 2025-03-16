import { sendEmail, emailTemplates } from "@/lib/email";
import { NextResponse, NextRequest } from "next/server";
import { createUser } from "@/lib/account";
import { prisma } from "@/lib/db";
import { z } from "zod";
// User registration schema validation
const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().optional(),
    image: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation error", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { email, password, name, image } = validation.data;

        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Create the new user
        const user = await createUser(email, password, name, image);

        // Send welcome email
        if (email) {
            const name = name || email.split('@')[0];
            const welcomeTemplate = emailTemplates.welcome(name);
            await sendEmail({
                to: email,
                ...welcomeTemplate
            });
        }

        // Return the user (omitting password)
        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: user.createdAt,
        }, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Failed to create user", details: error.message },
            { status: 500 }
        );
    }
}
