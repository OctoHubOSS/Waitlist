import { ApiMiddleware, ApiRequest, ApiResponse } from '@/types/apiClient';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

/**
 * Middleware to log API requests
 */
export function logRequest(options: {
    excludePaths?: string[];
    logResponse?: boolean;
} = {}): ApiMiddleware {
    const {
        excludePaths = [],
        logResponse = false
    } = options;

    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        const startTime = Date.now();
        const path = req.url;

        // Skip logging for excluded paths
        if (excludePaths.some(excludePath => path.startsWith(excludePath))) {
            await next();
            return;
        }

        try {
            await next();

            const duration = Date.now() - startTime;
            const status = res.success ? AuditStatus.SUCCESS : AuditStatus.FAILURE;

            await AuditLogger.log({
                action: AuditAction.CUSTOM,
                status,
                userId: req.user?.id,
                details: {
                    method: req.method,
                    path,
                    duration,
                    success: res.success,
                    error: res.error,
                    ...(logResponse && { response: res.data })
                }
            });
        } catch (error) {
            const duration = Date.now() - startTime;

            await AuditLogger.log({
                action: AuditAction.SYSTEM_ERROR,
                status: AuditStatus.FAILURE,
                userId: req.user?.id,
                details: {
                    method: req.method,
                    path,
                    duration,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });

            throw error;
        }
    };
} 