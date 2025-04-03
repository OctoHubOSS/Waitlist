import { NextRequest } from 'next/server';

/**
 * Extended NextRequest type that accounts for the undocumented but sometimes present properties
 */
export interface ExtendedNextRequest extends NextRequest {
    /**
     * The client's IP address. Available in some environments like Edge runtime.
     */
    ip?: string;
    
    /**
     * The geo information from the request. Available in edge environments.
     */
    geo?: {
        city?: string;
        country?: string;
        region?: string;
        latitude?: string;
        longitude?: string;
    };
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
