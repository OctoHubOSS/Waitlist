import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@root/prisma/database";
import { UserRole, UserStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: true,
            },
        });

        // Log login attempt
        await prisma.userActivity.create({
            data: {
                userId: user?.id || "anonymous",
                action: "LOGIN_ATTEMPT",
                metadata: {
                    email,
                    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                    success: false,
                },
            },
        });

        if (!user || !user.password) {
            // Send failed login attempt email
            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: "Failed Login Attempt",
                    template: "login-failed",
                    data: {
                        name: user.name || "User",
                        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                        userAgent: req.headers.get("user-agent") || "unknown",
                        timestamp: new Date().toISOString(),
                    },
                });
            }

            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            // Send failed login attempt email
            await sendEmail({
                to: user.email!,
                subject: "Failed Login Attempt",
                template: "login-failed",
                data: {
                    name: user.name || "User",
                    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                    timestamp: new Date().toISOString(),
                },
            });

            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Check if user is banned
        if (user.role === UserRole.BANNED) {
            await prisma.userActivity.create({
                data: {
                    userId: user.id,
                    action: "LOGIN_BLOCKED",
                    metadata: {
                        reason: "banned",
                        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                        userAgent: req.headers.get("user-agent") || "unknown",
                    },
                },
            });

            return NextResponse.json(
                { error: "Account is banned" },
                { status: 403 }
            );
        }

        // Update user status and last active time
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
                status: UserStatus.ONLINE,
            },
        });

        // Log successful login
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: "LOGIN_SUCCESS",
                metadata: {
                    ipAddress: req.headers.get("x-forwarded-for") || "unknown",
                    userAgent: req.headers.get("user-agent") || "unknown",
                    method: "credentials",
                },
            },
        });

        // Create session
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
                status: user.status,
                lastActiveAt: user.lastActiveAt,
                isAdmin: user.role === UserRole.ADMIN,
            },
            session,
        });
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 