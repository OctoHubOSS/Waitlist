import prisma from "@/lib/database";
import { NextRequest } from 'next/server';
import { clientInfo } from '@/lib/client';
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { getClientIp } from '@/lib/client/ip';
import { parseUserAgent } from '@/lib/utils/user-agent';

export interface AuditLogData {
    action: AuditAction;
    status: AuditStatus;
    userId?: string;
    subscriberId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditLogger {
    static async log(data: AuditLogData): Promise<void> {
        try {
            // Create base log data object - excluding subscriberId by default
            const logData: any = {
                action: data.action,
                status: data.status,
                details: data.details,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            };

            // Only include userId if it exists and is not undefined/null
            if (data.userId) {
                logData.userId = data.userId;
            }

            // Only include subscriberId if it exists, is not empty, and we've validated it exists in the database
            if (data.subscriberId && typeof data.subscriberId === 'string' && data.subscriberId.trim() !== '') {
                // Check if subscriber exists before creating a foreign key reference
                const subscriberExists = await prisma.waitlistSubscriber.findUnique({
                    where: { id: data.subscriberId },
                    select: { id: true }
                });
                
                if (subscriberExists) {
                    logData.subscriberId = data.subscriberId;
                } else {
                    // Silently drop the subscriberId if it doesn't exist to avoid FK constraint error
                    // Still log the ID in details for debugging
                    logData.details = {
                        ...logData.details,
                        invalidSubscriberId: data.subscriberId
                    };
                }
            }

            await prisma.auditLog.create({
                data: logData,
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error to prevent disrupting the main flow
        }
    }

    static async logAuth(
        action: AuditAction,
        status: AuditStatus,
        userId?: string,
        subscriberId?: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            // Extract client info
            const clientInfoData = await this.extractClientInfo(request);

            // Add client info to details
            const enrichedDetails = {
                ...details,
                clientInfo: clientInfoData
            };

            await this.log({
                action,
                status,
                userId,
                subscriberId,
                details: enrichedDetails,
                ipAddress: clientInfoData.ip,
                userAgent: clientInfoData.userAgent,
            });
        } catch (error) {
            console.error('Failed to log auth action:', error);
            // Don't throw error to prevent disrupting the main flow
        }
    }

    static async logSystem(
        action: AuditAction,
        status: AuditStatus,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            // If we have a request, extract client info
            const clientInfoData = request ? await this.extractClientInfo(request) : undefined;
            
            // Add client info to details if available
            const enrichedDetails = clientInfoData 
                ? { ...details, clientInfo: clientInfoData }
                : details;

            await this.log({
                action,
                status,
                details: enrichedDetails,
                ipAddress: clientInfoData?.ip,
                userAgent: clientInfoData?.userAgent,
            });
        } catch (error) {
            console.error('Failed to log system action:', error);
            // Don't throw error to prevent disrupting the main flow
        }
    }
    
    /**
     * Extracts client information from a request
     * 
     * IMPORTANT: This function focuses on extracting END USER information,
     * not server information.
     */
    private static async extractClientInfo(request?: NextRequest): Promise<Record<string, any>> {
        if (!request) {
            return {
                ip: 'unknown',
                userAgent: 'unknown',
                browser: 'Unknown',
                os: 'Unknown',
                device: 'Desktop',
                timestamp: new Date().toISOString()
            };
        }
        
        try {
            // STEP 1: Extract end-user's user agent
            let userAgent = 'unknown';
            try {
                userAgent = request.headers.get('user-agent') || 'unknown';
            } catch (e) {
                console.warn('Error extracting user agent directly:', e);
            }

            // STEP 2: Extract end-user's IP address
            // getClientIp is already optimized to prioritize end-user's IP over server IP
            const ip = getClientIp(request);
            
            // STEP 3: Parse user agent to get device/browser information about the end-user
            const userAgentInfo = parseUserAgent(userAgent);
            
            // Return complete information about the end-user
            return {
                ip,
                userAgent,
                browser: userAgentInfo.browser,
                os: userAgentInfo.os,
                device: userAgentInfo.device,
                isBot: userAgentInfo.isBot,
                timestamp: new Date().toISOString(),
                source: 'direct-extraction'
            };
        } catch (error) {
            console.error('Error extracting end-user client info:', error);
            
            // Simple fallback
            return {
                ip: 'unknown',
                userAgent: 'unknown',
                browser: 'Unknown',
                os: 'Unknown',
                device: 'Desktop',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
                source: 'error-fallback'
            };
        }
    }
}