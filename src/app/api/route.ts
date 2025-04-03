import { NextRequest, NextResponse } from 'next/server';
import { clientInfo } from '@/lib/client';
import { AuditLogger } from '@/lib/audit/logger';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

/**
 * API root endpoint handler
 * Returns API information and available endpoints
 */
export async function GET(request: NextRequest) {
    try {
        // Log the API info request for monitoring
        const client = await clientInfo.getClientInfo(request);
        
        await AuditLogger.logSystem(
            AuditAction.SYSTEM_WARNING,
            AuditStatus.SUCCESS,
            {
                message: 'API Info endpoint accessed',
                path: request.nextUrl.pathname,
                clientInfo: client
            },
            request
        );
        
        // Return API information
        return NextResponse.json({
            name: 'OctoHub Waitlist API',
            version: '0.2.0',
            status: 'operational',
            timestamp: new Date().toISOString(),
            endpoints: {
                waitlist: {
                    subscribe: API_ENDPOINTS.waitlist.subscribe,
                    unsubscribe: API_ENDPOINTS.waitlist.status,
                    check: API_ENDPOINTS.waitlist.status
                },
                auth: {
                    register: API_ENDPOINTS.auth.register,
                    login: API_ENDPOINTS.auth.login,
                    logout: API_ENDPOINTS.auth.logout,
                    verify: API_ENDPOINTS.auth.verify,
                    resetPassword: API_ENDPOINTS.auth.resetPassword,
                    setup2FA: API_ENDPOINTS.auth.twoFactor.setup
                },
                dashboard: API_ENDPOINTS.dashboard.main,
                account: API_ENDPOINTS.account.profile,
                health: API_ENDPOINTS.health
            },
            documentation: '/docs/api-reference'
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=60',
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error in API info endpoint:', error);
        
        // Log the error
        await AuditLogger.logSystem(
            AuditAction.SYSTEM_ERROR,
            AuditStatus.FAILURE,
            {
                message: 'Error serving API info',
                error: error instanceof Error ? error.message : String(error)
            }
        );
        
        // Return error response
        return NextResponse.json({
            error: 'Internal Server Error',
            message: 'Failed to retrieve API information'
        }, { status: 500 });
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * HEAD handler for health checks
 */
export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}