import { User } from "./users";

// Define common response types
export interface GitHubErrorResponse {
    error: string;
    message?: string;
    status?: number;
}

export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}

export interface GitHubFileItem {
    name: string;
    path: string;
    type: "file" | "dir" | string;
    size: number;
    sha: string;
    url: string;
    download_url?: string;
    content?: string;
}

export interface TrendingDeveloper extends User {
    username?: string;
    name?: string;
    url?: string;
    avatar?: string;
    repo?: {
        name: string;
        description: string;
        url: string;
    };
}

