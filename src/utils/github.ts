import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import { retry } from "@octokit/plugin-retry";
import { createAppAuth } from "@octokit/auth-app";

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
 * @returns Configured Octokit instance with plugins
 */
export function getOctokitClient(): Octokit {
    if (!octokitInstance) {
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
                onRateLimit: (retryAfter: number, options: any, octokit: any, retryCount: number) => {
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
                onSecondaryRateLimit: (retryAfter: number, options: any, octokit: any) => {
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
                cachePredicate: (response: any) => {
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

            if (rateLimitRemaining && parseInt(rateLimitRemaining) < 20) {
                const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleString() : 'unknown';
                console.warn(`⚠️ GitHub API Rate Limit: ${rateLimitRemaining}/${rateLimit} requests remaining. Resets at ${resetDate}`);
            }
        });
    }

    return octokitInstance;
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
