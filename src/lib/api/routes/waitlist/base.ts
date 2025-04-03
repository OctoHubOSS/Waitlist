import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../base';
import prisma from '@/lib/database';
import { AuditLogger } from '@/lib/audit/logger';
import { emailClient } from '@/lib/email/client';
import { WaitlistStatus } from '@/lib/api/types';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

export abstract class BaseWaitlistRoute<TRequest = any, TResponse = any> extends BaseApiRoute<TRequest, TResponse> {
    /**
     * Logs waitlist-related activity
     */
    protected async logWaitlistActivity(
        action: AuditAction,
        status: AuditStatus,
        email: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            // Find subscriber by email
            const subscriber = await prisma.waitlistSubscriber.findUnique({
                where: { email }
            });

            // Let AuditLogger handle client info extraction
            await AuditLogger.logSystem(
                action,
                status,
                {
                    email,
                    subscriberId: subscriber?.id,
                    ...details
                },
                request
            );
        } catch (error) {
            console.error('Failed to log waitlist activity:', error);
            // Don't throw to avoid disrupting the main flow
        }
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
        status: WaitlistStatus = 'SUBSCRIBED',
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
}
