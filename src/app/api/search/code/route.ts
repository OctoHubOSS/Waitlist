import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q');
        const language = searchParams.get('language');
        const repo = searchParams.get('repo'); // format: owner/repo
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');

        // Validate required parameters
        if (!query) {
            return NextResponse.json(
                { error: "Missing required parameter: 'q'" },
                { status: 400 }
            );
        }

        // Build the search query
        let searchQuery = query;
        if (language) searchQuery += ` language:${language}`;
        if (repo) searchQuery += ` repo:${repo}`;

        const octokit = getOctokitClient();

        // Search code using GitHub API
        const { data } = await octokit.rest.search.code({
            q: searchQuery,
            per_page: perPage,
            page,
        });

        // Format the response
        const formattedResults = {
            total_count: data.total_count,
            incomplete_results: data.incomplete_results,
            items: data.items.map(item => ({
                name: item.name,
                path: item.path,
                sha: item.sha,
                url: item.html_url,
                repository: {
                    name: item.repository.name,
                    full_name: item.repository.full_name,
                    owner: {
                        login: item.repository.owner.login,
                        avatar_url: item.repository.owner.avatar_url
                    }
                },
                score: item.score,
            }))
        };

        return NextResponse.json(formattedResults);
    } catch (err: any) {
        console.error("Error searching code:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
