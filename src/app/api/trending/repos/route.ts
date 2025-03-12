import { NextResponse } from "next/server";
import { GitHubRepoApiResponse } from "@/types/base";
import { Repository } from "@/types/repos";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc", 
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

    const data = await response.json() as GitHubRepoApiResponse;
    const repos = mapGitHubApiToRepos(data);

    return NextResponse.json(repos);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function mapGitHubApiToRepos(data: GitHubRepoApiResponse): Repository[] {
  return data.items.map(item => ({
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