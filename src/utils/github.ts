import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";
import { createAppAuth } from "@octokit/auth-app";
import type { EndpointDefaults, RequestRequestOptions } from "@octokit/types";

// Rate limit warning threshold - can be made configurable
const RATE_LIMIT_WARNING_THRESHOLD = 20;

// Fixed types to match Octokit's expected interfaces
type OctokitResponseHeaders = {
    [key: string]: string | number | undefined;
};

interface OctokitResponseType<T = any> {
    headers: OctokitResponseHeaders;
    status: number;
    data: T;
}

const OctokitWithPlugins = Octokit.plugin(throttling, retry);

let octokitInstance: Octokit | null = null;

/**
 * Returns a configured Octokit client for GitHub API interactions
 * 
 * @docs https://github.com/octokit/octokit.js/blob/main/README.md#table-of-contents-
 * 
 * This singleton provides:
 * - Authentication via GitHub App or Personal Access Token
 * - Rate limiting protection with automatic retries for GET requests
 * - Secondary rate limit handling
 * - Caching for frequently accessed endpoints
 * - Logging for rate limit warnings
 * 
 * @param forceNew If true, creates a new instance even if one already exists
 * @returns Configured Octokit instance with plugins
 * @throws Error if no authentication method is configured
 */
export function getOctokitClient(forceNew = false): Octokit {
    if (!octokitInstance || forceNew) {
        // Validate authentication is present
        if (!process.env.GITHUB_TOKEN &&
            !(process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY && process.env.GITHUB_INSTALLATION_ID)) {
            throw new Error("No GitHub authentication method configured. Set either GITHUB_TOKEN or GITHUB_APP_ID, GITHUB_PRIVATE_KEY, and GITHUB_INSTALLATION_ID environment variables.");
        }

        const auth = process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY
            ? createAppAuth({
                appId: process.env.GITHUB_APP_ID,
                privateKey: process.env.GITHUB_PRIVATE_KEY,
                installationId: process.env.GITHUB_INSTALLATION_ID
            })
            : process.env.GITHUB_TOKEN;

        octokitInstance = new OctokitWithPlugins({
            auth,
            throttle: {
                onRateLimit: (retryAfter, options, octokit, retryCount) => {
                    octokit.log.warn(
                        `Rate limit hit for ${options.method} ${options.url}. ` +
                        `Retrying after ${retryAfter} seconds! (Attempt ${retryCount + 1})`
                    );

                    if (options.method === "GET" && retryCount < 3) {
                        return true;
                    }

                    octokit.log.error(`Rate limit hit, not retrying ${options.method} ${options.url}`);
                    return false;
                },
                onSecondaryRateLimit: (retryAfter, options, octokit) => {
                    octokit.log.error(`Secondary rate limit hit for ${options.method} ${options.url}. Not retrying.`);
                    return false;
                },
                enabled: true,
            },
            retry: {
                doNotRetry: ["429"],
                retries: 3,
                retryAfter: 3,
            },
            cache: {
                timeToLive: {
                    get: 60 * 60 * 1000,
                    search: 30 * 60 * 1000,
                    "/repos/{owner}/{repo}": 2 * 60 * 60 * 1000,
                    "/users/{username}": 12 * 60 * 60 * 1000,
                    "/search/repositories": 30 * 60 * 1000,
                    "/search/users": 30 * 60 * 1000,
                },
                cachePredicate: (response: OctokitResponseType) => {
                    return response.status >= 200 && response.status < 300;
                }
            },
            log: {
                debug: () => { },
                info: console.log,
                warn: console.warn,
                error: console.error
            }
        });

        octokitInstance.hook.after("request", (response) => {
            const rateLimitRemaining = response.headers?.["x-ratelimit-remaining"];
            const rateLimit = response.headers?.["x-ratelimit-limit"];
            const resetTime = response.headers?.["x-ratelimit-reset"];

            if (rateLimitRemaining && parseInt(String(rateLimitRemaining)) < RATE_LIMIT_WARNING_THRESHOLD) {
                const resetDate = resetTime ? new Date(parseInt(String(resetTime)) * 1000).toLocaleString() : 'unknown';
                console.warn(`⚠️ GitHub API Rate Limit: ${rateLimitRemaining}/${rateLimit} requests remaining. Resets at ${resetDate}`);
            }
        });
    }

    return octokitInstance;
}

/**
 * Resets the Octokit instance - useful for testing or when auth credentials change
 */
export function resetOctokitClient(): void {
    octokitInstance = null;
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

/**
 * Parses a GitHub repository URL into owner and repo
 * 
 * @param url GitHub repository URL
 * @returns Object with owner and repo properties
 * @throws Error if the URL is not a valid GitHub repository URL
 */
export function parseGitHubRepoUrl(url: string): { owner: string, repo: string } {
    // Support various GitHub URL formats:
    // - https://github.com/owner/repo
    // - https://github.com/owner/repo.git
    // - git@github.com:owner/repo.git

    try {
        let match: RegExpMatchArray | null;

        if (url.includes('github.com')) {
            // Handle HTTPS URLs
            match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)(\.git)?/);
        } else if (url.includes('github.com:')) {
            // Handle SSH URLs
            match = url.match(/github\.com:([^\/]+)\/([^\/\.]+)(\.git)?/);
        } else {
            // Handle simple owner/repo format
            match = url.match(/^([^\/]+)\/([^\/\.]+)$/);
        }

        if (!match) {
            throw new Error(`Invalid GitHub URL: ${url}`);
        }

        return {
            owner: match[1],
            repo: match[2]
        };
    } catch (error) {
        throw new Error(`Failed to parse GitHub repository URL: ${url}`);
    }
}
