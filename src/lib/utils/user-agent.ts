/**
 * Utility functions for parsing user agent strings
 */

/**
 * Extracts browser information from user agent string
 */
export function getBrowserInfo(userAgent: string): string {
    const browsers = [
        { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
        { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
        { name: 'Safari', pattern: /Safari\/([0-9.]+)/ },
        { name: 'Edge', pattern: /Edge\/([0-9.]+)/ },
        { name: 'Opera', pattern: /Opera\/([0-9.]+)/ },
    ];

    for (const browser of browsers) {
        const match = userAgent.match(browser.pattern);
        if (match) {
            return `${browser.name} ${match[1]}`;
        }
    }

    return 'Unknown';
}

/**
 * Extracts OS information from user agent string
 */
export function getOSInfo(userAgent: string): string {
    const osPatterns = [
        { name: 'Windows', pattern: /Windows NT ([0-9.]+)/ },
        { name: 'MacOS', pattern: /Mac OS X ([0-9._]+)/ },
        { name: 'Linux', pattern: /Linux/ },
        { name: 'Android', pattern: /Android/ },
        { name: 'iOS', pattern: /iPhone|iPad|iPod/ },
    ];

    for (const os of osPatterns) {
        const match = userAgent.match(os.pattern);
        if (match) {
            return os.name + (match[1] ? ` ${match[1]}` : '');
        }
    }

    return 'Unknown';
}

/**
 * Extracts device type from user agent string
 */
export function getDeviceType(userAgent: string): string {
    if (userAgent.includes('Mobile')) {
        return 'Mobile';
    } else if (userAgent.includes('Tablet')) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

/**
 * Parses a user agent string and returns comprehensive information
 */
export function parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
} {
    return {
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        device: getDeviceType(userAgent)
    };
}
