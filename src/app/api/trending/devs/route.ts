import { NextResponse, NextRequest } from "next/server";
import { User } from "@/types/users";
import { getOctokitClient, formatNumber } from "@/utils/github";

export async function GET(req: NextRequest) {
  try {
    // Get parameters for potentially different queries
    const searchParams = req.nextUrl.searchParams;
    const since = searchParams.get('since') || 'daily';

    const octokit = getOctokitClient();

    // Different time periods could use different queries
    let followersThreshold = "10000"; // Default for all time periods

    if (since === "weekly") {
      followersThreshold = "5000";
    } else if (since === "monthly") {
      followersThreshold = "3000";
    }

    // Search for top users by followers
    const { data } = await octokit.rest.search.users({
      q: `followers:>${followersThreshold}`,
      sort: "followers",
      order: "desc",
      per_page: 10
    });

    // Fetch detailed information for each user
    const developers = await fetchDetailedUserData(octokit, data.items);

    return NextResponse.json(developers);
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching trending developers:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchDetailedUserData(octokit: any, users: any[]): Promise<User[]> {
  // Use Promise.allSettled to handle individual failures
  const usersWithDetailsResults = await Promise.allSettled(
    users.map(user => fetchSingleUserDetails(octokit, user))
  );

  // Filter out rejected promises and map to values
  return usersWithDetailsResults
    .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
    .map(result => result.value);
}

async function fetchSingleUserDetails(octokit: any, user: any): Promise<User> {
  try {
    // Fetch detailed user data
    const { data: userData } = await octokit.rest.users.getByUsername({
      username: user.login
    });

    // Fetch top repositories
    const topRepos = await fetchTopRepositories(octokit, user.login);

    // Map GitHub API response to our User type
    return {
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

async function fetchTopRepositories(octokit: any, username: string, limit = 3): Promise<Array<{ id: number, name: string, stars: number }>> {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: "stars",
      per_page: limit
    });

    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      stars: repo.stargazers_count
    }));
  } catch (error) {
    console.error(`Failed to fetch repositories for ${username}:`, error);
    return [];
  }
}