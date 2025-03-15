import { TagObject } from '@/types/api';

/**
 * Fetch commits for a specific release using multiple strategies
 */
export async function fetchCommitsForRelease(
    octokit: any,
    owner: string,
    repo: string,
    release: any,
    previousRelease: any | null
): Promise<any[]> {
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
            // For the first release, use empty tree SHA to get all commits
            baseRef = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"; // Git empty tree SHA
        }

        console.log(`Comparing commits for ${release.tag_name}: base=${baseRef}, head=${currentTagSha}`);

        try {
            // Try compareCommits first
            const { data } = await octokit.rest.repos.compareCommits({
                owner, repo, base: baseRef, head: currentTagSha
            });

            if (data.commits && data.commits.length > 0) {
                console.log(`Found ${data.commits.length} commits for release ${release.tag_name}`);
                return data.commits;
            }
            throw new Error("No commits found via compare");
        } catch (compareError) {
            // Fall back to direct tag lookup
            console.log(`Falling back to direct commit lookup for ${release.tag_name}`);
            const { data: tagCommits } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner, repo, sha: release.tag_name, per_page: 100
            });

            if (tagCommits && tagCommits.length > 0) {
                console.log(`Found ${tagCommits.length} direct commits for ${release.tag_name}`);
                return tagCommits;
            }

            throw compareError;
        }
    } catch (error) {
        console.error(`Error fetching commits for release ${release.tag_name}:`, error);
        throw error;
    }
}

/**
 * Fetch commits for a specific tag using multiple strategies
 */
export async function fetchCommitsForTag(
    octokit: any,
    owner: string,
    repo: string,
    tag: TagObject,
    previousTag: TagObject | null
): Promise<any[]> {
    // First try: direct commits to tag (works well for SysManix)
    try {
        console.log(`Directly fetching commits for tag ${tag.name}`);
        const { data: tagCommits } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
            owner, repo, sha: tag.name, per_page: 100
        });

        if (tagCommits && tagCommits.length > 0) {
            console.log(`Found ${tagCommits.length} commits for tag ${tag.name}`);
            return tagCommits;
        }
    } catch (directError) {
        console.log(`Direct tag lookup failed for ${tag.name}:`, directError);
        // Continue to next method
    }

    // Second try: compare with previous tag or empty tree
    try {
        let baseRef = previousTag ? previousTag.commit.sha : "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

        // Special handling for certain repos
        if (!previousTag && owner.toLowerCase() === 'toxic-development') {
            console.log('Using empty tree as base for Toxic Development repository');
            baseRef = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"; // Empty tree SHA
        }

        console.log(`Comparing commits for ${tag.name}: base=${baseRef}, head=${tag.commit.sha}`);
        const { data } = await octokit.rest.repos.compareCommits({
            owner, repo, base: baseRef, head: tag.commit.sha
        });

        if (data.commits && data.commits.length > 0) {
            console.log(`Found ${data.commits.length} commits for tag ${tag.name} via compare`);
            return data.commits;
        }

        throw new Error("No commits found via compare");
    } catch (compareError) {
        console.error(`Compare failed for ${tag.name}:`, compareError);

        // Third try: get direct commits to the commit SHA
        try {
            const { data: directCommits } = await octokit.rest.repos.listCommits({
                owner, repo, sha: tag.commit.sha, per_page: 100
            });

            console.log(`Found ${directCommits.length} direct commits for SHA ${tag.commit.sha}`);
            return directCommits;
        } catch (shaError) {
            console.error(`SHA lookup failed for ${tag.name}:`, shaError);
            // Last resort: return at least the tag's commit itself
            const { data: singleCommit } = await octokit.rest.repos.getCommit({
                owner, repo, ref: tag.commit.sha
            });
            return [singleCommit];
        }
    }
}

/**
 * Get the SHA of a tag
 */
export async function getCommitShaFromTag(octokit: any, owner: string, repo: string, tagName: string): Promise<string> {
    try {
        const { data: tagInfo } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `tags/${tagName}`
        });

        if (!tagInfo || !tagInfo.object || !tagInfo.object.sha) {
            throw new Error(`Invalid tag reference for ${tagName}`);
        }

        return tagInfo.object.sha;
    } catch (error) {
        console.error(`Failed to get SHA for tag ${tagName}:`, error);
        throw error;
    }
}

/**
 * Get the first commit of the default branch
 */
export async function getDefaultBranchFirstCommit(octokit: any, owner: string, repo: string): Promise<string> {
    try {
        // First get the default branch
        const { data: repoInfo } = await octokit.rest.repos.get({
            owner,
            repo
        });

        if (!repoInfo || !repoInfo.default_branch) {
            throw new Error("Could not determine default branch");
        }

        // Get the oldest commit we can find on the default branch
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            sha: repoInfo.default_branch,
            per_page: 1,
            page: 1
        });

        if (commits && commits.length > 0 && commits[0].sha) {
            return commits[0].sha;
        }

        throw new Error("No commits found in the repository");
    } catch (error) {
        console.error("Failed to get first commit:", error);
        throw error;
    }
}

/**
 * Ensure tag has proper URL structure
 */
export function getTagUrl(owner: string, repo: string, tagName: string): string {
    // Ensure tag URL is properly formatted for GitHub
    return `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tagName)}`;
}
