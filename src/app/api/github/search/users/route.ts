import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const sort = searchParams.get('sort'); // followers, repositories, joined
        const order = searchParams.get('order') || 'desc'; // asc or desc
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');
        const type = searchParams.get('type'); // user, org

        // Build the search query with filters
        let searchQuery = query;
        if (type === 'user') searchQuery += ' type:user';
        if (type === 'org') searchQuery += ' type:org';

        const octokit = getOctokitClient();

        // Search parameters
        const params: any = {
            q: searchQuery,
            per_page: perPage,
            page,
            order
        };

        // Add sort if provided
        if (sort) params.sort = sort;

        // Search for users
        const { data } = await octokit.rest.search.users(params);

        // Format the response
        const formattedResults = {
            total_count: data.total_count,
            incomplete_results: data.incomplete_results,
            items: data.items.map(user => ({
                id: user.id,
                login: user.login,
                avatar_url: user.avatar_url,
                url: user.html_url,
                type: user.type,
                score: user.score
            }))
        };

        return NextResponse.json(formattedResults);
    } catch (err: any) {
        console.error("Error searching users:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
