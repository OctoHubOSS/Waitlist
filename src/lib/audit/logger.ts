import prisma from "@/lib/database";
import { NextRequest } from 'next/server';
import { clientInfo } from '@/lib/client';
import { AuditAction, AuditStatus } from "@/types/auditLogs";

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
            // Create base log data object
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

            // Only include subscriberId if it exists and is not undefined/null
            if (data.subscriberId && typeof data.subscriberId === 'string' && data.subscriberId.trim() !== '') {
                logData.subscriberId = data.subscriberId;
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
     */
    private static async extractClientInfo(request?: NextRequest): Promise<Record<string, any>> {
        if (!request) {
            return {
                ip: 'unknown',
                userAgent: 'unknown',
                timestamp: new Date().toISOString()
            };
        }
        
        // Use the new ClientInfoService to get client info
        return await clientInfo.getClientInfo(request, false);
    }
}