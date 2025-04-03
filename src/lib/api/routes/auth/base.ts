import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../base';
import { AuditLogger } from '@/lib/audit/logger';
import prisma from '@/lib/database';
import { verifyCode } from '@/lib/email/verification/code';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

export type VerificationType = 'email' | 'password' | '2fa';

export abstract class BaseAuthRoute<TRequest = any, TResponse = any> extends BaseApiRoute<TRequest, TResponse> {
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
     * Logs authentication-related actions
     */
    protected async logAuthAction(
        action: AuditAction,
        status: AuditStatus,
        userId: string | undefined,
        email: string,
        metadata?: Record<string, any>,
        request?: NextRequest
    ) {
        try {
            // Simply pass the request to AuditLogger - it will extract client info
            await AuditLogger.logAuth(
                action,
                status,
                userId,
                undefined, // subscriberId
                {
                    email,
                    ...metadata,
                },
                request
            );
        } catch (error) {
            console.error('Failed to log auth action:', error);
            // Don't throw to avoid disrupting the main flow
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
}