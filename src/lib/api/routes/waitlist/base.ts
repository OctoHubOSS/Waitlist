import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../../routes/base';
import prisma from '@/lib/database';
import { AuditLogger } from '@/lib/audit/logger';
import { emailClient } from '@/lib/email/client';
import { WaitlistStatus } from '@prisma/client';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { validateRequest, rateLimit, requireAuth } from '../../middleware';
import { ApiResponse } from '@/types/apiClient';

interface LogWaitlistActivityParams {
    action: AuditAction;
    status: AuditStatus;
    email: string;
    details?: Record<string, any>;
    request?: NextRequest;
}

/**
 * Base waitlist route class
 * 
 * This class provides common functionality for all waitlist routes:
 * - Default rate limiting
 * - Default validation
 * - Default audit logging
 */
export class BaseWaitlistRoute<T = any, R = any> extends BaseApiRoute<T, R> {
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
            auditAction: config.auditAction || AuditAction.SUBSCRIBE,
            requireAuth: config.requireAuth ?? false,
            rateLimit: config.rateLimit || {
                limit: 50,
                windowMs: 60000
            }
        });
    }

    /**
     * Logs waitlist activity
     */
    protected async logWaitlistActivity(
        action: AuditAction,
        status: AuditStatus,
        userId?: string,
        subscriberId?: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                action,
                status,
                {
                    userId,
                    subscriberId,
                    ...details,
                    waitlistAction: true
                },
                request
            );
        } catch (error) {
            console.error('Failed to log waitlist activity:', error);
            // Don't throw to avoid disrupting the main flow
        }
    }

    /**
     * Get subscriber details by email
     */
    protected async getSubscriberByEmail(email: string) {
        return prisma.waitlistSubscriber.findUnique({
            where: { email }
        });
    }

    /**
     * Find a subscriber by email
     */
    protected async findSubscriber(email: string) {
        return prisma.waitlistSubscriber.findUnique({
            where: { email }
        });
    }

    /**
     * Send waitlist-related email
     */
    protected async sendEmail(
        type: 'confirmation' | 'unsubscribe',
        email: string
    ): Promise<boolean> {
        try {
            const template = type === 'confirmation'
                ? emailClient.emailTemplates.waitlistConfirmation(email)
                : emailClient.emailTemplates.waitlistUnsubscribe(email);

            const emailResult = await emailClient.sendEmail({
                to: email,
                from: {
                    name: "OctoHub",
                    address: "noreply@octohub.dev"
                },
                ...template
            });

            if (!emailResult.success) {
                console.error(`Failed to send ${type} email:`, emailResult.error);
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Error sending ${type} email:`, error);
            return false;
        }
    }

    /**
     * Updates a subscriber's status
     */
    protected async updateSubscriberStatus(
        email: string,
        status: WaitlistStatus,
        additionalData: Record<string, any> = {}
    ) {
        return prisma.waitlistSubscriber.update({
            where: { email },
            data: {
                status,
                updatedAt: new Date(),
                ...additionalData
            }
        });
    }

    /**
     * Creates a new subscriber
     */
    protected async createSubscriber(
        email: string,
        name?: string | null,
        status: WaitlistStatus = WaitlistStatus.PENDING,
        additionalData: Record<string, any> = {}
    ) {
        return prisma.waitlistSubscriber.create({
            data: {
                email,
                name,
                status,
                ...additionalData
            }
        });
    }

    /**
     * Format subscriber for response
     */
    protected formatSubscriber(subscriber: any) {
        return {
            id: subscriber.id,
            email: subscriber.email,
            name: subscriber.name,
            status: subscriber.status,
            createdAt: subscriber.createdAt.toISOString(),
            updatedAt: subscriber.updatedAt.toISOString()
        };
    }

    /**
     * Creates a success response with waitlist data
     */
    protected successResponse(data: R): ApiResponse<R> {
        return {
            data,
            status: 200,
            headers: {}
        };
    }

    /**
     * Creates an error response for waitlist operations
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
