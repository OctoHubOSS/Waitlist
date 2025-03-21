import { ApiToken, TokenType, User, Organization } from '@prisma/client';

/**
 * Token with owner information
 */
export interface TokenWithOwner extends ApiToken {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    } | null;
    org?: {
        id: string;
        name: string;
        displayName?: string | null;
    } | null;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
    valid: boolean;
    token?: TokenWithOwner;
    error?: string;
}

/**
 * Options for token generation
 */
export interface TokenGenerationOptions {
    name: string;
    description?: string;
    type: TokenType;
    scopes: string[];
    expiresIn?: number; // Days until expiration
    rateLimit?: number; // Requests per hour
    allowedIps?: string[]; // IP addresses or CIDR ranges
    allowedReferrers?: string[]; // Allowed referrer domains
    userId?: string; // User owner
    orgId?: string; // Organization owner
}

/**
 * Created token response
 */
export interface CreatedToken {
    id: string;
    token: string; // The actual token value (only available at creation time)
    name: string;
    description?: string | null;
    type: TokenType;
    scopes: string[];
    expiresAt: Date | null;
    createdAt: Date;
}

/**
 * Token with usage statistics
 */
export interface TokenWithStats extends Omit<ApiToken, 'token'> {
    isExpired: boolean;
    usageCount: number;
    rateLimitRemaining: number | null;
}

/**
 * Token usage metrics
 */
export interface TokenUsageMetrics {
    totalUsage: number;
    periodUsage: number;
    errorRate: number;
    periodDescription: string;
    lastUsed: Date | null;
    detailedStats?: {
        topEndpoints?: any[];
        statusDistribution?: any[];
        hourlyUsage?: any[];
    };
}

/**
 * Token middleware context
 */
export interface TokenContext {
    token: TokenWithOwner;
    service: {
        checkPermission: (token: TokenWithOwner, requiredScope: string) => boolean;
        checkAllScopes: (token: TokenWithOwner, requiredScopes: string[]) => boolean;
    };
}

/**
 * Authentication response
 */
export interface AuthResponse {
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        githubUsername?: string | null;
    };
}

/**
 * Registration request
 */
export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

/**
 * Login request
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
    email: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * GitHub account linking request
 */
export interface GitHubLinkRequest {
    code: string;
}

/**
 * Session user with extended properties
 */
export interface SessionUser {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string;
    isAdmin?: boolean;
    githubUsername?: string | null;
    githubId?: string | null;
}

/**
 * Extended session type
 */
export interface ExtendedSession {
    user?: SessionUser;
    expires: string;
}
