import { ApiConfig } from '@/types/apiClient';
import { TIMEOUTS, RETRY_SETTINGS } from './constants';

/**
 * Helper function to get base URL that works in both server and client environments
 */
export function getBaseUrl(): string {
    // Browser should use relative path
    if (typeof window !== 'undefined') {
        return '';
    }

    // Get environment values
    const vercelUrl = process.env.VERCEL_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Return appropriate URL
    if (vercelUrl) {
        return `https://${vercelUrl}`;
    }

    if (appUrl) {
        return appUrl.startsWith('http') ? appUrl : `http://${appUrl}`;
    }

    return 'http://localhost:3000';
}

/**
 * Default API configuration
 */
export const defaultConfig: ApiConfig = {
    baseUrl: `${getBaseUrl()}/api`,
    timeout: TIMEOUTS.DEFAULT,
    retries: RETRY_SETTINGS.MAX_RETRIES,
    retryDelay: RETRY_SETTINGS.RETRY_DELAY,
    useSession: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

/**
 * Development API configuration
 */
export const developmentConfig: ApiConfig = {
    ...defaultConfig,
    timeout: TIMEOUTS.DEFAULT * 2, // Longer timeouts for development
    retries: RETRY_SETTINGS.MAX_RETRIES + 2, // More retries for development
    retryDelay: RETRY_SETTINGS.RETRY_DELAY * 2, // Longer retry delay for development
};

/**
 * Production API configuration
 */
export const productionConfig: ApiConfig = {
    ...defaultConfig,
    timeout: TIMEOUTS.DEFAULT,
    retries: RETRY_SETTINGS.MAX_RETRIES,
    retryDelay: RETRY_SETTINGS.RETRY_DELAY,
};

/**
 * Test API configuration
 */
export const testConfig: ApiConfig = {
    ...defaultConfig,
    timeout: TIMEOUTS.QUICK,
    retries: 1,
    retryDelay: 0,
};

/**
 * Gets the appropriate API configuration based on the environment
 */
export function getApiConfig(): ApiConfig {
    const env = process.env.NODE_ENV;

    switch (env) {
        case 'development':
            return developmentConfig;
        case 'production':
            return productionConfig;
        case 'test':
            return testConfig;
        default:
            return defaultConfig;
    }
}

/**
 * Creates a custom API configuration by merging with the default config
 */
export function createApiConfig(config: Partial<ApiConfig>): ApiConfig {
    return {
        ...defaultConfig,
        ...config,
        // Merge headers properly
        headers: {
            ...defaultConfig.headers,
            ...config.headers,
        },
    };
}

/**
 * Creates a server-side API configuration with appropriate base URL
 */
export function createServerApiConfig(config: Partial<ApiConfig> = {}): ApiConfig {
    const baseConfig = createApiConfig(config);

    // Always use internal URL for server-side requests
    baseConfig.baseUrl = `${getBaseUrl()}/api`;
    baseConfig.useSession = false; // Don't auto-fetch session on server

    return baseConfig;
}

/**
 * Creates a client-side API configuration
 */
export function createClientApiConfig(config: Partial<ApiConfig> = {}): ApiConfig {
    const baseConfig = createApiConfig(config);

    // Use relative URL for client-side requests if not specified
    baseConfig.baseUrl = config.baseUrl || '/api';
    baseConfig.useSession = config.useSession !== undefined ? config.useSession : true;

    console.log('Client API config baseUrl:', baseConfig.baseUrl);

    return baseConfig;
}

/**
 * Validates an API configuration
 */
export function validateApiConfig(config: ApiConfig): boolean {
    if (!config.baseUrl) {
        console.error('API configuration error: baseUrl is required');
        return false;
    }

    if (config.timeout !== undefined && config.timeout < 0) {
        console.error('API configuration error: timeout must be positive');
        return false;
    }

    if (config.retries !== undefined && config.retries < 0) {
        console.error('API configuration error: retries must be positive');
        return false;
    }

    if (config.retryDelay !== undefined && config.retryDelay < 0) {
        console.error('API configuration error: retryDelay must be positive');
        return false;
    }

    return true;
} 