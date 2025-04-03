import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/database";
import { AuditLogger } from "@/lib/audit/logger";
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { User, UserRole, UserStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/client/ip";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { Account, Profile } from "next-auth";
import { SessionService } from "./session";
import { comparePasswords } from "./server/password";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
        verifyRequest: "/auth/verify-email",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { subscriber: true }
                });

                if (!user || !user.password) {
                    return null;
                }

                if (user.status !== "ACTIVE") {
                    await AuditLogger.logAuth(
                        AuditAction.LOGIN,
                        AuditStatus.FAILURE,
                        user.id,
                        undefined,
                        { error: "Account is not active" }
                    );
                    return null;
                }

                if (!user.emailVerified) {
                    await AuditLogger.logAuth(
                        AuditAction.LOGIN,
                        AuditStatus.FAILURE,
                        user.id,
                        undefined,
                        { error: "Email not verified" }
                    );
                    return null;
                }

                const isValid = await comparePasswords(credentials.password, user.password);
                if (!isValid) {
                    await AuditLogger.logAuth(
                        AuditAction.LOGIN,
                        AuditStatus.FAILURE,
                        user.id,
                        undefined,
                        { error: "Invalid password" }
                    );
                    return null;
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() }
                });

                // Create a new session in the database
                await SessionService.createSession(user.id);

                // Log successful login
                await AuditLogger.logAuth(
                    AuditAction.LOGIN,
                    AuditStatus.SUCCESS,
                    user.id,
                    user.email,
                    {
                        clientInfo: {
                            ip: getClientIp(req as unknown as NextRequest),
                            userAgent: req.headers?.["user-agent"],
                            referer: req.headers?.["referer"],
                            origin: req.headers?.["origin"],
                            browser: getBrowserInfo(req.headers?.["user-agent"] || ""),
                            os: getOSInfo(req.headers?.["user-agent"] || ""),
                            deviceType: getDeviceType(req.headers?.["user-agent"] || ""),
                            timestamp: new Date().toISOString(),
                        },
                    }
                );

                // Return user data
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    displayName: user.displayName,
                    role: user.role,
                    status: user.status,
                    emailVerified: user.emailVerified,
                };
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;
                token.emailVerified = user.emailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.status = token.status as UserStatus;
                session.user.emailVerified = token.emailVerified as Date | null;
            }
            return session;
        }
    },
    events: {
        async signOut({ session, token }) {
            if (session?.user?.id) {
                // Delete all sessions for the user
                await SessionService.deleteUserSessions(session.user.id);

                // Log the logout event
                await AuditLogger.logAuth(
                    AuditAction.LOGOUT,
                    AuditStatus.SUCCESS,
                    session.user.id,
                    undefined,
                    { email: session.user.email }
                );
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

function getBrowserInfo(userAgent: string): string {
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) return "Internet Explorer";
    return "Unknown";
}

function getOSInfo(userAgent: string): string {
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iOS")) return "iOS";
    return "Unknown";
}

export function getDeviceType(userAgent: string): string {
    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Tablet")) return "Tablet";
    return "Desktop";
} 