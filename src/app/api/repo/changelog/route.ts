import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner') || 'gitlogs';
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
        let tags = [];
        if (releases.length === 0) {
            const { data: tagsData } = await octokit.rest.repos.listTags({
                owner,
                repo,
                per_page: latest ? 1 : count
            });
            tags = tagsData;
        }

        // Step 2: Generate changelog for each release/tag
        const changelogs = [];

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

/**
 * Generate changelog from release information
 */
async function generateChangelogFromRelease(
    octokit: any,
    owner: string,
    repo: string,
    release: any,
    previousRelease: any | null,
    isLatest: boolean
) {
    // Base changelog object
    const changelog = {
        version: release.tag_name,
        name: release.name || release.tag_name,
        isLatest,
        publishedAt: release.published_at,
        url: release.html_url,
        description: release.body || "",
        commits: [] as any[],
        summary: {
            features: 0,
            fixes: 0,
            others: 0,
            totalCommits: 0
        }
    };

    try {
        // Get the commit SHA for the current release
        const currentTagSha = release.target_commitish ||
            await getCommitShaFromTag(octokit, owner, repo, release.tag_name);

        let baseRef;

        if (previousRelease) {
            // If there's a previous release, use it as the base
            baseRef = previousRelease.target_commitish ||
                await getCommitShaFromTag(octokit, owner, repo, previousRelease.tag_name);
        } else {
            try {
                // For the first release, we'll fetch the repo's commits and use an approach
                // that ensures we get all commits up to this release
                const { data: repoInfo } = await octokit.rest.repos.get({
                    owner,
                    repo
                });

                // Check if this is the first commit in the repo
                const { data: commits } = await octokit.rest.repos.listCommits({
                    owner,
                    repo,
                    sha: repoInfo.default_branch,
                    per_page: 1,
                    until: release.published_at, // Get commits before this release date
                    page: 10000 // A large number to get to the oldest possible page
                });

                if (commits.length > 0) {
                    // If we found any older commits, use the oldest as base
                    baseRef = commits[0].sha;
                } else {
                    // Fallback to first commit on default branch
                    baseRef = await getDefaultBranchFirstCommit(octokit, owner, repo);
                }
            } catch (error) {
                console.error("Error determining base commit for first release:", error);
                // Use an empty tree as fallback (will include all commits)
                baseRef = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"; // Git empty tree SHA
            }
        }

        console.log(`Comparing commits for ${release.tag_name}: base=${baseRef}, head=${currentTagSha}`);

        // Fetch commits between releases
        const { data: commits } = await octokit.rest.repos.compareCommits({
            owner,
            repo,
            base: baseRef,
            head: currentTagSha
        });

        console.log(`Found ${commits.commits?.length || 0} commits for release ${release.tag_name}`);

        // Process commits for the changelog
        const processedCommits = processCommits(commits.commits || []);
        changelog.commits = processedCommits.commits;
        changelog.summary = processedCommits.summary;

        return changelog;
    } catch (error) {
        console.error(`Error generating changelog for release ${release.tag_name}:`, error);

        // Return partial changelog if error occurs during commit processing
        return {
            ...changelog,
            error: `Could not fetch complete commit history for this release: ${error.message}`
        };
    }
}

/**
 * Generate changelog from tag information
 */
async function generateChangelogFromTag(
    octokit: any,
    owner: string,
    repo: string,
    tag: any,
    previousTag: any | null,
    isLatest: boolean
) {
    // Base changelog object
    const changelog = {
        version: tag.name,
        name: tag.name,
        isLatest,
        publishedAt: null as string | null, // Tags don't have published dates by default
        url: `https://github.com/${owner}/${repo}/releases/tag/${tag.name}`,
        description: "",
        commits: [] as any[],
        summary: {
            features: 0,
            fixes: 0,
            others: 0,
            totalCommits: 0
        }
    };

    try {
        // Try to get commit date to use as "published date" for the tag
        const { data: tagData } = await octokit.rest.git.getTag({
            owner,
            repo,
            tag_sha: tag.commit.sha
        });

        changelog.publishedAt = tagData.tagger ? tagData.tagger.date : null;

        let baseRef;

        if (previousTag) {
            // If we have a previous tag, use it as base
            baseRef = previousTag.commit.sha;
        } else {
            try {
                // For the first tag, we want all commits leading up to it
                const { data: repoInfo } = await octokit.rest.repos.get({
                    owner,
                    repo
                });

                // Get the repository's first commit by going back as far as possible
                const { data: commits } = await octokit.rest.repos.listCommits({
                    owner,
                    repo,
                    sha: repoInfo.default_branch,
                    per_page: 1,
                    page: 10000 // A large number to get to the oldest possible page
                });

                if (commits.length > 0) {
                    // If we found any older commits, use the oldest as base
                    baseRef = commits[0].sha;
                } else {
                    // Fallback to first commit
                    baseRef = await getDefaultBranchFirstCommit(octokit, owner, repo);
                }
            } catch (error) {
                console.error("Error determining base commit for first tag:", error);
                // Use an empty tree as fallback (will include all commits)
                baseRef = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"; // Git empty tree SHA
            }
        }

        console.log(`Comparing commits for ${tag.name}: base=${baseRef}, head=${tag.commit.sha}`);

        // Fetch commits between tags
        const { data: commits } = await octokit.rest.repos.compareCommits({
            owner,
            repo,
            base: baseRef,
            head: tag.commit.sha
        });

        console.log(`Found ${commits.commits?.length || 0} commits for tag ${tag.name}`);

        // Process commits for the changelog
        const processedCommits = processCommits(commits.commits || []);
        changelog.commits = processedCommits.commits;
        changelog.summary = processedCommits.summary;

        return changelog;
    } catch (error) {
        console.error(`Error generating changelog for tag ${tag.name}:`, error);

        // Return partial changelog if error occurs during commit processing
        return {
            ...changelog,
            error: `Could not fetch complete commit history for this tag: ${error.message}`
        };
    }
}

/**
 * Get the SHA of a tag
 */
async function getCommitShaFromTag(octokit: any, owner: string, repo: string, tagName: string) {
    try {
        const { data: tagInfo } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `tags/${tagName}`
        });
        return tagInfo.object.sha;
    } catch (error) {
        console.error(`Failed to get SHA for tag ${tagName}:`, error);
        throw error;
    }
}

/**
 * Get the first commit of the default branch
 */
async function getDefaultBranchFirstCommit(octokit: any, owner: string, repo: string) {
    try {
        // First get the default branch
        const { data: repoInfo } = await octokit.rest.repos.get({
            owner,
            repo
        });

        // Get the oldest commit we can find on the default branch
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            sha: repoInfo.default_branch,
            per_page: 1,
            page: 1
        });

        if (commits.length > 0) {
            return commits[0].sha;
        }

        throw new Error("No commits found in the repository");
    } catch (error) {
        console.error("Failed to get first commit:", error);
        throw error;
    }
}

/**
 * Process commits to categorize them and extract useful information
 */
function processCommits(commits: any[]) {
    const result = {
        commits: [] as any[],
        summary: {
            features: 0,
            fixes: 0,
            others: 0,
            totalCommits: 0
        }
    };

    commits.forEach(commit => {
        const message = commit.commit.message;
        let type = "other";

        // Determine commit type based on message
        if (/^feat|feature|add|enhance/i.test(message)) {
            type = "feature";
            result.summary.features++;
        } else if (/^fix|bug|issue|resolve|close/i.test(message)) {
            type = "fix";
            result.summary.fixes++;
        } else {
            result.summary.others++;
        }

        // Format commit data
        result.commits.push({
            sha: commit.sha,
            shortSha: commit.sha.substring(0, 7),
            message: getCommitTitle(message),
            fullMessage: message,
            date: commit.commit.author?.date,
            author: {
                name: commit.commit.author?.name,
                email: commit.commit.author?.email,
                login: commit.author?.login || null,
                avatar_url: commit.author?.avatar_url || null
            },
            url: commit.html_url,
            type
        });
    });

    result.summary.totalCommits = commits.length;

    // Sort commits: features first, then fixes, then others
    result.commits.sort((a, b) => {
        const typeOrder = { feature: 0, fix: 1, other: 2 };
        return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
    });

    return result;
}

/**
 * Extract the first line or title from a commit message
 */
function getCommitTitle(message: string): string {
    // Get first line or limit to reasonable length
    return message.split('\n')[0].trim();
}
