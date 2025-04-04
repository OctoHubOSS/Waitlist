import { createAbsoluteUrl, combineUrlParts, addQueryParams, getBaseUrl, QueryParams } from '@/utils/url';

/**
 * Supported environment types for URL configuration
 */
export type Environment = 'development' | 'production' | 'test' | 'staging' | string;

/**
 * Configuration settings for different environments
 */
export interface EnvironmentConfig {
    baseUrl: string;
    apiPath: string;
    assetPath?: string;
    cdnUrl?: string;
    secure: boolean;
}

// Default environment configurations
const defaultConfigs: Record<string, EnvironmentConfig> = {
    development: {
        baseUrl: 'localhost:3000',
        apiPath: '/api',
        assetPath: '/assets',
        secure: false
    },
    production: {
        baseUrl: 'octohub.dev',
        apiPath: '/api',
        assetPath: '/assets',
        secure: true
    },
    test: {
        baseUrl: 'test.octohub.dev',
        apiPath: '/api',
        assetPath: '/assets',
        secure: true
    },
    staging: {
        baseUrl: 'staging.octohub.dev',
        apiPath: '/api',
        assetPath: '/assets',
        secure: true
    }
};

// Override with environment variables when available
if (process.env.NEXT_PUBLIC_DEV_URL) {
    defaultConfigs.development.baseUrl = process.env.NEXT_PUBLIC_DEV_URL;
}

if (process.env.NEXT_PUBLIC_APP_URL) {
    defaultConfigs.production.baseUrl = process.env.NEXT_PUBLIC_APP_URL;
}

/**
 * URL Builder class for generating environment-aware URLs
 */
class UrlBuilder {
    private currentEnv: Environment = 
        process.env.NODE_ENV || 'development';
    private customConfig: EnvironmentConfig | null = null;

    /**
     * Gets the current environment configuration
     * @returns The current environment configuration
     */
    private getConfig(): EnvironmentConfig {
        if (this.customConfig) {
            return this.customConfig;
        }
        
        return defaultConfigs[this.currentEnv] || defaultConfigs.development;
    }

    /**
     * Set the current environment
     * @param env - The environment to use
     * @returns The builder instance for chaining
     */
    setEnvironment(env: Environment): UrlBuilder {
        this.currentEnv = env;
        return this;
    }

    /**
     * Set a custom environment configuration
     * @param config - Custom configuration or null to reset
     * @returns The builder instance for chaining
     */
    setCustomEnvironment(config: EnvironmentConfig | null): UrlBuilder {
        this.customConfig = config;
        return this;
    }

    /**
     * Create a full URL with the current environment
     * @param path - The path to append to the base URL
     * @param params - Optional query parameters
     * @returns The complete URL
     */
    url(path: string = '', params?: QueryParams): string {
        const config = this.getConfig();
        const protocol = config.secure ? 'https' : 'http';
        const baseUrl = `${protocol}://${config.baseUrl}`;
        
        const fullUrl = createAbsoluteUrl(path, baseUrl);
        return addQueryParams(fullUrl, params);
    }

    /**
     * Create an API URL with the current environment
     * @param endpoint - The API endpoint path
     * @param params - Optional query parameters
     * @returns The complete API URL
     */
    apiUrl(endpoint: string = '', params?: QueryParams): string {
        const config = this.getConfig();
        const path = combineUrlParts(config.apiPath, endpoint);
        return this.url(path, params);
    }

    /**
     * Create an asset URL with the current environment
     * @param path - The asset path
     * @param params - Optional query parameters
     * @returns The complete asset URL
     */
    assetUrl(path: string = '', params?: QueryParams): string {
        const config = this.getConfig();
        
        // Use CDN if configured
        if (config.cdnUrl) {
            const protocol = config.secure ? 'https' : 'http';
            const baseUrl = `${protocol}://${config.cdnUrl}`;
            const fullUrl = createAbsoluteUrl(path, baseUrl);
            return addQueryParams(fullUrl, params);
        }
        
        // Otherwise use asset path on main domain
        const assetPath = config.assetPath || '/assets';
        const fullPath = combineUrlParts(assetPath, path);
        return this.url(fullPath, params);
    }
}

// Singleton instance
const urlBuilder = new UrlBuilder();

/**
 * Create an application URL
 * @param path - The path to append to the base URL
 * @param params - Optional query parameters
 * @returns The complete application URL
 */
export const appUrl = (path: string = '', params?: QueryParams): string => {
    return urlBuilder.url(path, params);
};

/**
 * Create an API URL
 * @param endpoint - The API endpoint path
 * @param params - Optional query parameters
 * @returns The complete API URL
 */
export const apiUrl = (endpoint: string = '', params?: QueryParams): string => {
    return urlBuilder.apiUrl(endpoint, params);
};

/**
 * Create an asset URL
 * @param path - The asset path
 * @param params - Optional query parameters
 * @returns The complete asset URL
 */
export const assetUrl = (path: string = '', params?: QueryParams): string => {
    return urlBuilder.assetUrl(path, params);
};

/**
 * Get the base URL of the application
 * @returns The base URL
 */
export const absoluteUrl = (): string => {
    return getBaseUrl();
};

export { urlBuilder };
