import { absoluteUrl } from './absoluteUrl';

/**
 * URL Environment settings
 */
export interface UrlEnvironment {
  baseUrl: string;
  apiPath?: string;
  assetsPath?: string;
  cdnUrl?: string;
  secure?: boolean;
}

/**
 * URL Builder configuration
 */
export interface UrlBuilderConfig {
  development: UrlEnvironment;
  production: UrlEnvironment;
  test?: UrlEnvironment;
  [key: string]: UrlEnvironment | undefined;
}

/**
 * URL Builder class for managing application URLs across environments
 */
export class UrlBuilder {
  private config: UrlBuilderConfig;
  private currentEnvironment: string;
  private customEnvironment?: UrlEnvironment;

  /**
   * Creates a new URL Builder
   * 
   * @param config - Environment configuration
   * @param environment - Current environment (defaults to NODE_ENV)
   */
  constructor(config: UrlBuilderConfig, environment?: string) {
    this.config = config;
    this.currentEnvironment = environment || process.env.NODE_ENV || 'development';
  }

  /**
   * Gets the current environment settings
   */
  private getEnvironment(): UrlEnvironment {
    // If a custom environment is set, use it
    if (this.customEnvironment) {
      return this.customEnvironment;
    }

    // Otherwise look for the environment in config
    const env = this.config[this.currentEnvironment];
    
    if (!env) {
      // Fall back to development if current environment isn't configured
      return this.config.development;
    }
    
    return env;
  }

  /**
   * Sets a custom environment temporarily (useful for testing)
   */
  public setCustomEnvironment(env: UrlEnvironment | null): this {
    this.customEnvironment = env || undefined;
    return this;
  }

  /**
   * Changes the current environment
   */
  public setEnvironment(environment: string): this {
    this.currentEnvironment = environment;
    return this;
  }

  /**
   * Gets the base URL for the current environment
   */
  public getBaseUrl(): string {
    const env = this.getEnvironment();
    
    // Handle case where baseUrl is already fully qualified
    if (env.baseUrl.startsWith('http')) {
      return env.baseUrl;
    }
    
    // Otherwise construct URL with protocol
    const protocol = env.secure !== false ? 'https' : 'http';
    return `${protocol}://${env.baseUrl}`;
  }

  /**
   * Gets the API base URL
   */
  public getApiUrl(): string {
    const env = this.getEnvironment();
    const baseUrl = this.getBaseUrl();
    const apiPath = env.apiPath || '/api';
    
    // Ensure path starts with slash
    const normalizedPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    
    return `${baseUrl}${normalizedPath}`;
  }

  /**
   * Gets the assets URL
   */
  public getAssetsUrl(): string {
    const env = this.getEnvironment();
    
    // Use CDN if available
    if (env.cdnUrl) {
      return env.cdnUrl;
    }
    
    const baseUrl = this.getBaseUrl();
    const assetsPath = env.assetsPath || '/assets';
    
    // Ensure path starts with slash
    const normalizedPath = assetsPath.startsWith('/') ? assetsPath : `/${assetsPath}`;
    
    return `${baseUrl}${normalizedPath}`;
  }

  /**
   * Creates an absolute URL for a given path
   * 
   * @param path - Relative path to append to base URL
   * @param params - Optional query parameters
   * @returns Full absolute URL
   */
  public url(path: string, params?: Record<string, string>): string {
    const baseUrl = this.getBaseUrl();
    
    // Normalize path to ensure it starts with / but doesn't duplicate with baseUrl
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Create URL
    const url = new URL(normalizedPath, baseUrl);
    
    // Add query params if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Creates an API URL
   * 
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   * @returns Full API URL
   */
  public apiUrl(endpoint: string, params?: Record<string, string>): string {
    const apiBaseUrl = this.getApiUrl();
    
    // Normalize path to ensure it starts with / but doesn't duplicate with baseUrl
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Create URL
    const url = new URL(normalizedEndpoint, apiBaseUrl);
    
    // Add query params if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Creates an asset URL
   * 
   * @param path - Asset path
   * @param params - Optional query parameters
   * @returns Full asset URL
   */
  public assetUrl(path: string, params?: Record<string, string>): string {
    const assetsBaseUrl = this.getAssetsUrl();
    
    // Normalize path to ensure it starts with / but doesn't duplicate with baseUrl
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Create URL
    const url = new URL(normalizedPath, assetsBaseUrl);
    
    // Add query params if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Fallback to use the original absoluteUrl function
   * This maintains compatibility with existing code
   */
  public absoluteUrl(): URL {
    return absoluteUrl();
  }
}

// Create a default configuration using environment variables
const defaultConfig: UrlBuilderConfig = {
  development: {
    baseUrl: process.env.NEXT_PUBLIC_DEV_URL || 'localhost:3000',
    apiPath: '/api',
    secure: false
  },
  production: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'octohub.dev',
    apiPath: '/api',
    secure: true
  },
  test: {
    baseUrl: 'test.octohub.dev',
    apiPath: '/api',
    secure: true
  }
};

// Export a singleton instance with default config
export const urlBuilder = new UrlBuilder(defaultConfig);

/**
 * Create an application URL with the current environment settings
 * 
 * @param path - Relative path
 * @param params - Optional query parameters
 * @returns Absolute URL
 */
export function appUrl(path: string = '/', params?: Record<string, string>): string {
  return urlBuilder.url(path, params);
}

/**
 * Create an API URL with the current environment settings
 * 
 * @param endpoint - API endpoint
 * @param params - Optional query parameters
 * @returns Absolute API URL
 */
export function apiUrl(endpoint: string = '/', params?: Record<string, string>): string {
  return urlBuilder.apiUrl(endpoint, params);
}

/**
 * Create an asset URL with the current environment settings
 * 
 * @param path - Asset path
 * @param params - Optional query parameters
 * @returns Absolute asset URL
 */
export function assetUrl(path: string, params?: Record<string, string>): string {
  return urlBuilder.assetUrl(path, params);
}
