/**
 * Utility functions for parsing user agent strings
 */

/**
 * Extracts browser information from user agent string
 */
export function getBrowserInfo(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    
    const browsers = [
        { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
        { name: 'Edge', pattern: /Edg(e)?\/([0-9.]+)/ },
        { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
        { name: 'Safari', pattern: /Safari\/([0-9.]+)/ },
        { name: 'Opera', pattern: /OPR\/([0-9.]+)/ },
        { name: 'IE', pattern: /Trident\/([0-9.]+)/ },
        { name: 'Samsung Browser', pattern: /SamsungBrowser\/([0-9.]+)/ },
        { name: 'UC Browser', pattern: /UCBrowser\/([0-9.]+)/ },
        { name: 'YaBrowser', pattern: /YaBrowser\/([0-9.]+)/ },
        { name: 'Chrome iOS', pattern: /CriOS\/([0-9.]+)/ },
        { name: 'Firefox iOS', pattern: /FxiOS\/([0-9.]+)/ },
    ];

    // Special case for Chrome vs. Chromium
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
        const match = userAgent.match(/Chrome\/([0-9.]+)/);
        if (match) return `Chrome ${match[1]}`;
    }

    // Special case for Chromium
    if (userAgent.includes('Chromium')) {
        const match = userAgent.match(/Chromium\/([0-9.]+)/);
        if (match) return `Chromium ${match[1]}`;
    }

    for (const browser of browsers) {
        const match = userAgent.match(browser.pattern);
        if (match) {
            return `${browser.name} ${match[1] || match[2]}`;
        }
    }

    return 'Unknown';
}

/**
 * Extracts OS information from user agent string
 */
export function getOSInfo(userAgent: string): string {
    if (!userAgent) return 'Unknown';

    const osPatterns = [
        // Windows versions
        { name: 'Windows 11', pattern: /Windows NT 11/ },
        { name: 'Windows 10', pattern: /Windows NT 10/ },
        { name: 'Windows 8.1', pattern: /Windows NT 6.3/ },
        { name: 'Windows 8', pattern: /Windows NT 6.2/ },
        { name: 'Windows 7', pattern: /Windows NT 6.1/ },
        { name: 'Windows Vista', pattern: /Windows NT 6.0/ },
        { name: 'Windows XP', pattern: /Windows NT 5.1/ },
        { name: 'Windows', pattern: /Windows NT ([0-9.]+)/ },
        
        // macOS versions (best effort, as UA strings don't always include specific versions)
        { name: 'macOS Sonoma', pattern: /Mac OS X 14[._]/ },
        { name: 'macOS Ventura', pattern: /Mac OS X 13[._]/ },
        { name: 'macOS Monterey', pattern: /Mac OS X 12[._]/ },
        { name: 'macOS Big Sur', pattern: /Mac OS X 11[._]/ },
        { name: 'macOS Catalina', pattern: /Mac OS X 10[._]15/ },
        { name: 'macOS Mojave', pattern: /Mac OS X 10[._]14/ },
        { name: 'macOS', pattern: /Mac OS X ([0-9._]+)/ },
        
        // iOS versions
        { name: 'iOS', pattern: /iPhone OS ([0-9_]+)/ },
        { name: 'iPadOS', pattern: /iPad.*OS ([0-9_]+)/ },
        
        // Android versions
        { name: 'Android', pattern: /Android ([0-9.]+)/ },
        
        // Linux distributions
        { name: 'Ubuntu', pattern: /Ubuntu/ },
        { name: 'Fedora', pattern: /Fedora/ },
        { name: 'Debian', pattern: /Debian/ },
        { name: 'Linux', pattern: /Linux/ },
        
        // Other platforms
        { name: 'Chrome OS', pattern: /CrOS/ },
        { name: 'PlayStation', pattern: /PlayStation/ },
        { name: 'Xbox', pattern: /Xbox/ },
        { name: 'Nintendo', pattern: /Nintendo/ },
    ];

    for (const os of osPatterns) {
        const match = userAgent.match(os.pattern);
        if (match) {
            // Format the version if available
            if (match[1]) {
                // Replace underscores with dots for iOS/iPadOS versions
                let version = match[1].replace(/_/g, '.');
                return `${os.name} ${version}`;
            }
            return os.name;
        }
    }

    return 'Unknown';
}

/**
 * Extracts device type from user agent string
 */
export function getDeviceType(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    
    // Check for mobile devices first
    if (
        /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
        userAgent.includes('Mobi')
    ) {
        // Distinguish between tablets and phones
        if (
            /iPad|Android(?!.*Mobile)|Tablet|PlayBook/i.test(userAgent) &&
            !/Mobile/i.test(userAgent)
        ) {
            return 'Tablet';
        }
        return 'Mobile';
    }
    
    // Check for specific device types
    if (/TV|SmartTV|SMART-TV|NetCast|NETTV|DLNA|CE-HTML/i.test(userAgent)) {
        return 'TV';
    }
    
    if (/PlayStation|Xbox|Nintendo/i.test(userAgent)) {
        return 'Game Console';
    }
    
    if (/Kindle|Nook|Silk/i.test(userAgent)) {
        return 'E-Reader';
    }

    // Fallback to desktop classification
    return 'Desktop';
}

/**
 * Checks if the user agent seems to be a bot/crawler
 */
export function isBot(userAgent: string): boolean {
    if (!userAgent) return false;
    
    const botPatterns = [
        /bot/i, /spider/i, /crawler/i, /lighthouse/i, /slurp/i,
        /googlebot/i, /bingbot/i, /yandex/i, /baidu/i, /duckduckbot/i,
        /facebookexternalhit/i, /twitterbot/i, /rogerbot/i, /linkedinbot/i,
        /embedly/i, /quora link preview/i, /screaming frog/i, /pingdom/i,
        /phantomjs/i, /headless/i, /chrome-lighthouse/i, /pingbot/i, /apachebench/i,
        /sitespeed/i, /gtmetrix/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Parses a user agent string and returns comprehensive information
 */
export function parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
    isBot: boolean;
} {
    if (!userAgent) {
        return {
            browser: 'Unknown',
            os: 'Unknown',
            device: 'Unknown',
            isBot: false
        };
    }
    
    return {
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent),
        device: getDeviceType(userAgent),
        isBot: isBot(userAgent)
    };
}

/**
 * Extracts specific browser details for analytics
 */
export function getBrowserDetails(userAgent: string): {
    engine: string;
    browserName: string;
    browserVersion: string;
} {
    let engine = 'Unknown';
    let browserName = 'Unknown';
    let browserVersion = '';
    
    if (!userAgent) {
        return { engine, browserName, browserVersion };
    }
    
    // Detect rendering engine
    if (userAgent.includes('Gecko/')) {
        engine = 'Gecko';
    } else if (userAgent.includes('AppleWebKit')) {
        engine = 'WebKit';
    } else if (userAgent.includes('Trident')) {
        engine = 'Trident';
    } else if (userAgent.includes('Presto')) {
        engine = 'Presto';
    } else if (userAgent.includes('Blink')) {
        engine = 'Blink';
    }
    
    // Extract browser name and version more precisely
    const fullBrowserInfo = getBrowserInfo(userAgent);
    const parts = fullBrowserInfo.split(' ');
    
    if (parts.length >= 2) {
        browserName = parts[0];
        browserVersion = parts.slice(1).join(' ');
    } else {
        browserName = fullBrowserInfo;
    }
    
    return { engine, browserName, browserVersion };
}

/**
 * Creates a simplified user agent string for privacy purposes
 */
export function createSimplifiedUserAgent(userAgent: string): string {
    if (!userAgent) return 'Unknown/0.0.0';
    
    const { browser, os, device } = parseUserAgent(userAgent);
    return `${browser} (${os}; ${device})`;
}
