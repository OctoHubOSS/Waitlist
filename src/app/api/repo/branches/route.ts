import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

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

        const octokit = getOctokitClient();

        // Fetch branches using Octokit
        const { data: branches } = await octokit.rest.repos.listBranches({
            owner,
            repo,
            per_page: 100 // Get up to 100 branches
        });

        return NextResponse.json(branches);
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        console.error("Error fetching repository branches:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
