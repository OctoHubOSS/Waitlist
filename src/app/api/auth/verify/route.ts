import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import prisma from '@/lib/database';
import { successResponse, errors } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/lib/audit/logger';
import { sendWelcomeEmail } from '@/lib/email/account';
import { verifyCode } from '@/lib/email/verification/code';
import { getClientIp } from '@/lib/client/ip';
import { withTimeout, withRetry } from '@/lib/api/utils';
import { getBrowserInfo, getOSInfo, getDeviceType } from '@/lib/utils/user-agent';

const verifyRequestSchema = z.object({
    email: z.string().email(),
    code: z.string().min(6).max(6),
});

export class VerifyRoute extends BaseAuthRoute<z.infer<typeof verifyRequestSchema>> {
    constructor() {
        super(verifyRequestSchema);
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(
                this.processVerification(request),
                5000 // 5 second timeout
            );
        } catch (error) {
            // Handle timeout or other errors
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.internal('Verification request timed out');
            }
            return this.handleError(error);
        }
    }

    private async processVerification(request: NextRequest): Promise<Response> {
        try {
            const { email, code } = await this.validateRequest(request);

            // Get user and check if already verified
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    displayName: true,
                    emailVerified: true,
                    status: true,
                },
            });

            if (!user) {
                return errors.badRequest("User not found");
            }

            if (user.emailVerified) {
                return errors.badRequest("Email already verified");
            }

            // Use a transaction with retry logic to ensure atomic operations
            await withRetry(
                async () => {
                    await prisma.$transaction(async (tx) => {
                        // Verify the code
                        const result = await verifyCode(email, code, 'email');
                        if (!result.success) {
                            throw new Error(result.error || "Invalid verification code");
                        }

                        // Update user verification status
                        await tx.user.update({
                            where: { id: user.id },
                            data: {
                                emailVerified: new Date(),
                                status: 'ACTIVE',
                            },
                        });
                    });
                },
                { retries: 2, initialDelay: 500 }
            );

            // Send welcome email
            await sendWelcomeEmail({
                name: user.name,
                displayName: user.displayName,
                email: user.email,
            });

            // Get client information
            const userAgent = request.headers.get('user-agent') || '';

            // Log the verification
            await this.logAuthAction(
                AuditAction.EMAIL_VERIFICATION,
                AuditStatus.SUCCESS,
                user.id,
                email,
                {
                    clientInfo: {
                        ip: getClientIp(request),
                        userAgent,
                        referer: request.headers.get('referer'),
                        origin: request.headers.get('origin'),
                        browser: getBrowserInfo(userAgent),
                        os: getOSInfo(userAgent),
                        deviceType: getDeviceType(userAgent),
                        timestamp: new Date().toISOString(),
                    },
                },
                request
            );

            return successResponse({
                message: "Email verified successfully",
                redirectTo: "/auth/login?verified=true",
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new VerifyRoute();
export const GET = route.handle.bind(route);
export const POST = route.handle.bind(route);