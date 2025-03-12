import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

export async function GET() {
  try {
    const response = await fetch("https://github.com/trending");
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub trending page");
    }

    const html = await response.text();
    const repos = scrapeGitHubTrending(html);

    return NextResponse.json(repos);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function scrapeGitHubTrending(html: string) {
  const $ = cheerio.load(html);
  const repos: Repo[] = [];

  $('article.Box-row').each((i, element) => {
    // Extract repository path (username/repo)
    const repoPath = $(element).find('h2 a').attr('href')?.trim().substring(1) || '';
    
    // Extract description
    const description = $(element).find('p').text().trim();
    
    // Extract language
    const language = $(element).find('[itemprop="programmingLanguage"]').text().trim();
    
    // Extract stars
    const starsText = $(element).find('a[href$="/stargazers"]').text().trim();
    const stars = parseInt(starsText.replace(/,/g, '')) || 0;
    
    // Extract forks
    const forksText = $(element).find('a[href$="/forks"]').text().trim();
    const forks = parseInt(forksText.replace(/,/g, '')) || 0;
    

    repos.push({
      id: repoPath,
      name: repoPath.replace('/', ''),
      repo: repoPath,
      description,
      language,
      stars,
      forks,
      updatedAt: "Today",
      url: `https://github.com/${repoPath}`
    });
  });

  return repos;
}