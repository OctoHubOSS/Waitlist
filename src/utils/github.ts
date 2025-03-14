import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";
import { createAppAuth } from "@octokit/auth-app";

// Add plugins to Octokit
const OctokitWithPlugins = Octokit.plugin(throttling, retry);

// Create a singleton Octokit instance with enhanced plugin options
let octokitInstance: Octokit | null = null;

export function getOctokitClient(): Octokit {
    if (!octokitInstance) {
        // Determine which auth method to use
        const auth = process.env.GITHUB_APP_ID && process.env.GITHUB_PRIVATE_KEY
            ? createAppAuth({
                appId: process.env.GITHUB_APP_ID,
                privateKey: process.env.GITHUB_PRIVATE_KEY,
                installationId: process.env.GITHUB_INSTALLATION_ID
            })
            : process.env.GITHUB_TOKEN;

        octokitInstance = new OctokitWithPlugins({
            auth,
            // Significantly improve request throttling configuration
            throttle: {
                onRateLimit: (retryAfter: number, options: any, octokit: any, retryCount: number) => {
                    octokit.log.warn(
                        `Rate limit hit for ${options.method} ${options.url}. ` +
                        `Retrying after ${retryAfter} seconds! (Attempt ${retryCount + 1})`
                    );

                    // Only retry GET requests and only up to 3 times
                    if (options.method === "GET" && retryCount < 3) {
                        return true;
                    }

                    octokit.log.error(`Rate limit hit, not retrying ${options.method} ${options.url}`);
                    return false;
                },
                onSecondaryRateLimit: (retryAfter: number, options: any, octokit: any) => {
                    // Secondary rate limits are more serious - don't retry these
                    octokit.log.error(`Secondary rate limit hit for ${options.method} ${options.url}. Not retrying.`);
                    return false;
                },
                enabled: true,
            },
            // Retry configuration for network issues and 5xx errors
            retry: {
                doNotRetry: ["429"], // We handle rate limits with throttling plugin instead
                retries: 3,
                retryAfter: 3,
            },
            // Enhanced caching strategy
            cache: {
                timeToLive: {
                    // Cache times vary by endpoint type
                    get: 60 * 60 * 1000, // 1 hour for GET requests
                    search: 30 * 60 * 1000, // 30 minutes for search API requests
                    // Add specific endpoint cache times
                    "/repos/{owner}/{repo}": 2 * 60 * 60 * 1000, // 2 hours for repo info
                    "/users/{username}": 12 * 60 * 60 * 1000, // 12 hours for user info
                    "/search/repositories": 30 * 60 * 1000, // 30 minutes for repo search
                    "/search/users": 30 * 60 * 1000, // 30 minutes for user search
                },
                // Don't cache error responses
                cachePredicate: (response: any) => {
                    return response.status >= 200 && response.status < 300;
                }
            },
            // Add verbose logging for debugging
            log: {
                debug: () => { }, // Disable debug logs
                info: console.log,
                warn: console.warn,
                error: console.error
            }
        });

        // Add request interceptor to log remaining rate limit info
        octokitInstance.hook.after("request", (response) => {
            const rateLimitRemaining = response.headers?.["x-ratelimit-remaining"];
            const rateLimit = response.headers?.["x-ratelimit-limit"];
            const resetTime = response.headers?.["x-ratelimit-reset"];

            if (rateLimitRemaining && parseInt(rateLimitRemaining) < 20) {
                // Log warning when rate limit is getting low
                const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleString() : 'unknown';
                console.warn(`⚠️ GitHub API Rate Limit: ${rateLimitRemaining}/${rateLimit} requests remaining. Resets at ${resetDate}`);
            }
        });
    }

    return octokitInstance;
}

// Format large numbers with K, M suffixes
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}
