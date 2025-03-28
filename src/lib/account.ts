import prisma from "@/lib/database";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { User } from "@prisma/client";

/**
 * Create a new user with email and password
 * @returns The created user
 */
export async function createUser(
    email: string,
    password: string,
    name?: string | null,
    image?: string | null
): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: name ?? null,
            image: image ?? null,
            status: "ONLINE" as const,
            statusMessage: null,
            lastLoginAt: new Date(),
        }
    });

    return user;
}

/**
 * Link a GitHub account to a user
 */
export async function linkGithubAccount(
    userId: string,
    githubId: string,
    githubUsername: string,
    githubDisplayName?: string
) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            githubId,
            githubUsername,
            githubDisplayName: githubDisplayName || null,
        }
    });
}

/**
 * Unlink a GitHub account from a user
 */
export async function unlinkGithubAccount(userId: string) {
    return prisma.user.update({
        where: { id: userId },
        data: {
            githubId: null,
            githubUsername: null,
            githubDisplayName: null,
        }
    });
}

/**
 * Change user's password
 */
export async function changePassword(userId: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword);

    return prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        }
    });
}

/**
 * Check if user has password authentication enabled
 */
export async function hasPasswordAuth(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
    });

    return !!user?.password;
}

/**
 * Add password authentication to existing account
 */
export async function addPasswordToAccount(userId: string, password: string) {
    const hashedPassword = await hashPassword(password);

    return prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        }
    });
}
