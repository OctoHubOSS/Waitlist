import { NextRequest, NextResponse } from 'next/server';
import { ApiRequest, ApiResponse } from '@/types/apiClient';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

/**
 * Converts NextRequest to ApiRequest
 */
export function convertRequest<T = any>(request: NextRequest): Promise<ApiRequest<T>> {
    return request.json().then(body => ({
        url: request.url,
        path: request.nextUrl.pathname,
        method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        data: body,
        params: Object.fromEntries(request.nextUrl.searchParams),
        headers: Object.fromEntries(request.headers),
        nextUrl: request.nextUrl
    })).catch(() => ({
        url: request.url,
        path: request.nextUrl.pathname,
        method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        data: undefined,
        params: Object.fromEntries(request.nextUrl.searchParams),
        headers: Object.fromEntries(request.headers),
        nextUrl: request.nextUrl
    }));
}

/**
 * Creates a NextResponse from ApiResponse
 */
export function createResponse<T>(response: ApiResponse<T>): NextResponse {
    return NextResponse.json(response.data, {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            ...response.headers
        }
    });
}

/**
 * Handles errors and creates error response
 */
export function handleError(error: any): NextResponse {
    console.error('API Error:', error);

    const status = error?.statusCode || 500;
    const message = error?.message || 'An unexpected error occurred';
    const details = process.env.NODE_ENV === 'development' ? error : undefined;

    return NextResponse.json({
        error: {
            code: error?.code || 'INTERNAL_ERROR',
            message,
            details
        }
    }, {
        status,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Logs API request
 */
export async function logRequest(request: NextRequest, action: AuditAction, status: AuditStatus, duration: number): Promise<void> {
    await AuditLogger.log({
        action,
        status,
        details: {
            method: request.method,
            path: request.nextUrl.pathname,
            duration
        }
    });
} 