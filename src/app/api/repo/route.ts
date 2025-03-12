import { NextResponse, NextRequest } from "next/server";
import { RepoPage } from "@/types/repos";

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    // Validate required parameters
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: 'owner' and 'repo'" },
        { status: 400 }
      );
    }

    // Call GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
    });

    // Handle GitHub API errors
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `GitHub API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse and return the data
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching repository data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}