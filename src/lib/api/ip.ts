import { NextRequest } from 'next/server';

type Headers = Record<string, string | string[] | undefined>;

// IP validation regex patterns
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

// Private IP ranges that we want to filter out
const PRIVATE_IP_RANGES = [
    // Localhost
    /^127\./,
    /^::1$/,
    // Private networks
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    // Link-local
    /^169\.254\./,
    /^fe80::/,
    // Reserved
    /^0\./,
    /^fc00::/
];

/**
 * Validates if a string is a valid IP address
 */
export function isValidIp(ip: string): boolean {
    // Basic format check
    if (!IPV4_PATTERN.test(ip) && !IPV6_PATTERN.test(ip)) {
        return false;
    }

    // For IPv4, check each octet is valid
    if (IPV4_PATTERN.test(ip)) {
        return ip.split('.').every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });
    }

    return true;
}

/**
 * Checks if an IP address is a private network address
 */
export function isPrivateIp(ip: string): boolean {
    return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

/**
 * Gets the client's IP address from a request or headers object
 */
export function getClientIp(reqOrHeaders: NextRequest | Headers | any): string {
    // Helper function to get header value
    const getHeader = (headers: Headers, name: string): string | null => {
        const value = headers[name.toLowerCase()] || headers[name];
        if (!value) return null;
        return Array.isArray(value) ? value[0] : value;
    };

    // Get headers from either NextRequest, headers object, or any custom structure
    const headers: Headers = (() => {
        if (reqOrHeaders instanceof NextRequest) {
            return Object.fromEntries(reqOrHeaders.headers);
        }
        
        if (reqOrHeaders && reqOrHeaders.headers && typeof reqOrHeaders.headers.get === 'function') {
            // Handle objects with headers property that has a get method
            const headerObj: Headers = {};
            
            // Extract standard headers that might contain client IP
            ['cf-connecting-ip', 'true-client-ip', 'x-real-ip', 'x-client-ip', 'x-forwarded-for']
                .forEach(name => {
                    const value = reqOrHeaders.headers.get(name);
                    if (value) headerObj[name] = value;
                });
                
            return headerObj;
        }
        
        if (reqOrHeaders && typeof reqOrHeaders === 'object') {
            return reqOrHeaders.headers || reqOrHeaders;
        }
        
        return {};
    })();

    // Try to get client IP from various headers in order of reliability
    const headerNames = [
        'cf-connecting-ip', // Cloudflare (most reliable for client IP)
        'true-client-ip', // Akamai and other CDNs
        'x-real-ip', // Nginx real IP
        'x-client-ip', // Apache client IP
        'x-forwarded-for', // Standard proxy header
    ];

    for (const header of headerNames) {
        const value = getHeader(headers, header);
        if (!value) continue;
        
        // Handle x-forwarded-for which can contain multiple IPs
        if (header.toLowerCase() === 'x-forwarded-for') {
            // Get all IPs in the list
            const ips = value.split(',').map(ip => ip.trim());

            // Find the first valid IP that's not localhost or private network
            const clientIp = ips.find(ip =>
                isValidIp(ip) &&
                !isPrivateIp(ip)
            );

            if (clientIp) return clientIp;
        } else {
            // For other headers, validate the IP
            if (isValidIp(value) && !isPrivateIp(value)) {
                return value;
            }
        }
    }

    // Try to get from socket if available
    if (reqOrHeaders && reqOrHeaders.socket && reqOrHeaders.socket.remoteAddress) {
        const ip = reqOrHeaders.socket.remoteAddress;
        if (isValidIp(ip) && !isPrivateIp(ip)) {
            return ip;
        }
    }

    // If no valid client IP found, return unknown
    return 'unknown';
}

/**
 * Gets information about an IP address (country, city, etc.)
 * This is a placeholder for geo IP lookup functionality
 */
export async function getIpInfo(ip: string): Promise<any> {
    if (ip === 'unknown' || isPrivateIp(ip)) {
        return {
            ip,
            country: 'Unknown',
            countryCode: 'XX',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'Unknown',
        };
    }
    
    // This could be expanded to use a real GeoIP service
    // For now, return a placeholder
    return {
        ip,
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown',
    };
}