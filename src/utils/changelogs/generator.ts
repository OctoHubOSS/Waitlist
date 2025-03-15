import { ChangelogEntry, TagObject, ProcessedCommit } from '@/types/api';
import { generateFormattedBody, processCommits } from './commits';
import { fetchCommitsForRelease, fetchCommitsForTag, getTagUrl } from './fetch';

/**
 * Generate changelog from release information
 */
export async function generateChangelogFromRelease(
    octokit: any,
    owner: string,
    repo: string,
    release: any,
    previousRelease: any | null,
    isLatest: boolean
): Promise<ChangelogEntry> {
    // Base changelog object
    const changelog: ChangelogEntry = {
        version: release.tag_name,
        name: release.name || release.tag_name,
        isLatest,
        publishedAt: release.published_at,
        url: release.html_url,
        description: release.body || "",
        prerelease: release.prerelease || false,
        draft: release.draft || false,
        commits: [] as ProcessedCommit[], // Explicitly type the array
        summary: {
            features: 0,
            fixes: 0,
            improvements: 0,
            docs: 0,
            others: 0,
            totalCommits: 0
        },
        formattedBody: ""
    };

    try {
        // Always fetch commits, even if the release has a body
        // This ensures we have commit data for display
        const commits = await fetchCommitsForRelease(octokit, owner, repo, release, previousRelease);

        // Process the commits
        const processedCommits = processCommits(commits);
        changelog.commits = processedCommits.commits;
        changelog.summary = processedCommits.summary;

        // Generate formatted body from commits
        const generatedBody = generateFormattedBody(processedCommits);

        // If the release has a body, use it as formattedBody but also keep generated commit history
        if (release.body && release.body.trim() !== "") {
            changelog.formattedBody = release.body;
            changelog.description = generatedBody;
        } else {
            // Otherwise use the generated body
            changelog.formattedBody = generatedBody;
            changelog.description = generatedBody;
        }

        return changelog;
    } catch (error: any) {
        console.error(`Error generating changelog for release ${release.tag_name}:`, error);
        return {
            ...changelog,
            error: `Could not fetch complete commit history: ${error.message}`
        };
    }
}

/**
 * Generate changelog from tag information
 */
export async function generateChangelogFromTag(
    octokit: any,
    owner: string,
    repo: string,
    tag: TagObject,
    previousTag: TagObject | null,
    isLatest: boolean
): Promise<ChangelogEntry> {
    // Base changelog object with properly typed commits array
    const changelog: ChangelogEntry = {
        version: tag.name,
        name: tag.name,
        isLatest,
        publishedAt: null,
        url: getTagUrl(owner, repo, tag.name),
        description: "",
        prerelease: false,
        draft: false,
        commits: [] as ProcessedCommit[], // Explicitly type the array
        summary: {
            features: 0,
            fixes: 0,
            improvements: 0,
            docs: 0,
            others: 0,
            totalCommits: 0
        },
        formattedBody: ""
    };

    try {
        // Try to get tag date (publishedAt)
        try {
            const { data: tagData } = await octokit.rest.git.getTag({
                owner, repo, tag_sha: tag.commit.sha
            });
            changelog.publishedAt = tagData.tagger ? tagData.tagger.date : null;
        } catch (err) {
            console.error(`Could not fetch tag data for ${tag.name}:`, err);
            // Try to get commit date instead
            try {
                const { data: commitData } = await octokit.rest.git.getCommit({
                    owner, repo, commit_sha: tag.commit.sha
                });
                changelog.publishedAt = commitData.author?.date || null;
            } catch (commitErr) {
                console.error(`Could not fetch commit date for ${tag.name}:`, commitErr);
            }
        }

        // Fetch commits for this tag
        const commits = await fetchCommitsForTag(octokit, owner, repo, tag, previousTag);

        // Process the commits
        const processedCommits = processCommits(commits);
        changelog.commits = processedCommits.commits;
        changelog.summary = processedCommits.summary;

        // Generate formatted body from commits
        const generatedBody = generateFormattedBody(processedCommits);
        changelog.formattedBody = generatedBody;
        changelog.description = generatedBody;

        return changelog;
    } catch (error: any) {
        console.error(`Error generating changelog for tag ${tag.name}:`, error);
        return {
            ...changelog,
            error: `Could not fetch complete commit history: ${error.message}`
        };
    }
}