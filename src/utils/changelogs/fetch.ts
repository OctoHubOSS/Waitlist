import type { TagObject } from "@/types/api";
import type { Octokit } from "octokit";
import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

type Commit = RestEndpointMethodTypes["repos"]["compareCommits"]["response"]["data"]["commits"][0];

interface TagInfo {
    tag_name: string;
    target_commitish: string;
    published_at: string;
    html_url: string;
    body: string;
    prerelease: boolean;
    draft: boolean;
}

interface TagData {
    tagger: {
        name: string;
        date: string;
    };
}

/**
 * Fetch commits for a specific release using multiple strategies
 */
export async function fetchCommitsForRelease(
    octokit: Octokit,
    owner: string,
    repo: string,
    release: TagInfo,
    previousRelease: TagInfo | null
): Promise<Commit[]> {
    const currentTagSha = release.target_commitish;
    let baseRef: string;

    if (previousRelease) {
        baseRef = previousRelease.target_commitish;
    } else {
        baseRef = await getCommitShaFromTag(octokit, owner, repo, release.tag_name);
    }

    console.log(
        `Comparing commits for ${release.tag_name}: base=${baseRef}, head=${currentTagSha}`
    );

    const { data } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: baseRef,
        head: currentTagSha,
    });

    if (!data.commits) {
        console.log(`No commits found for ${release.tag_name}`);
        return [];
    }

    return data.commits;
}

/**
 * Fetch commits for a specific tag using multiple strategies
 */
export async function fetchCommitsForTag(
    octokit: Octokit,
    owner: string,
    repo: string,
    tag: TagObject
): Promise<Commit[]> {
    const { data: tagCommits } = await octokit.request("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo,
        sha: tag.commit.sha,
        per_page: 100,
    });

    if (!Array.isArray(tagCommits)) {
        console.log(`No commits found for tag ${tag.name}`);
        return [];
    }

    return tagCommits as Commit[];
}

/**
 * Get the SHA of a tag
 */
export async function getCommitShaFromTag(
    octokit: Octokit,
    owner: string,
    repo: string,
    tagName: string
): Promise<string> {
    const { data: tagInfo } = await octokit.rest.git.getTag({
        owner,
        repo,
        tag_sha: tagName,
    });

    if (!tagInfo.object?.sha) {
        throw new Error(`Could not find commit SHA for tag ${tagName}`);
    }

    return tagInfo.object.sha;
}

/**
 * Get the first commit of the default branch
 */
export async function getDefaultBranchFirstCommit(octokit: Octokit, owner: string, repo: string): Promise<string> {
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
