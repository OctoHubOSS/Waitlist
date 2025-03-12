import { NextResponse } from "next/server";

interface Repo {
  id: string;
  name: string;
  url: string;
  repo: string;
  description: string;
  language: string;
  updatedAt: string;
  stars: number;
  forks: number;
}

// GitHub API response types
interface GitHubApiResponse {
  items: GitHubRepo[];
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  language: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
  }
}

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

    const data = await response.json() as GitHubApiResponse;
    const repos = mapGitHubApiToRepos(data);

    return NextResponse.json(repos);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function mapGitHubApiToRepos(data: GitHubApiResponse): Repo[] {
  return data.items.map(item => ({
    id: item.full_name,
    name: `${item.owner.login}${item.name}`,
    repo: item.full_name,
    description: item.description || "",
    language: item.language || "",
    stars: item.stargazers_count,
    forks: item.forks_count,
    updatedAt: new Date(item.updated_at).toLocaleDateString(),
    url: item.html_url
  }));
}