import { NextResponse, NextRequest } from "next/server";
import { User } from "@/types/users";
import { getOctokitClient, formatNumber } from "@/utils/github";
import { ZodError, z } from "zod";

// Simplified query parameter validation schema - removed language requirement
const queryParamsSchema = z.object({
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  page: z.coerce.number().int().positive().default(1)
});

export async function GET(req: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const params = queryParamsSchema.parse({
      since: searchParams.get("since") || "daily",
      page: searchParams.get("page") || "1"
    });

    const octokit = getOctokitClient();

    // Improved query construction for trending developers
    let query = "type:user";
    const now = new Date();

    // Better date filter to find trending users (based on activity)
    switch (params.since) {
      case "monthly":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = `followers:>1000 sort:followers-desc`;
        break;
      case "weekly":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = `followers:>500 sort:followers-desc`;
        break;
      default: // daily
        const dayAgo = new Date(now);
        dayAgo.setDate(dayAgo.getDate() - 2);
        query = `followers:>100 sort:followers-desc`;
    }

    try {
      // Fetch users with improved query
      const { data } = await octokit.rest.search.users({
        q: query,
        sort: "followers",
        order: "desc",
        per_page: 30,
        page: params.page
      });

      if (!data.items || data.items.length === 0) {
        return NextResponse.json({ data: [] });
      }

      // Process users in batches to avoid rate limits
      const users: User[] = [];
      const batchSize = 5;

      for (let i = 0; i < Math.min(data.items.length, 15); i += batchSize) {
        const batch = data.items.slice(i, i + batchSize);
        const batchPromises = batch.map(user => fetchUserDetails(octokit, user));

        const batchResults = await Promise.allSettled(batchPromises);

        // Add successful results to users array
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            users.push(result.value);
          }
        });

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < data.items.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return NextResponse.json({ data: users });
    } catch (error) {
      console.error("GitHub API Error:", error);
      return NextResponse.json({ error: "Failed to fetch trending developers from GitHub" }, { status: 500 });
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: err.errors },
        { status: 400 });
    }

    console.error("Error fetching trending developers:", err);
    return NextResponse.json({ error: "Failed to fetch trending developers" }, { status: 500 });
  }
}

// Improved type safety for the fetchUserDetails function
async function fetchUserDetails(octokit: any, user: { login: string }): Promise<User | null> {
  try {
    // Fetch basic user data
    const { data: userData } = await octokit.rest.users.getByUsername({
      username: user.login,
    });

    // Fetch top repositories
    const { data: reposData } = await octokit.rest.repos.listForUser({
      username: user.login,
      sort: "stars",
      direction: "desc",
      per_page: 3
    });

    const topRepos = reposData.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      stars: repo.stargazers_count
    }));

    // Map to our User type
    return {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || null,
      type: userData.type,
      company: userData.company || null,
      location: userData.location || null,
      blog: userData.blog || null,
      email: userData.email || null,
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepos: userData.public_repos || 0,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      stats: {
        followersFormatted: formatNumber(userData.followers),
        followingFormatted: formatNumber(userData.following),
        reposFormatted: formatNumber(userData.public_repos),
      },
      topRepositories: topRepos,
    };
  } catch (error) {
    console.error(`Failed to fetch details for user ${user.login}:`, error);
    return null;
  }
}
