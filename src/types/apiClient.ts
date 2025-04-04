import { NextRequest } from 'next/server';

/**
 * Extended NextRequest interface for Edge Runtime features
 * This allows us to access runtime properties that aren't in the NextRequest type
 */
export interface ExtendedNextRequest extends NextRequest {
    // Properties available in edge runtime
    ip?: string;
    geo?: {
        country?: string;
        city?: string;
        region?: string;
        latitude?: string;
        longitude?: string;
    };
}

/**
 * Extended client info interface with debug headers
 */
export interface DebugClientInfo {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    referer?: string;
    origin?: string;
    language?: string;
    timestamp: string;
    isBot?: boolean;
    debugHeaders?: Record<string, string>;
    [key: string]: any;
}

/**
 * Edge runtime information from NextRequest
 */
export interface EdgeRuntimeInfo {
    name?: string;
    region?: string;
    requestRegion?: string;
}

/**
 * Flexible header types to cover different request structures
 */
export type RequestHeaders = 
    | Headers 
    | { get?: (name: string) => string | null }
    | Record<string, string | string[] | null | undefined>;

/**
 * Common request object that works across different runtimes
 */
export interface CommonRequest {
    url: string;
    headers: RequestHeaders;
    method: string;
    ip?: string;
    geo?: any;
    cookies?: any;
    nextUrl?: URL;
    body?: any;
}
