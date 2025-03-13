/**
 * GitHub API client utility with SWR integration
 * Routes requests through our API proxy to avoid rate limits
 */
import useSWR, { SWRConfiguration, mutate } from 'swr';
import { GitHubBranch, GitHubErrorResponse, GitHubFileItem } from '@/types/swr';


// Fetcher function for SWR
const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        // Parse error response
        const errorData = await response.json();
        const error: GitHubErrorResponse = {
            error: errorData.error || `API error: ${response.status}`,
            message: errorData.message,
            status: response.status
        };
        throw error;
    }

    return response.json();
};

// Cache configuration
const defaultCacheConfig: SWRConfiguration = {
    revalidateOnFocus: false,   // Don't revalidate when window regains focus
    revalidateIfStale: true,    // Revalidate if data is stale
    revalidateOnReconnect: true, // Revalidate when browser regains connection
    dedupingInterval: 5000,     // Dedupe requests within 5 seconds
    errorRetryCount: 3,         // Retry failed requests up to 3 times
    errorRetryInterval: 5000,   // Wait 5 seconds between retries
};

/**
 * Hook for fetching repository details
 */
export function useRepository(owner: string, repo: string, config?: SWRConfiguration) {
    const cacheKey = owner && repo ? `/api/repo?owner=${owner}&repo=${repo}` : null;

    return useSWR(
        cacheKey,
        fetcher,
        { ...defaultCacheConfig, ...config }
    );
}

/**
 * Hook for fetching repository files
 */
export function useRepositoryFiles(
    owner: string,
    repo: string,
    path: string = "",
    branch: string = "main",
    config?: SWRConfiguration
) {
    const cacheKey = owner && repo ?
        `/api/repo?owner=${owner}&repo=${repo}&contents=true&path=${path}&ref=${branch}` :
        null;

    return useSWR(
        cacheKey,
        fetcher,
        { ...defaultCacheConfig, ...config }
    );
}

/**
 * Hook for fetching repository branches
 */
export function useRepositoryBranches(owner: string, repo: string, config?: SWRConfiguration) {
    // Using direct GitHub API since our API doesn't have a branch endpoint yet
    const cacheKey = owner && repo ?
        `https://api.github.com/repos/${owner}/${repo}/branches` :
        null;

    return useSWR(
        cacheKey,
        (url) => fetcher(url),
        { ...defaultCacheConfig, ...config }
    );
}

/**
 * Prefetch repository data to ensure it's loaded instantly on navigation
 */
export function prefetchRepository(owner: string, repo: string) {
    const cacheKey = `/api/repo?owner=${owner}&repo=${repo}`;
    return mutate(cacheKey, fetcher(cacheKey), false);
}

/**
 * Prefetch repository files to ensure they're loaded instantly on navigation
 */
export function prefetchRepositoryFiles(
    owner: string,
    repo: string,
    path: string = "",
    branch: string = "main"
) {
    const cacheKey = `/api/repo?owner=${owner}&repo=${repo}&contents=true&path=${path}&ref=${branch}`;
    return mutate(cacheKey, fetcher(cacheKey), false);
}

/**
 * Fetch file content directly
 */
export async function fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = "main"
): Promise<string> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    return response.text();
}

/**
 * Create API endpoint for branches
 */
// filepath: d:\@octoflow\octosearch\src\app\api\repo\branches\route.ts
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');

        // Validate required parameters
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Missing required parameters: 'owner' and 'repo'" },
                { status: 400 }
            );
        }

        // Fetch branches from GitHub API
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"
            },
        });

        // Handle GitHub API errors
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: "Repository not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `GitHub API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        // Return branches data
        const branches = await response.json();
        return NextResponse.json(branches);
    } catch (err) {
        const error = err as Error;
        console.error("Error fetching repository branches:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Hook for fetching trending developers
 */
export function useTrendingDevelopers(since: 'daily' | 'weekly' | 'monthly' = 'daily', config?: SWRConfiguration) {
    const cacheKey = `/api/trending/devs?since=${since}`;

    return useSWR(
        cacheKey,
        fetcher,
        { ...defaultCacheConfig, ...config }
    );
}

/**
 * Prefetch trending developers data
 */
export function prefetchTrendingDevelopers(since: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const cacheKey = `/api/trending/devs?since=${since}`;
    return mutate(cacheKey, fetcher(cacheKey), false);
}