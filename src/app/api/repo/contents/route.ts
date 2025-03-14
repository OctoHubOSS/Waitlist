import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');
        const path = searchParams.get('path') || '';
        const ref = searchParams.get('ref');

        // Validate required parameters
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Missing required parameters: 'owner' and 'repo'" },
                { status: 400 }
            );
        }

        const octokit = getOctokitClient();

        // Fetch the file/directory content
        const params: any = {
            owner,
            repo,
            path
        };

        // Add reference if provided (branch, tag, or commit SHA)
        if (ref) params.ref = ref;

        const { data } = await octokit.rest.repos.getContent(params);

        // Process response based on whether it's a file or directory
        if (Array.isArray(data)) {
            // Directory contents
            const contents = data.map(item => ({
                name: item.name,
                path: item.path,
                sha: item.sha,
                size: item.size,
                type: item.type, // "file", "dir", "symlink", etc.
                url: item.html_url,
                downloadUrl: item.download_url
            }));

            return NextResponse.json(contents);
        } else {
            // Single file content
            const fileInfo = {
                name: data.name,
                path: data.path,
                sha: data.sha,
                size: data.size,
                type: data.type,
                content: data.content ? Buffer.from(data.content, 'base64').toString() : null,
                encoding: data.encoding,
                url: data.html_url,
                downloadUrl: data.download_url
            };

            return NextResponse.json(fileInfo);
        }
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "File or repository not found" }, { status: 404 });
        }

        console.error("Error fetching file/directory contents:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
