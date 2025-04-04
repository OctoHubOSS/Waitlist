import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

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
 * Gets the IP address from a NextRequest in Next.js 15
 * 
 * IMPORTANT: This function is specifically designed to extract the END USER'S IP address,
 * not the server's. It prioritizes headers that contain the original client IP.
 */
export function getClientIp(req?: NextRequest | any): string {
    // No request provided
    if (!req) {
        return 'unknown';
    }
    
    try {
        // Track if we've found any IP, even if it's a loopback or private IP
        let bestLoopbackOrPrivateIp: string | null = null;

        // 1. Check special header added by our middleware
        if (req.headers && typeof req.headers.get === 'function') {
            const realClientIp = req.headers.get('x-real-client-ip');
            if (realClientIp && isValidIp(realClientIp)) {
                // Use this IP even if it's loopback in development
                if (process.env.NODE_ENV !== 'production' || !isLoopbackIp(realClientIp)) {
                    return realClientIp;
                } else if (!bestLoopbackOrPrivateIp) {
                    bestLoopbackOrPrivateIp = realClientIp;
                }
            }
        } else if (req.headers && typeof req.headers === 'object') {
            const realClientIp = req.headers['x-real-client-ip'] || 
                               req.headers['X-Real-Client-Ip'];
            if (realClientIp && isValidIp(realClientIp)) {
                // Use this IP even if it's loopback in development
                if (process.env.NODE_ENV !== 'production' || !isLoopbackIp(realClientIp)) {
                    return realClientIp;
                } else if (!bestLoopbackOrPrivateIp) {
                    bestLoopbackOrPrivateIp = realClientIp;
                }
            }
        }

        // 2. Directly try IP from the property in edge runtime
        if (req.ip && isValidIp(req.ip)) {
            if (process.env.NODE_ENV !== 'production' || !isLoopbackIp(req.ip)) {
                return req.ip;
            } else if (!bestLoopbackOrPrivateIp) {
                bestLoopbackOrPrivateIp = req.ip;
            }
        }
        
        // 3. HIGHEST PRIORITY: Check standard headers
        const forwardedHeaders = [
            'x-forwarded-for',     // Standard header for forwarded IPs (first one is the client)
            'cf-connecting-ip',    // Cloudflare-specific real client IP header
            'true-client-ip',      // Akamai and some CDNs
            'x-real-ip',           // NGINX and others
            'x-client-ip',         // AWS and some load balancers
            'x-vercel-forwarded-for', // Vercel-specific
            'x-vercel-ip',         // Another Vercel variant
            'x-vercel-client-ip',  // Another potential Vercel header
            'x-forwarded',         // Alternative standard
            'forwarded-for',       // Older non-standard
            'forwarded'            // HTTP standard (rarely used correctly)
        ];
        
        let headerIp = null;
        
        // Check for headers via get() method (NextRequest style)
        if (req.headers && typeof req.headers.get === 'function') {
            for (const header of forwardedHeaders) {
                const value = req.headers.get(header);
                if (value) {
                    // Extract first IP for forwarded headers (client IP)
                    headerIp = header.toLowerCase().includes('forward') 
                        ? value.split(',')[0].trim() 
                        : value;
                    
                    if (isValidIp(headerIp)) {
                        if (process.env.NODE_ENV !== 'production' || !isLoopbackIp(headerIp)) {
                            return headerIp;
                        } else if (!bestLoopbackOrPrivateIp) {
                            bestLoopbackOrPrivateIp = headerIp;
                        }
                    }
                }
            }
        }
        
        // Check for headers via direct property (non-NextRequest style)
        if (req.headers && typeof req.headers === 'object') {
            for (const header of forwardedHeaders) {
                // Try various casing patterns as header names can vary
                const value = req.headers[header] || 
                              req.headers[header.toLowerCase()] || 
                              req.headers[header.toUpperCase()];
                              
                if (value) {
                    // Handle array or string
                    const rawValue = Array.isArray(value) ? value[0] : value;
                    
                    // Extract first IP for forwarded headers (client IP)
                    headerIp = header.toLowerCase().includes('forward') 
                        ? String(rawValue).split(',')[0].trim() 
                        : String(rawValue);
                    
                    if (isValidIp(headerIp)) {
                        if (process.env.NODE_ENV !== 'production' || !isLoopbackIp(headerIp)) {
                            return headerIp;
                        } else if (!bestLoopbackOrPrivateIp) {
                            bestLoopbackOrPrivateIp = headerIp;
                        }
                    }
                }
            }
        }
        
        // 4. Try raw connection info (rarely available in Next.js but try anyway)
        if (req.connection?.remoteAddress && isValidIp(req.connection.remoteAddress)) {
            return req.connection.remoteAddress;
        }
        
        if (req.socket?.remoteAddress && isValidIp(req.socket.remoteAddress)) {
            return req.socket.remoteAddress;
        }
        
        // 5. ADDITIONAL CHECK: Look for edge-specific request properties 
        // (for Vercel Edge Functions or other edge runtimes)
        const edgeReq = req as any;
        
        // Try to extract from various known edge runtime properties
        const possibleIpSources = [
            edgeReq.ip,
            edgeReq.clientIp,
            edgeReq.realIp,
            edgeReq.requestIp,
            edgeReq.headers?.['x-vercel-forwarded-for'],
            edgeReq.headers?.['x-forwarded-for']
        ];
        
        for (const ipSource of possibleIpSources) {
            if (ipSource && isValidIp(ipSource)) {
                return ipSource;
            }
        }
        
        // 6. FINAL FALLBACK: If we found a loopback or private IP earlier and we're in development mode,
        // return that rather than 'unknown' (useful for local development)
        if (bestLoopbackOrPrivateIp && process.env.NODE_ENV !== 'production') {
            return bestLoopbackOrPrivateIp;
        }
        
        return 'unknown';
    } catch (error) {
        console.error('Error getting client IP:', error);
        return 'unknown';
    }
}

/**
 * Gets IP from Next.js 15's headers() function in Server Components
 */
async function getIpFromNextHeaders(): Promise<string> {
    try {
        // Get headers with await - Next.js 15 returns a Promise
        const headersList = await headers();
        
        // Try headers in priority order
        const ipHeaderPriority = [
            'x-real-ip',
            'cf-connecting-ip',
            'true-client-ip',
            'x-forwarded-for',
            'x-client-ip',
            'x-vercel-forwarded-for'
        ];
        
        for (const header of ipHeaderPriority) {
            const value = headersList.get(header);
            if (value) {
                // Handle x-forwarded-for which might contain multiple IPs
                const ip = header.includes('forwarded-for')
                    ? value.split(',')[0].trim()
                    : value;
                
                if (isValidIp(ip) && !isPrivateIp(ip)) {
                    return ip;
                }
            }
        }
        
        return 'unknown';
    } catch (error) {
        console.error('Error getting IP from Next.js headers():', error);
        return 'unknown';
    }
}

/**
 * Extract IP from Headers object (NextRequest)
 */
function extractIpFromHeaders(headers: Headers): string | null {
    const ipHeaderPriority = [
        'x-real-ip',
        'cf-connecting-ip',
        'true-client-ip',
        'x-forwarded-for',
        'x-client-ip',
        'x-vercel-forwarded-for'
    ];
    
    for (const header of ipHeaderPriority) {
        const value = headers.get(header);
        if (value) {
            const ip = header.includes('forwarded-for')
                ? value.split(',')[0].trim()
                : value;
            
            if (isValidIp(ip) && !isPrivateIp(ip)) {
                return ip;
            }
        }
    }
    
    return null;
}

/**
 * Extract IP from headers object (regular request)
 */
function extractIpFromHeadersObject(headers: Record<string, any>): string | null {
    const ipHeaderPriority = [
        'x-real-ip',
        'cf-connecting-ip',
        'true-client-ip',
        'x-forwarded-for',
        'x-client-ip',
        'x-vercel-forwarded-for'
    ];
    
    for (const header of ipHeaderPriority) {
        // Check for different case variations
        const value = headers[header] || 
                     headers[header.toLowerCase()] || 
                     headers[header.toUpperCase()];
                     
        if (value) {
            // Handle array or string
            const rawValue = Array.isArray(value) ? value[0] : value;
            
            // Handle x-forwarded-for which might contain multiple IPs
            const ip = header.includes('forwarded-for')
                ? String(rawValue).split(',')[0].trim()
                : String(rawValue);
            
            if (isValidIp(ip) && !isPrivateIp(ip)) {
                return ip;
            }
        }
    }
    
    return null;
}

/**
 * Checks if a string is a valid IP address
 */
export function isValidIp(ip: string): boolean {
    // Special handling for localhost IPv6
    if (ip === '::1') {
        return true;
    }
    
    // Basic format check for IPv4
    if (IPV4_PATTERN.test(ip)) {
        return ip.split('.').every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255;
        });
    }
    
    // Improved IPv6 validation - more flexible than the strict pattern
    if (ip.includes(':')) {
        // A simple check for basic IPv6 format
        // This is less strict than the original regex but catches common IPv6 formats
        const segments = ip.split(':').filter(Boolean);
        return segments.length > 0 && segments.length <= 8;
    }

    return false;
}

/**
 * Checks if an IP address is from a private network
 */
export function isPrivateIp(ip: string): boolean {
    return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

/**
 * Extracts the first IP address from a string that might contain multiple IPs
 */
export function extractSingleIp(ipString: string): string {
    if (!ipString) return '';
    const firstIp = ipString.split(',')[0].trim();
    return isValidIp(firstIp) ? firstIp : '';
}

/**
 * Gets the client IP address with Vercel-specific handling
 */
export function getVercelRequestIp(headers: Headers | Record<string, string>): string {
    try {
        // First try Vercel-specific header
        let vercelForwardedFor: string | null | undefined = null;
        
        if (typeof headers.get === 'function') {
            vercelForwardedFor = headers.get('x-vercel-forwarded-for');
        } else {
            // Safely access headers for the record type
            vercelForwardedFor = (headers as Record<string, string>)['x-vercel-forwarded-for'] || 
                               (headers as Record<string, string>)['X-Vercel-Forwarded-For'];
        }
        
        if (vercelForwardedFor) {
            const ip = extractSingleIp(String(vercelForwardedFor));
            if (ip) return ip;
        }
        
        // Then try standard forwarded-for
        let forwardedFor: string | null | undefined = null;
        
        if (typeof headers.get === 'function') {
            forwardedFor = headers.get('x-forwarded-for');
        } else {
            forwardedFor = (headers as Record<string, string>)['x-forwarded-for'] || 
                          (headers as Record<string, string>)['X-Forwarded-For'];
        }
        
        if (forwardedFor) {
            const ip = extractSingleIp(String(forwardedFor));
            if (ip) return ip;
        }
    } catch (error) {
        console.error('Error getting IP from Vercel headers:', error);
    }
    
    return 'unknown';
}

/**
 * Anonymizes an IP address for privacy purposes
 */
export function anonymizeIp(ip: string): string {
    if (!isValidIp(ip)) return ip;
    
    // For IPv4, replace last octet with 0
    if (IPV4_PATTERN.test(ip)) {
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    
    // For IPv6, remove last 80 bits (last 5 segments)
    if (IPV6_PATTERN.test(ip)) {
        const parts = ip.split(':');
        return `${parts.slice(0, 3).join(':')}:0:0:0:0:0`;
    }
    
    return ip;
}

/**
 * Gets geographical information about an IP address from external service
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
            isPrivate: ip !== 'unknown' && isPrivateIp(ip)
        };
    }
    
    try {
        // Call to free IP geolocation service
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        
        if (!response.ok) {
            throw new Error(`ipapi.co returned ${response.status}`);
        }
        
        const data = await response.json();
        
        // If the API returns an error message
        if (data.error) {
            throw new Error(data.reason || 'IP lookup failed');
        }
        
        return {
            ip,
            country: data.country_name,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
            timezone: data.timezone,
            latitude: data.latitude,
            longitude: data.longitude,
            asn: data.asn,
            isp: data.org,
            source: 'ipapi.co'
        };
    } catch (error) {
        console.error('IP info lookup failed:', error);
        
        // Return minimal info on failure
        return {
            ip,
            country: 'Unknown',
            countryCode: 'XX',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'Unknown',
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// Add a new async version for server components
export async function getClientIpAsync(req?: NextRequest | any): Promise<string> {
    // No request provided
    if (!req) {
        try {
            // Now we can properly await the async function
            return await getIpFromNextHeaders();
        } catch (e) {
            return 'unknown';
        }
    }
    
    // Use the standard implementation for cases with request object
    return getClientIp(req);
}

/**
 * Checks if an IP is a loopback address (127.x.x.x or ::1)
 */
export function isLoopbackIp(ip: string): boolean {
    return ip === '::1' || /^127\./.test(ip);
}

/**
 * Checks if an IP is valid and not a private/internal address
 */
export function isValidPublicIp(ip: string): boolean {
    return isValidIp(ip) && !isPrivateIp(ip) && !isLoopbackIp(ip);
}