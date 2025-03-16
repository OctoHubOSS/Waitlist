import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get('username');
        const since = searchParams.get('since'); // ISO 8601 timestamp
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');

        const octokit = getOctokitClient();

        let gistsData;

        if (username) {
            // Fetch gists for a specific user
            const params: any = {
                username,
                per_page: perPage,
                page
            };

            if (since) params.since = since;

            const { data } = await octokit.rest.gists.listForUser(params);
            gistsData = data;
        } else {
            // Fetch public gists
            const params: any = {
                per_page: perPage,
                page
            };

            if (since) params.since = since;

            const { data } = await octokit.rest.gists.listPublic(params);
            gistsData = data;
        }

        // Format the response
        const formattedGists = gistsData.map(gist => ({
            id: gist.id,
            description: gist.description,
            created_at: gist.created_at,
            updated_at: gist.updated_at,
            url: gist.html_url,
            owner: gist.owner ? {
                login: gist.owner.login,
                avatar_url: gist.owner.avatar_url,
                url: gist.owner.html_url
            } : null,
            public: gist.public,
            files: Object.keys(gist.files).map(filename => ({
                filename,
                type: gist.files[filename].type,
                language: gist.files[filename].language,
                raw_url: gist.files[filename].raw_url,
                size: gist.files[filename].size
            })),
            comments: gist.comments
        }));

        return NextResponse.json(formattedGists);
    } catch (err: any) {
        console.error("Error fetching gists:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
