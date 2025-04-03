import prisma from "@/lib/database";
import { randomBytes } from "crypto";

export class SessionService {
    static async createSession(userId: string, expiresIn: number = 30 * 24 * 60 * 60 * 1000) {
        const sessionToken = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + expiresIn);

        const session = await prisma.session.create({
            data: {
                sessionToken,
                userId,
                expires,
            },
        });

        return session;
    }

    static async getSession(sessionToken: string) {
        const session = await prisma.session.findUnique({
            where: { sessionToken },
            include: { user: true },
        });

        if (!session || session.expires < new Date()) {
            return null;
        }

        return session;
    }

    static async updateSession(sessionToken: string, expiresIn: number = 30 * 24 * 60 * 60 * 1000) {
        const expires = new Date(Date.now() + expiresIn);

        const session = await prisma.session.update({
            where: { sessionToken },
            data: { expires },
        });

        return session;
    }

    static async deleteSession(sessionToken: string) {
        await prisma.session.delete({
            where: { sessionToken },
        });
    }

    static async deleteUserSessions(userId: string) {
        await prisma.session.deleteMany({
            where: { userId },
        });
    }

    static async cleanupExpiredSessions() {
        await prisma.session.deleteMany({
            where: {
                expires: {
                    lt: new Date(),
                },
            },
        });
    }
} 