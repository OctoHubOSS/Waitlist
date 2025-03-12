import { NextResponse } from "next/server";
import { Developer } from "@/types/users";
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
    const developers = await mapGitHubApiToDevelopers(data);

    return NextResponse.json(developers);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function mapGitHubApiToDevelopers(data: GitHubUserApiResponse): Promise<Developer[]> {
  // Process only the first 10 users to avoid rate limiting
  const topUsers = data.items.slice(0, 10);
  
  // Fetch follower counts for each user
  const developersWithDetails = await Promise.all(topUsers.map(async (user) => {
    let followerCount = 0;
    
    try {
      // Fetch user details to get follower count
      const userResponse = await fetch(user.url, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        followerCount = userData.followers || 0;
      }
    } catch (error) {
      console.error(`Failed to fetch details for user ${user.login}:`, error);
      // Continue with 0 followers if there's an error
    }
    
    return {
      id: user.id,
      login: user.login,
      name: user.login, // GitHub API doesn't return full name in search results
      avatar_url: user.avatar_url,
      url: user.html_url,
      type: user.type,
      followers_url: user.followers_url,
      following_url: user.following_url,
      repos_url: user.repos_url,
      is_site_admin: user.site_admin,
      score: user.score,
      follower_count: followerCount
    };
  }));
  
  return developersWithDetails;
}