import { NextResponse } from "next/server";
import { User } from "@/types/users";
import { GitHubUserApiResponse } from "@/types/base";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/search/users?q=followers:>10000&sort=followers&order=desc",
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub API: ${response.status}`);
    }

    const data = await response.json() as GitHubUserApiResponse;
    const developers = await fetchDetailedUserData(data);

    return NextResponse.json(developers);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function fetchDetailedUserData(data: GitHubUserApiResponse): Promise<User[]> {
  // Process only the first 10 users to avoid rate limiting
  const topUsers = data.items.slice(0, 10);

  // Fetch detailed information for each user
  const usersWithDetails = await Promise.all(topUsers.map(async (user) => {
    try {
      // Fetch detailed user data from the users endpoint
      const userResponse = await fetch(`https://api.github.com/users/${user.login}`, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }

      const userData = await userResponse.json();

      // Fetch top repositories to showcase
      const topRepos = await fetchTopRepositories(user.login);

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
  }));

  return usersWithDetails;
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

// Fetch top repositories for a user
async function fetchTopRepositories(username: string, limit = 3): Promise<Array<{ id: number, name: string, stars: number }>> {
  try {
    const repoResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=${limit}`,
      {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!repoResponse.ok) return [];

    const repos = await repoResponse.json();
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      stars: repo.stargazers_count
    }));
  } catch (error) {
    console.error(`Failed to fetch repositories for ${username}:`, error);
    return [];
  }
}