import { NextResponse } from "next/server";
import { Repository } from "@/types/repos";
import { getOctokitClient } from "@/utils/github";

export async function GET() {
  try {
    const octokit = getOctokitClient();

    const { data } = await octokit.rest.search.repos({
      q: "stars:>10000",
      sort: "stars",
      order: "desc",
      per_page: 30
    });

    const repos = mapGitHubApiToRepos(data);
    return NextResponse.json(repos);
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching trending repos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function mapGitHubApiToRepos(data: any): Repository[] {
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    repo: item.full_name,
    description: item.description || "",
    language: item.language || "",
    stars: item.stargazers_count,
    forks: item.forks_count,
    updatedAt: new Date(item.updated_at).toLocaleDateString(),
    url: item.html_url,
    // Added fields with rich data
    owner: {
      login: item.owner.login,
      avatar_url: item.owner.avatar_url,
      url: item.owner.html_url
    },
    createdAt: new Date(item.created_at).toLocaleDateString(),
    pushedAt: new Date(item.pushed_at).toLocaleDateString(),
    openIssues: item.open_issues_count,
    topics: item.topics || [],
    license: item.license ? item.license.name : null,
    visibility: item.visibility,
    size: item.size
  }));
}