import { Metadata } from "next";
import { getOctokitClient } from "@/utils/github";
import { generateRepoMetadata } from "@/utils/metadata";

export async function generateMetadata({
    params
}: {
    params: { name: string[] }
}): Promise<Metadata> {
    // For Next.js dynamic metadata generation, we need to carefully handle params
    // We can't access params.name directly in a server component without awaiting params

    try {
        // Use Promise.resolve() to properly handle params in the async context
        const resolvedParams = await Promise.resolve(params);
        const nameSegments = resolvedParams?.name || [];

        // Make sure we have both owner and repo
        if (nameSegments.length < 2) {
            throw new Error("Missing owner or repo name");
        }

        const owner = nameSegments[0];
        const repo = nameSegments[1];

        // Use Octokit client directly for server component
        const octokit = getOctokitClient();

        const { data: repoData } = await octokit.rest.repos.get({
            owner,
            repo
        });

        return generateRepoMetadata(repo, owner, repoData.description || undefined);
    } catch (error) {
        // In case of error, generate generic metadata
        // Use safe access to params
        const resolvedParams = await Promise.resolve(params);
        const nameSegments = resolvedParams?.name || [];
        const owner = nameSegments[0] || "Owner";
        const repo = nameSegments[1] || "Repository";

        return generateRepoMetadata(
            repo,
            owner,
            "GitHub repository information"
        );
    }
}