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
    commits: ProcessedCommit[];
    summary: CommitSummary;
}

export interface ChangelogEntry {
    version: string;
    name: string;
    isLatest: boolean;
    publishedAt: string | null;
    url: string;
    description: string;
    prerelease: boolean;
    draft: boolean;
    commits: ProcessedCommit[];
    summary: CommitSummary;
    formattedBody: string;
    error?: string;
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