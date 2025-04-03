import { NextRequest } from 'next/server';

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
 * @param ip The IP Address to validate.
 * @returns A boolean (true or false).
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
 * Special implementation to get client IP in Next.js App Router or Pages Router
 * with Vercel deployment support, TypeScript friendly
 */
export function getClientIp(req: NextRequest | any): string {
    // Next.js App Router specific handling
    if (req instanceof NextRequest) {
        // The `ip` property might be available at runtime but isn't in the TypeScript type
        // Use optional chaining and type assertions to avoid TypeScript errors
        const ipProperty = (req as any).ip;
        if (ipProperty && isValidIp(ipProperty)) {
            return ipProperty;
        }
        
        // Try Vercel-specific header which is injected in Next.js App Router
        // Use null coalescing to handle potential undefined values
        const vercelIp = req.headers.get('x-vercel-forwarded-for') ?? 
                         req.headers.get('x-forwarded-for');
        
        if (vercelIp) {
            const firstIp = vercelIp.split(',')[0].trim();
            if (isValidIp(firstIp)) {
                return firstIp;
            }
        }
        
        // Try Cloudflare-specific headers
        const cfIp = req.headers.get('cf-connecting-ip');
        if (cfIp && isValidIp(cfIp)) {
            return cfIp;
        }
    }
    
    // Handle various request formats (Pages Router, API Routes, etc.)
    if (req) {
        // Common approach to get headers
        const headers = (() => {
            // Headers directly on req
            if (req.headers) {
                // Headers as object
                if (typeof req.headers === 'object' && !req.headers.get) {
                    return req.headers;
                }
                
                // Headers with get method (like NextRequest.headers)
                if (typeof req.headers.get === 'function') {
                    return {
                        'x-forwarded-for': req.headers.get('x-forwarded-for'),
                        'x-vercel-forwarded-for': req.headers.get('x-vercel-forwarded-for'),
                        'cf-connecting-ip': req.headers.get('cf-connecting-ip'),
                        'x-real-ip': req.headers.get('x-real-ip'),
                        'true-client-ip': req.headers.get('true-client-ip'),
                        'x-client-ip': req.headers.get('x-client-ip'),
                    };
                }
            }
            
            // Next.js req.connection
            if (req.connection && req.connection.remoteAddress) {
                return { 'x-real-ip': req.connection.remoteAddress };
            }
            
            // Next.js req.socket
            if (req.socket && req.socket.remoteAddress) {
                return { 'x-real-ip': req.socket.remoteAddress };
            }
            
            return {};
        })();
        
        // Check common IP headers in order of reliability
        const ipHeaders = [
            'x-vercel-forwarded-for', // Vercel specific
            'cf-connecting-ip',       // Cloudflare
            'true-client-ip',         // Akamai and Cloudflare
            'x-real-ip',              // Nginx
            'x-client-ip',            // Apache
            'x-forwarded-for'         // Standard
        ];
        
        for (const header of ipHeaders) {
            const value = headers[header] || headers[header.toLowerCase()];
            if (value) {
                // For x-forwarded-for, take the first IP
                const ip = header.includes('forwarded-for')
                    ? String(value).split(',')[0].trim()
                    : String(value);
                
                if (isValidIp(ip)) {
                    return ip;
                }
            }
        }
        
        // Next.js serverless function sometimes has ip on the req object
        if (req.ip && isValidIp(req.ip)) {
            return req.ip;
        }
        
        // Direct connection info (rare in modern setups)
        if (req.connection?.remoteAddress && isValidIp(req.connection.remoteAddress)) {
            return req.connection.remoteAddress;
        }
        
        if (req.socket?.remoteAddress && isValidIp(req.socket.remoteAddress)) {
            return req.socket.remoteAddress;
        }
        
        // Last resort - AWS Lambda specific
        if (req.requestContext?.identity?.sourceIp) {
            return req.requestContext.identity.sourceIp;
        }
    }
    
    return 'unknown';
}

/**
 * Gets information about an IP address (country, city, etc.)
 * 
 * This is a placeholder for geo IP lookup functionality.
 * Implementation will depend on your choice of geo IP service.
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
            isPrivate: ip !== 'unknown' && isPrivateIp(ip),
        };
    }
    
    try {
        // Implement a call to your preferred geo IP service
        // For example, using a free service like ipapi.co:
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

/**
 * Extract a single IP from potential comma-separated list
 */
export function extractSingleIp(ipString: string | null | undefined): string {
    if (!ipString) return '';
    const firstIp = ipString.split(',')[0].trim();
    return isValidIp(firstIp) ? firstIp : '';
}

/**
 * Gets the request IP in Vercel edge, middleware, or serverless environments
 */
export function getVercelRequestIp(headers: Headers | { get?: (name: string) => string | null }): string {
    try {
        // Handle standard Headers object (from NextRequest)
        if (headers && typeof headers === 'object') {
            // Check if headers has a get method (like Headers instance)
            if (typeof (headers as any).get === 'function') {
                const getMethod = (headers as any).get as (name: string) => string | null;
                
                // Try Vercel-specific headers first
                const vercelIp = getMethod('x-vercel-forwarded-for');
                if (vercelIp) {
                    const ip = extractSingleIp(vercelIp);
                    if (ip) return ip;
                }

                // Fall back to standard headers
                const forwardedFor = getMethod('x-forwarded-for');
                if (forwardedFor) {
                    const ip = extractSingleIp(forwardedFor);
                    if (ip) return ip;
                }
            } 
            // Handle plain object headers
            else {
                const headerObj = headers as Record<string, string | string[] | undefined>;
                
                // Try Vercel-specific headers first
                const vercelIp = headerObj['x-vercel-forwarded-for'] || headerObj['X-Vercel-Forwarded-For'];
                if (vercelIp) {
                    const ip = extractSingleIp(Array.isArray(vercelIp) ? vercelIp[0] : vercelIp);
                    if (ip) return ip;
                }

                // Fall back to standard headers
                const forwardedFor = headerObj['x-forwarded-for'] || headerObj['X-Forwarded-For'];
                if (forwardedFor) {
                    const ip = extractSingleIp(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor);
                    if (ip) return ip;
                }
            }
        }
    } catch (error) {
        console.warn('Error extracting IP from Vercel headers:', error);
    }

    return 'unknown';
}

/**
 * Anonymize IP for privacy (e.g., for analytics)
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