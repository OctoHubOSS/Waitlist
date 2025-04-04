import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../../routes/base';
import { AuditLogger } from '@/lib/audit/logger';
import prisma from '@/lib/database';
import { verifyCode } from '@/lib/email/verification/code';
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { parseUserAgent } from '@/lib/utils/user-agent';
import { validateRequest, rateLimit, requireAuth } from '../../middleware';
import { ApiResponse } from '@/types/apiClient';

export type VerificationType = 'email' | 'password' | '2fa';

/**
 * Base auth route class
 * 
 * This class provides common functionality for all auth routes:
 * - Default rate limiting
 * - Default validation
 * - Default audit logging
 */
export class BaseAuthRoute<T = any, R = any> extends BaseApiRoute<T, R> {
    constructor(config: {
        path?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        schema?: {
            request?: z.ZodType<T>;
            response?: z.ZodType<R>;
        };
        middleware?: any[];
        auditAction?: AuditAction;
        requireAuth?: boolean;
        rateLimit?: {
            limit?: number;
            windowMs?: number;
        };
        timeout?: number;
    } = {}) {
        super({
            ...config,
            auditAction: config.auditAction || AuditAction.LOGIN,
            requireAuth: config.requireAuth ?? false,
            rateLimit: config.rateLimit || {
                limit: 10,
                windowMs: 60000
            }
        });
    }

    /**
     * Validates that a user exists with the given email
     * 
     * @param email - Email address to validate
     * @returns The user record if found, null otherwise
     */
    protected async validateUser(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            return user;
        } catch (error) {
            console.error('Error validating user:', error);
            return null;
        }
    }

    /**
     * Validates a verification code
     * 
     * @param email - Email address associated with the code
     * @param code - Verification code to validate
     * @param type - Type of verification
     * @returns Result of verification
     */
    protected async validateVerificationCode(email: string, code: string, type: VerificationType) {
        try {
            const result = await verifyCode(email, code, type);

            if (!result.success) {
                await AuditLogger.logSystem(
                    type === 'email' ? AuditAction.EMAIL_VERIFICATION :
                        type === 'password' ? AuditAction.PASSWORD_RESET :
                            AuditAction.TWO_FACTOR_VERIFICATION,
                    AuditStatus.FAILURE,
                    {
                        userId: result.userId,
                        email,
                        error: result.error || 'Unknown error',
                        type
                    }
                );
            }

            return result;
        } catch (error) {
            console.error(`Error validating ${type} verification code:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unexpected error during verification'
            };
        }
    }

    /**
     * Logs auth activity
     */
    protected async logAuthActivity(
        action: AuditAction,
        status: AuditStatus,
        userId?: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                action,
                status,
                {
                    userId,
                    ...details,
                    authAction: true
                },
                request
            );
        } catch (error) {
            console.error('Failed to log auth activity:', error);
            // Don't throw to avoid disrupting the main flow
        }
    }

    /**
     * Gets IP address from a request
     * Use a different name to avoid collision with private method in BaseApiRoute
     */
    private getRequestIp(request: NextRequest): string {
        try {
            const ipHeaders = [
                'x-vercel-forwarded-for',
                'cf-connecting-ip',
                'x-forwarded-for',
                'true-client-ip',
                'x-real-ip'
            ];

            for (const header of ipHeaders) {
                const value = request.headers.get(header);
                if (value) {
                    const ip = header.includes('forwarded-for')
                        ? value.split(',')[0].trim()
                        : value;
                    return ip;
                }
            }

            // Try edge runtime ip property
            const edgeRequest = request as any;
            if (edgeRequest.ip) return edgeRequest.ip;

            return 'unknown';
        } catch (error) {
            console.warn('Failed to extract IP from request:', error);
            return 'unknown';
        }
    }

    /**
     * Checks if a user's email is verified
     * 
     * @param user - User record to check
     * @returns true if email needs verification, false if already verified
     */
    protected needsEmailVerification(user: any): boolean {
        const emailVerified = user.emailVerified ? new Date(user.emailVerified) : null;
        // Return true if email verification is needed (emailVerified is null or invalid date)
        return !emailVerified || isNaN(emailVerified.getTime());
    }

    /**
     * Creates a success response with auth data
     */
    protected successResponse(data: R): ApiResponse<R> {
        return {
            data,
            status: 200,
            headers: {}
        };
    }

    /**
     * Creates an error response for auth operations
     */
    protected errorResponse(error: {
        code: string;
        message: string;
        details?: any;
    }, statusCode: number = 500): ApiResponse<R> {
        return {
            data: null as any,
            status: statusCode,
            headers: {}
        };
    }
}