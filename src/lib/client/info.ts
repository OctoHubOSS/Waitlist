import { NextRequest } from 'next/server';
import { ExtendedNextRequest } from '@/types/apiClient';
import { absoluteUrl } from '@/utils/urlBuilder';

import { 
    parseUserAgent,
    getBrowserInfo,
    getOSInfo,
    getDeviceType 
} from '@/lib/utils/user-agent';

import { 
    getClientIp, 
    isPrivateIp, 
    isValidIp, 
    getIpInfo, 
    getVercelRequestIp 
} from './ip';

/**
 * Client information interface - defined in the client module for direct use
 * Note: If shared across modules, this should be moved to @/types
 */
export interface ClientInfo {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    device: string;
    referer?: string;
    origin?: string;
    language?: string;
    timestamp: string;
    geoInfo?: any;
    isBot?: boolean;
}

/**
 * Client for handling client information
 */
export class ClientInfoService {
    // Known bot user agent patterns
    private static readonly BOT_PATTERNS = [
        /bot/i, /spider/i, /crawl/i, /slurp/i, /lighthouse/i, 
        /headless/i, /scraper/i, /chrome-lighthouse/i, /pingdom/i,
        /googlebot/i, /bingbot/i, /yandex/i, /baiduspider/i
    ];
    
    // Default headers to collect
    private static readonly COMMON_HEADERS = [
        'user-agent', 'referer', 'origin', 'x-forwarded-for',
        'cf-connecting-ip', 'true-client-ip', 'x-real-ip',
        'accept-language', 'content-type', 'cookie', 'x-requested-with',
        'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform',
        'accept', 'upgrade-insecure-requests', 'dnt', 'sec-fetch-dest',
        'sec-fetch-mode', 'sec-fetch-site', 'accept-encoding'
    ];

    /**
     * Extracts complete client information from a request
     * 
     * @param request - The Next.js request object
     * @param includeGeoInfo - Whether to include geographical information
     * @returns Client information object
     */
    static async getClientInfo(request: NextRequest | any, includeGeoInfo = false): Promise<ClientInfo> {
        const ip = this.getIp(request);
        const userAgent = this.getUserAgent(request);
        const referer = this.getHeader(request, 'referer');
        const origin = this.getHeader(request, 'origin');
        const language = this.getAcceptLanguage(request);
        
        // Parse the user agent
        const { browser, os, device } = parseUserAgent(userAgent);
        
        // Try to detect client-hint based device info as fallback
        const clientHintDevice = this.getClientHintDeviceInfo(request);
        
        const clientInfo: ClientInfo = {
            ip,
            userAgent,
            browser,
            os,
            // Use client hints for device if available, otherwise fall back to UA parsing
            device: clientHintDevice || device,
            referer,
            origin,
            language,
            timestamp: new Date().toISOString(),
            isBot: this.isBot(userAgent)
        };
        
        // Add geo information if requested and IP is valid
        if (includeGeoInfo && ip !== 'unknown' && !isPrivateIp(ip)) {
            try {
                clientInfo.geoInfo = await getIpInfo(ip);
            } catch (error) {
                console.error('Failed to get geo information:', error);
                // Try fallback geo method if primary fails
                try {
                    clientInfo.geoInfo = await this.getFallbackGeoInfo(ip);
                } catch (fallbackError) {
                    console.error('Fallback geo lookup also failed:', fallbackError);
                }
            }
        }
        
        return clientInfo;
    }
    
    /**
     * Gets the client IP address with multiple fallbacks
     * TypeScript-friendly implementation
     */
    static getIp(request: NextRequest | any): string {
        // Use our enhanced IP detection function
        return getClientIp(request);
    }
    
    /**
     * Gets the user agent string with fallbacks
     */
    static getUserAgent(request: NextRequest | any): string {
        // Try the standard method first
        const ua = this.getHeader(request, 'user-agent');
        if (ua) return ua;
        
        // Check various places the UA might be hiding
        const possibleSources = [
            request.headers?.['user-agent'],
            request.headers?.['User-Agent'],
            request.raw?.headers?.['user-agent'],
            request.raw?.headers?.['User-Agent'],
            request.requestContext?.identity?.userAgent, // AWS Lambda
            request.get?.('User-Agent'), // Express
        ];
        
        for (const source of possibleSources) {
            if (source) return String(source);
        }
        
        // Try to get the user agent from NextRequest headers
        if (request.headers instanceof Headers) {
            const ua = request.headers.get('user-agent');
            if (ua) return ua;
        }
        
        // Last resort - check if there's a ua or useragent property
        if (request.ua) return String(request.ua);
        if (request.userAgent) return String(request.userAgent);
        
        return 'unknown';
    }
    
    /**
     * Gets the accept-language header
     */
    static getAcceptLanguage(request: NextRequest | any): string | undefined {
        return this.getHeader(request, 'accept-language');
    }
    
    /**
     * Gets a header value
     */
    static getHeader(request: NextRequest | any, name: string): string | undefined {
        if (!request) {
            return undefined;
        }
        
        // Handle NextRequest
        if (request.headers instanceof Headers || typeof request.headers?.get === 'function') {
            return request.headers.get(name) || undefined;
        }
        
        // Handle plain objects
        if (request.headers && typeof request.headers === 'object') {
            const headerValue = request.headers[name] || 
                                request.headers[name.toLowerCase()] || 
                                request.headers[name.toUpperCase()];
            return headerValue ? String(headerValue) : undefined;
        }
        
        // Handle Express-like get method
        if (request.get && typeof request.get === 'function') {
            try {
                const value = request.get(name);
                return value || undefined;
            } catch (error) {
                // Ignore errors from request.get
            }
        }
        
        // Try raw headers if available
        if (request.raw?.headers) {
            const value = request.raw.headers[name] || 
                          request.raw.headers[name.toLowerCase()] || 
                          request.raw.headers[name.toUpperCase()];
            return value ? String(value) : undefined;
        }
        
        return undefined;
    }
    
    /**
     * Gets all headers as an object
     */
    static getAllHeaders(request: NextRequest | any): Record<string, string> {
        if (!request || !request.headers) {
            return {};
        }
        
        // Handle NextRequest with Headers object
        if (request.headers instanceof Headers) {
            return Object.fromEntries(request.headers.entries());
        }
        
        // Handle NextRequest with get method
        if (typeof request.headers.get === 'function') {
            const headers: Record<string, string> = {};
            for (const name of this.COMMON_HEADERS) {
                const value = request.headers.get(name);
                if (value) {
                    headers[name] = value;
                }
            }
            return headers;
        }
        
        // Handle plain object
        if (typeof request.headers === 'object') {
            return Object.fromEntries(
                Object.entries(request.headers)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            );
        }
        
        // Handle Express-like headers object
        if (request.getHeaders && typeof request.getHeaders === 'function') {
            try {
                return request.getHeaders();
            } catch (error) {
                // Ignore errors
            }
        }
        
        // Try raw headers
        if (request.raw?.headers && typeof request.raw.headers === 'object') {
            return Object.fromEntries(
                Object.entries(request.raw.headers)
                    .filter(([_, v]) => v !== undefined && v !== null)
                    .map(([k, v]) => [k, String(v)])
            );
        }
        
        return {};
    }
    
    /**
     * Gets browser information from a user agent string
     */
    static getBrowserInfo(userAgent: string): string {
        return getBrowserInfo(userAgent);
    }
    
    /**
     * Gets OS information from a user agent string
     */
    static getOSInfo(userAgent: string): string {
        return getOSInfo(userAgent);
    }
    
    /**
     * Gets device type from a user agent string
     */
    static getDeviceType(userAgent: string): string {
        return getDeviceType(userAgent);
    }
    
    /**
     * Checks if a user agent string belongs to a bot
     */
    static isBot(userAgent: string): boolean {
        if (!userAgent || userAgent === 'unknown') return false;
        return this.BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    }
    
    /**
     * Gets device information from client hints
     * Modern browsers provide more accurate device info through client hints
     */
    static getClientHintDeviceInfo(request: NextRequest | any): string | undefined {
        const uaClientHint = this.getHeader(request, 'sec-ch-ua');
        const uaMobileClientHint = this.getHeader(request, 'sec-ch-ua-mobile');
        const uaPlatformClientHint = this.getHeader(request, 'sec-ch-ua-platform');
        
        if (uaMobileClientHint === '?1') {
            return 'Mobile';
        } else if (uaMobileClientHint === '?0' && uaPlatformClientHint) {
            // Return the platform as the device type if mobile=false and we have a platform
            if (typeof uaPlatformClientHint === 'string') {
                return uaPlatformClientHint.replace(/"/g, ''); // Remove quotes if present
            }
        }
        
        return undefined;
    }
    
    /**
     * Parses a user agent string
     */
    static parseUserAgent(userAgent: string): { browser: string; os: string; device: string } {
        return parseUserAgent(userAgent);
    }
    
    /**
     * Checks if an IP is valid
     */
    static isValidIp(ip: string): boolean {
        return isValidIp(ip);
    }
    
    /**
     * Checks if an IP is from a private network
     */
    static isPrivateIp(ip: string): boolean {
        return isPrivateIp(ip);
    }
    
    /**
     * Gets geographical information about an IP
     */
    static async getIpInfo(ip: string): Promise<any> {
        return getIpInfo(ip);
    }
    
    /**
     * Fallback method for geo IP lookup
     * This can be implemented with a different service than the primary
     */
    static async getFallbackGeoInfo(ip: string): Promise<any> {
        try {
            // Simple implementation that just returns limited data
            // In a real app, you might want to use a different API service here
            return {
                ip,
                country: 'Unknown',
                countryCode: 'XX',
                region: 'Unknown',
                city: 'Unknown',
                timezone: 'Unknown',
                provider: 'fallback',
            };
            
            // Alternative implementation could use a different API:
            // const response = await fetch(`https://ipapi.co/${ip}/json/`);
            // return await response.json();
        } catch (error) {
            console.error('Fallback geo IP lookup failed:', error);
            return {
                ip,
                country: 'Unknown',
                countryCode: 'XX',
                region: 'Unknown',
                city: 'Unknown',
                timezone: 'Unknown',
                error: 'Lookup failed',
            };
        }
    }
    
    /**
     * Gets geo information directly from the request in edge environments
     * This works specifically in Vercel edge functions
     */
    static getEdgeGeoInfo(request: NextRequest | any): Record<string, any> | undefined {
        try {
            // Access geo property which is available in edge runtimes
            const req = request as ExtendedNextRequest;
            
            if (req.geo) {
                return {
                    country: req.geo.country || 'Unknown',
                    countryCode: req.geo.country || 'XX',
                    region: req.geo.region || 'Unknown',
                    city: req.geo.city || 'Unknown',
                    latitude: req.geo.latitude,
                    longitude: req.geo.longitude,
                    source: 'edge-runtime'
                };
            }
        } catch (error) {
            console.warn('Failed to get geo info from edge runtime:', error);
        }
        
        return undefined;
    }
    
    /**`
     * Creates a mock client info object for testing or server rendering
     */
    static createMockClientInfo(): ClientInfo {
        return {
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            browser: 'Unknown',
            os: 'macOS',
            device: 'Desktop',
            referer: undefined,
            origin: absoluteUrl() as any,
            timestamp: new Date().toISOString(),
            isBot: false
        };
    }
}

// Export a singleton instance for direct use
export const clientInfo = ClientInfoService;

// Export the main function for easy access
export const getClientInfo = ClientInfoService.getClientInfo.bind(ClientInfoService);
