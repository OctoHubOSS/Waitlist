export interface Author {
    name: string | null;
    email: string | null;
    login: string | null;
    avatar_url: string | null;
}

export interface CommitSummary {
    features: number;
    fixes: number;
    improvements: number;
    docs: number;
    others: number;
    totalCommits: number;
}

export interface ProcessedCommit {
    sha: string;
    shortSha: string;
    message: string;
    fullMessage: string;
    date: string | null;
    author: Author;
    url: string;
    type: 'feature' | 'fix' | 'improvement' | 'docs' | 'other';
}

export interface ProcessedCommits {
    features: ChangelogEntry[];
    fixes: ChangelogEntry[];
    improvements: ChangelogEntry[];
    docs: ChangelogEntry[];
    others: ChangelogEntry[];
    totalCommits: number;
}

export interface ChangelogEntry {
    sha: string;
    shortSha: string;
    message: string;
    authorName: string;
    authorUrl: string | null;
    url: string;
    type: "feature" | "fix" | "improvement" | "docs" | "other";
}

export interface TagObject {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    zipball_url?: string;
    tarball_url?: string;
    node_id?: string;
}

export interface Changelog {
    version: string;
    name: string;
    isLatest: boolean;
    publishedAt: string | null;
    url: string;
    description: string;
    prerelease: boolean;
    draft: boolean;
    commits: any[];
    summary: {
        features: number;
        fixes: number;
        improvements: number;
        docs: number;
        others: number;
        totalCommits: number;
    };
    formattedBody: string;
    error?: string;
}

// Token-related types
export interface TokenResponse {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    scopes: string[];
    expiresAt: string | null;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
    allowedIps: string[] | null;
    allowedReferrers: string[] | null;
    rateLimit: number | null;
    rateLimitUsed: number;
    isExpired: boolean;
    usageCount: number;
    rateLimitRemaining: number | null;
}

export interface TokenCreateRequest {
    name: string;
    description?: string;
    type: 'basic' | 'advanced';
    scopes: string[];
    expiresIn?: number; // Days until expiration
    rateLimit?: number;
    allowedIps?: string[];
    allowedReferrers?: string[];
}

export interface TokenCreateResponse {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    scopes: string[];
    expiresAt: string | null;
    createdAt: string;
    token: string; // The actual token value (only available at creation time)
}

export interface TokenUpdateRequest {
    name?: string;
    description?: string;
    scopes?: string[];
    expiresIn?: number;
    rateLimit?: number;
    allowedIps?: string[];
    allowedReferrers?: string[];
}

export interface TokenUsageStats {
    totalUsage: number;
    periodUsage: number;
    errorRate: number;
    periodDescription: string;
    lastUsed: string | null;
    detailedStats?: {
        topEndpoints?: Array<{
            endpoint: string;
            method: string;
            count: number;
        }>;
        statusDistribution?: Array<{
            status: number;
            count: number;
        }>;
        hourlyUsage?: Array<{
            hour: number;
            count: number;
        }>;
    };
}

export interface PaginatedTokensResponse {
    data: TokenResponse[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    message: string;
}