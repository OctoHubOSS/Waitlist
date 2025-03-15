import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";
import { generateChangelogFromRelease, generateChangelogFromTag } from "@/utils/changelogs/generator";
import { ChangelogEntry, TagObject } from "@/types/api";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner') || 'git-logs';
        const repo = searchParams.get('repo') || 'octosearch';
        const latest = searchParams.get('latest') === 'true';
        const count = parseInt(searchParams.get('count') || '5');

        const octokit = getOctokitClient();

        // Step 1: Fetch all releases/tags
        const { data: releases } = await octokit.rest.repos.listReleases({
            owner,
            repo,
            per_page: latest ? 1 : count
        });

        // If no releases are found, try tags instead
        let tags: TagObject[] = [];
        if (releases.length === 0) {
            const { data: tagsData } = await octokit.rest.repos.listTags({
                owner,
                repo,
                per_page: latest ? 1 : count
            });
            tags = tagsData;
        }

        // Step 2: Generate changelog for each release/tag
        const changelogs: ChangelogEntry[] = [];

        if (releases.length > 0) {
            // Process releases
            for (let i = 0; i < releases.length; i++) {
                const currentRelease = releases[i];
                const nextRelease = i < releases.length - 1 ? releases[i + 1] : null;

                const changelogEntry = await generateChangelogFromRelease(
                    octokit,
                    owner,
                    repo,
                    currentRelease,
                    nextRelease,
                    i === 0 // isLatest flag
                );

                changelogs.push(changelogEntry);

                if (latest && i === 0) break; // Only process latest if requested
            }
        } else if (tags.length > 0) {
            // Process tags if no releases found
            for (let i = 0; i < tags.length; i++) {
                const currentTag = tags[i];
                const nextTag = i < tags.length - 1 ? tags[i + 1] : null;

                const changelogEntry = await generateChangelogFromTag(
                    octokit,
                    owner,
                    repo,
                    currentTag,
                    nextTag,
                    i === 0 // isLatest flag
                );

                changelogs.push(changelogEntry);

                if (latest && i === 0) break; // Only process latest if requested
            }
        }

        return NextResponse.json({ changelogs });
    } catch (err: any) {
        console.error("Error fetching changelog:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
