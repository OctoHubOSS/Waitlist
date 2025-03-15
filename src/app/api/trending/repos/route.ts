import { NextResponse, NextRequest } from "next/server";
import { Repository } from "@/types/repos";
import { getOctokitClient } from "@/utils/github";
import { ZodError, z } from "zod";

// Simplified query parameter validation schema
const queryParamsSchema = z.object({
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  stars: z.coerce.number().int().positive().optional(),
  forks: z.coerce.number().int().positive().optional()
});

export async function GET(req: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const params = queryParamsSchema.parse({
      since: searchParams.get("since") || "daily",
      language: searchParams.get("language"),
      page: searchParams.get("page") || "1",
      stars: searchParams.get("stars") ? Number(searchParams.get("stars")) : undefined,
      forks: searchParams.get("forks") ? Number(searchParams.get("forks")) : undefined
    });

    const octokit = getOctokitClient();

    // Simplified query construction
    let query = "";
    const now = new Date();
    const languageFilter = params.language ? `language:${params.language} ` : "";
    const starsFilter = params.stars ? `stars:>=${params.stars} ` : "";
    const forksFilter = params.forks ? `forks:>=${params.forks} ` : "";

    // Simple date filter based on time period
    switch (params.since) {
      case "monthly":
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        query = `${languageFilter}${starsFilter}${forksFilter}created:>${monthAgo.toISOString().split('T')[0]} sort:stars`;
        break;
      case "weekly":
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        query = `${languageFilter}${starsFilter}${forksFilter}created:>${weekAgo.toISOString().split('T')[0]} sort:stars`;
        break;
      default: // daily
        const dayAgo = new Date(now);
        dayAgo.setDate(now.getDate() - 1);
        query = `${languageFilter}${starsFilter}${forksFilter}created:>${dayAgo.toISOString().split('T')[0]} sort:stars`;
    }

    try {
      const { data } = await octokit.rest.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 30,
        page: params.page
      });

      const repos: Repository[] = data.items.map(item => ({
        id: item.id,
        name: item.name,
        repo: item.full_name,
        description: item.description || "",
        language: item.language || "",
        stars: item.stargazers_count,
        forks: item.forks_count,
        updatedAt: new Date(item.updated_at).toLocaleDateString(),
        url: item.html_url,
        owner: {
          login: item.owner.login,
          avatar_url: item.owner.avatar_url,
          url: item.owner.html_url
        },
        createdAt: new Date(item.created_at).toLocaleDateString(),
        pushedAt: new Date(item.pushed_at).toLocaleDateString(),
        openIssues: item.open_issues_count,
        topics: item.topics || [],
        license: item.license ? {
          name: item.license.name,
          key: item.license.key,
          spdx_id: item.license.spdx_id,
          url: item.license.url
        } : null,
        visibility: item.visibility,
        size: item.size,
        updated_at: item.updated_at,
        created_at: item.created_at,
        pushed_at: item.pushed_at,
        stargazers_count: item.stargazers_count,
        forks_count: item.forks_count,
        open_issues_count: item.open_issues_count
      }));

      return NextResponse.json({ data: repos });
    } catch (error) {
      console.error("GitHub API Error:", error);
      return NextResponse.json({ error: "Failed to fetch trending repositories from GitHub" }, { status: 500 });
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: err.errors },
        { status: 400 });
    }

    console.error("Error fetching trending repos:", err);
    return NextResponse.json({ error: "Failed to fetch trending repositories" }, { status: 500 });
  }
}