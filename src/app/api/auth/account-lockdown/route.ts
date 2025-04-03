import { NextRequest } from 'next/server';
import prisma from '@/lib/database';
import { sendAccountLockdownEmail } from '@/lib/email/account';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { successResponse, errors } from '@/lib/api/responses';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

export async function POST(request: NextRequest) {
    try {
        const { email, ip } = await request.json();

        // Validate required fields
        if (!email || !ip) {
            return errors.badRequest('Missing required fields');
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return successResponse({ message: 'If an account exists with this email, a notification will be sent.' });
        }

        // Generate unlock URL
        const unlockUrl = `${absoluteUrl()}/auth/unlock?email=${encodeURIComponent(email)}`;

        // Send account lockdown email
        await sendAccountLockdownEmail({
            name: user.name,
            email: user.email,
            ip,
            timestamp: new Date().toISOString(),
            unlockUrl
        });

        // Log the account lockdown
        await AuditLogger.logAuth(
            AuditAction.ACCOUNT_LOCKDOWN,
            AuditStatus.SUCCESS,
            user.id,
            undefined,
            { email, ip }
        );

        return successResponse({ message: 'If an account exists with this email, a notification will be sent.' });
    } catch (error) {
        console.error('Error sending account lockdown notification:', error);

        // Log the error
        await AuditLogger.logAuth(
            AuditAction.ACCOUNT_LOCKDOWN,
            AuditStatus.FAILURE,
            undefined,
            undefined,
            { error: error instanceof Error ? error.message : 'Unknown error occurred' }
        );

        return errors.internal('Failed to send account lockdown notification');
    }
} 