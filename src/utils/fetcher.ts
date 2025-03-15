/**
 * GitHub API client utility with SWR integration
 * Routes requests through our API proxy to avoid rate limits
 */
import useSWR, { SWRConfiguration, mutate } from "swr";
import { GitHubBranch, GitHubErrorResponse, GitHubFileItem } from "@/types/swr";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    // Parse error response
    let errorData: any;
    try {
      errorData = await response.json();
    } catch (e) {
      // If JSON parsing fails, create a simple error object
      errorData = { error: `API error: ${response.status}` };
    }

    const error: GitHubErrorResponse = {
      error: errorData.error || `API error: ${response.status}`,
      message: errorData.message,
      status: response.status,
    };
    throw error;
  }

  return response.json();
};

// Cache configuration
const defaultCacheConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't revalidate when window regains focus
  revalidateIfStale: true, // Revalidate if data is stale
  revalidateOnReconnect: true, // Revalidate when browser regains connection
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests up to 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
};

/**
 * Hook for fetching repository details
 */
export function useRepository(
  owner: string,
  repo: string,
  config?: SWRConfiguration,
) {
  const cacheKey =
    owner && repo ? `/api/repo?owner=${owner}&repo=${repo}` : null;

  return useSWR(cacheKey, fetcher, { ...defaultCacheConfig, ...config });
}

/**
 * Hook for fetching repository files
 */
export function useRepositoryFiles(
  owner: string,
  repo: string,
  path: string = "",
  branch: string = "main",
  config?: SWRConfiguration,
) {
  const cacheKey =
    owner && repo
      ? `/api/repo?owner=${owner}&repo=${repo}&contents=true&path=${path}&ref=${branch}`
      : null;

  return useSWR(cacheKey, fetcher, { ...defaultCacheConfig, ...config });
}

/**
 * Hook for fetching repository branches
 */
export function useRepositoryBranches(
  owner: string,
  repo: string,
  config?: SWRConfiguration,
) {
  // Update to use our API endpoint instead of direct GitHub access
  const cacheKey =
    owner && repo ? `/api/repo/branches?owner=${owner}&repo=${repo}` : null;

  return useSWR(cacheKey, fetcher, { ...defaultCacheConfig, ...config });
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
  branch: string = "main",
) {
  const cacheKey = `/api/repo?owner=${owner}&repo=${repo}&contents=true&path=${path}&ref=${branch}`;
  return mutate(cacheKey, fetcher(cacheKey), false);
}

/**
 * Fetch file content directly
 * Note: This still uses direct GitHub URLs as it's typically for raw file content
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main",
): Promise<string> {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`,
      );
    }

    return response.text();
  } catch (error) {
    console.error(`Error fetching raw file content for ${path}:`, error);
    throw new Error(
      `Could not load file content. ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Hook for fetching trending developers
 */
export function useTrendingDevelopers(
  since: "daily" | "weekly" | "monthly" = "daily",
  page: number = 1,
  config?: SWRConfiguration,
) {
  const cacheKey = `/api/trending/devs?since=${since}&page=${page}`;

  return useSWR(cacheKey, fetcher, { ...defaultCacheConfig, ...config });
}

/**
 * Prefetch trending developers data
 */
export function prefetchTrendingDevelopers(
  since: "daily" | "weekly" | "monthly" = "daily",
  page: number = 1,
) {
  const cacheKey = `/api/trending/devs?since=${since}&page=${page}`;
  return mutate(cacheKey, fetcher(cacheKey), false);
}

/**
 * Hook for fetching trending repositories
 */
export function useTrendingRepositories(
  since: "daily" | "weekly" | "monthly" = "daily",
  language?: string,
  page: number = 1,
  stars?: number,
  forks?: number,
  spokenLanguage: string = "",
  config?: SWRConfiguration,
) {
  const cacheKey = `/api/trending/repos?since=${since}&language=${language || ""}&page=${page}&stars=${stars || ""}&forks=${forks || ""}&spoken_language_code=${spokenLanguage}`;

  return useSWR(cacheKey, fetcher, { ...defaultCacheConfig, ...config });
}

/**
 * Prefetch trending repositories data
 */
export function prefetchTrendingRepositories(
  since: "daily" | "weekly" | "monthly" = "daily",
  language?: string,
  page: number = 1,
  stars?: number,
  forks?: number,
) {
  const cacheKey = `/api/trending/repos?since=${since}&language=${language || ""}&page=${page}&stars=${stars || ""}&forks=${forks || ""}`;
  return mutate(cacheKey, fetcher(cacheKey), false);
}
