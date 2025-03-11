import { NextResponse } from "next/server";

interface Repo {
  repo: string;
  desc: string;
  lang: string;
  stars: number;
  forks: number;
}

export async function GET() {
  try {
    const response = await fetch("https://trend.doforce.us.kg/repo");
    if (!response.ok) {
      throw new Error("Failed to fetch trending repositories");
    }

    const data: Repo[] = await response.json();

    const trendingRepos = data.map((repo) => ({
      id: repo.repo,
      name: repo.repo.replace("/", ""),
      description: repo.desc,
      language: repo.lang,
      stars: repo.stars,
      forks: repo.forks,
      updatedAt: "Recently",
      url: `https://github.com${repo.repo}`,
    }));

    return NextResponse.json(trendingRepos);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
