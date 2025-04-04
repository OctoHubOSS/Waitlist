import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../base';
import { AuditLogger } from '@/lib/audit/logger';
import prisma from '@/lib/database';
import { verifyCode } from '@/lib/email/verification/code';
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { parseUserAgent } from '@/lib/utils/user-agent';

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
            const enhancedMetadata: Record<string, any> = {
                email,
                ...(metadata || {})
            };
            
            // Pass the request directly to AuditLogger
            await AuditLogger.logAuth(
                action,
                status,
                userId,
                undefined,
                enhancedMetadata,
                request
            );
        } catch (error) {
            console.error('Failed to log auth action:', error);
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
}