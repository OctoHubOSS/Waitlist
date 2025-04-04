import { ApiClientConfig } from '@/types/apiClient';

/**
 * Session manager for API client
 */
export class ApiSession {
    private config: ApiClientConfig;
    private sessionToken: string | null = null;

    constructor(config: ApiClientConfig) {
        this.config = config;
    }

    /**
     * Set session token
     */
    setToken(token: string): void {
        this.sessionToken = token;
    }

    /**
     * Get session token
     */
    getToken(): string | null {
        return this.sessionToken;
    }

    /**
     * Clear session token
     */
    clearToken(): void {
        this.sessionToken = null;
    }

    /**
     * Add session headers to request
     */
    addSessionHeaders(headers: Record<string, string>): Record<string, string> {
        if (this.sessionToken) {
            return {
                ...headers,
                'Authorization': `Bearer ${this.sessionToken}`
            };
        }
        return headers;
    }
} 