import { NextResponse, NextRequest } from "next/server";
import { User } from "@/types/users";
import { GitHubUserApiResponse } from "@/types/base";
import { getCached, setCached } from "@/utils/cache"; // Use your singleton cache

// Cache TTL in seconds (4 hours)
const CACHE_TTL = 14400;

export async function GET(req: NextRequest) {
  try {
    // Get parameters for potentially different caches
    const searchParams = req.nextUrl.searchParams;
    const since = searchParams.get('since') || 'daily';

    // Create a unique cache key that includes parameters
    const cacheKey = `trending-developers-${since}`;

    // Attempt to get cached data first using your singleton cache
    const developers = getCached<User[]>(cacheKey);

    // If we have valid cached data, return it
    if (developers && Array.isArray(developers) && developers.length > 0) {
      console.log(`Cache hit for ${cacheKey}`);
      return NextResponse.json(developers);
    }

    console.log(`Cache miss for ${cacheKey}, fetching from GitHub API...`);

    // No cache hit - fetch from GitHub API with rate limit handling
    const fetchedDevelopers = await fetchTrendingDevelopers();

    // Store in cache for future requests using your singleton cache
    if (fetchedDevelopers && fetchedDevelopers.length > 0) {
      setCached(cacheKey, fetchedDevelopers, CACHE_TTL);
      console.log(`Cached ${fetchedDevelopers.length} developers with key: ${cacheKey}`);
    }

    return NextResponse.json(fetchedDevelopers);
  } catch (err) {
    const error = err as Error;

    // Check if this is a rate limit error
    if (error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    console.error("Error fetching trending developers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchTrendingDevelopers(): Promise<User[]> {
  // Create a cache key for the base search results 
  const baseSearchCacheKey = "github-user-search-followers-10000";

  // Try to get the base search results from cache first
  let data = getCached<GitHubUserApiResponse>(baseSearchCacheKey);

  if (!data) {
    console.log("Base user search cache miss, fetching from GitHub API...");
    const response = await fetch(
      "https://api.github.com/search/users?q=followers:>10000&sort=followers&order=desc",
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          // Add your GitHub token if available from env vars
          ...(process.env.GITHUB_TOKEN && {
            "Authorization": `token ${process.env.GITHUB_TOKEN}`
          })
        }
      }
    );

    // Check for rate limiting
    const rateLimit = {
      limit: parseInt(response.headers.get("x-ratelimit-limit") || "0"),
      remaining: parseInt(response.headers.get("x-ratelimit-remaining") || "0"),
      reset: parseInt(response.headers.get("x-ratelimit-reset") || "0"),
    };

    console.log("GitHub API Rate Limit:", rateLimit);

    if (rateLimit.remaining <= 5) {
      const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
      console.warn(`GitHub API rate limit nearly exceeded. Resets at ${resetDate}`);
    }

    if (!response.ok) {
      if (response.status === 403 && rateLimit.remaining === 0) {
        const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
        throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}`);
      }
      throw new Error(`Failed to fetch GitHub API: ${response.status} ${response.statusText}`);
    }

    data = await response.json() as GitHubUserApiResponse;

    // Cache the base search results for 6 hours (can be slightly longer than the final results)
    setCached(baseSearchCacheKey, data, 21600);
  }

  return await fetchDetailedUserData(data);
}

async function fetchDetailedUserData(data: GitHubUserApiResponse): Promise<User[]> {
  // Process only the first 10 users to avoid rate limiting
  const topUsers = data.items.slice(0, 10);

  // Use Promise.allSettled instead of Promise.all to handle individual failures
  const usersWithDetailsResults = await Promise.allSettled(
    topUsers.map(user => fetchSingleUserDetails(user))
  );

  // Filter out rejected promises and map to values
  return usersWithDetailsResults
    .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
    .map(result => result.value);
}

async function fetchSingleUserDetails(user: any): Promise<User> {
  // Create a cache key for this specific user
  const userCacheKey = `github-user-${user.login}`;

  // Try to get from cache first
  const cachedUser = getCached<User>(userCacheKey);
  if (cachedUser) {
    return cachedUser;
  }

  try {
    // Fetch detailed user data with exponential backoff retry
    const userData = await fetchWithRetry(
      `https://api.github.com/users/${user.login}`,
      3
    );

    // Fetch top repositories to showcase
    const topRepos = await fetchTopRepositories(user.login);

    // Map GitHub API response to our User type
    const userDetails: User = {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || null,
      type: userData.type as "User" | "Organization",
      company: userData.company || null,
      location: userData.location || null,
      blog: userData.blog || null,
      email: userData.email || null,
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepos: userData.public_repos || 0,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      // Add stats summary
      stats: {
        followersFormatted: formatNumber(userData.followers),
        followingFormatted: formatNumber(userData.following),
        reposFormatted: formatNumber(userData.public_repos),
      },
      // Add top repos
      topRepositories: topRepos
    };

    // Cache individual user data for 24 hours - user data changes less frequently
    setCached(userCacheKey, userDetails, 86400);

    return userDetails;
  } catch (error) {
    console.error(`Failed to fetch details for user ${user.login}:`, error);

    // Return basic user info if detailed fetch fails
    return {
      id: user.id,
      login: user.login,
      name: user.login,
      avatarUrl: user.avatar_url,
      type: user.type as "User" | "Organization",
      followers: 0,
      following: 0,
      publicRepos: 0,
      stats: {
        followersFormatted: "0",
        followingFormatted: "0",
        reposFormatted: "0"
      },
      topRepositories: []
    };
  }
}

async function fetchTopRepositories(username: string, limit = 3): Promise<Array<{ id: number, name: string, stars: number }>> {
  // Create a cache key for this user's repositories
  const repoCacheKey = `github-repos-${username}`;

  // Try to get from cache first
  const cachedRepos = getCached<Array<{ id: number, name: string, stars: number }>>(repoCacheKey);
  if (cachedRepos) {
    return cachedRepos;
  }

  try {
    const repos = await fetchWithRetry(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=${limit}`,
      2 // Fewer retries for repos since they're less critical
    );

    const topRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      stars: repo.stargazers_count
    }));

    // Cache repos for 12 hours
    setCached(repoCacheKey, topRepos, 43200);

    return topRepos;
  } catch (error) {
    console.error(`Failed to fetch repositories for ${username}:`, error);
    return [];
  }
}

// Helper function for exponential backoff retry
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<any> {
  // Create a cache key for this specific API URL
  const apiCacheKey = `github-api-${Buffer.from(url).toString('base64')}`;

  // Try to get from cache first
  const cachedResponse = getCached<any>(apiCacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          // Add your GitHub token if available from env vars
          ...(process.env.GITHUB_TOKEN && {
            "Authorization": `token ${process.env.GITHUB_TOKEN}`
          })
        }
      });

      // Check for rate limiting
      const remaining = parseInt(response.headers.get("x-ratelimit-remaining") || "0");

      if (!response.ok) {
        if (response.status === 403 && remaining === 0) {
          throw new Error(`rate limit exceeded`);
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Cache raw API responses for 6 hours
      setCached(apiCacheKey, data, 21600);

      return data;
    } catch (error) {
      lastError = error as Error;

      // If rate limited, don't retry
      if (lastError.message.includes("rate limit")) {
        throw lastError;
      }

      // Wait exponentially longer between retries
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying fetch after ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed after multiple retry attempts");
}

// Format large numbers with K, M suffixes
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}