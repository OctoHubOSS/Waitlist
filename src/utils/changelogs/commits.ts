import type { ChangelogEntry, ProcessedCommits } from '@/types/api';
import type { Octokit } from "octokit";

export interface Commit {
    sha: string;
    node_id: string;
    html_url: string;
    url: string;
    author: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    } | null;
    committer: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    } | null;
    commit: {
        author: {
            name?: string | null;
            email?: string | null;
            date?: string | null;
        } | null;
        committer: {
            name?: string | null;
            email?: string | null;
            date?: string | null;
        } | null;
        message: string;
        tree: {
            url: string;
            sha: string;
        };
        url: string;
        comment_count: number;
        verification?: {
            verified: boolean;
            reason: string;
            signature: string | null;
            payload: string | null;
        } | null;
    };
    parents: {
        url: string;
        sha: string;
    }[];
    comment_count: number;
    files?: {
        sha: string;
        filename: string;
        status: string;
        additions: number;
        deletions: number;
        changes: number;
        blob_url: string;
        raw_url: string;
        contents_url: string;
        patch: string;
    }[] | undefined;
}

/**
 * Process commits to categorize them and extract useful information
 */
export async function processCommits(
  octokit: Octokit,
  commits: Commit[]
): Promise<ProcessedCommits> {
  const features: ChangelogEntry[] = [];
  const fixes: ChangelogEntry[] = [];
  const improvements: ChangelogEntry[] = [];
  const docs: ChangelogEntry[] = [];
  const others: ChangelogEntry[] = [];

  const processedCommits: ProcessedCommits = {
    features,
    fixes,
    improvements,
    docs,
    others,
    totalCommits: 0,
  };

  commits.forEach((commit) => {
    const message: string = commit?.commit?.message || "";
    const sha: string = commit?.sha || "";
    const shortSha: string = commit?.sha ? commit.sha.substring(0, 7) : "";
    const authorName: string = commit?.author?.login || "";
    const authorUrl: string = commit?.author?.html_url || "";
    const url: string = commit?.html_url || "";

    let type: "feature" | "fix" | "improvement" | "docs" | "other" = "other";

    if (
      message.toLowerCase().includes("feat:") ||
      message.toLowerCase().includes("feature:")
    ) {
      type = "feature";
    } else if (
      message.toLowerCase().includes("fix:") ||
      message.toLowerCase().includes("bug:")
    ) {
      type = "fix";
    } else if (
      message.toLowerCase().includes("refactor:") ||
      message.toLowerCase().includes("perf:") ||
      message.toLowerCase().includes("improve:") ||
      message.toLowerCase().includes("update:")
    ) {
      type = "improvement";
    } else if (
      message.toLowerCase().includes("doc:") ||
      message.toLowerCase().includes("docs:") ||
      message.toLowerCase().includes("readme:")
    ) {
      type = "docs";
    }

    const cleanedMessage = message
      .replace(
        /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\([a-z0-9_-]+\))?:\s*/i,
        ""
      )
      .replace(/\[skip ci\]/gi, "")
      .replace(/\[ci skip\]/gi, "");

    const commitEntry: ChangelogEntry = {
      sha,
      shortSha,
      message: cleanedMessage,
      authorName,
      authorUrl,
      url,
      type,
    };

    switch (type) {
      case "feature":
        features.push(commitEntry);
        break;
      case "fix":
        fixes.push(commitEntry);
        break;
      case "improvement":
        improvements.push(commitEntry);
        break;
      case "docs":
        docs.push(commitEntry);
        break;
      default:
        others.push(commitEntry);
        break;
    }
  });

  processedCommits.totalCommits = commits.length;

  return processedCommits;
}

/**
 * Clean commit message for better display
 */
export function cleanCommitMessage(message: string): string {
    // Strip common prefixes like "feat:", "fix:", etc.
    let cleanedMessage = message.replace(/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\([a-z0-9_-]+\))?:\s*/i, '');

    // Capitalize first letter
    cleanedMessage = cleanedMessage.charAt(0).toUpperCase() + cleanedMessage.slice(1);

    // Strip common formatting issues from commit messages
    cleanedMessage = cleanedMessage
        .replace(/\[skip ci\]/gi, '')
        .replace(/\[ci skip\]/gi, '')
        .trim();

    return cleanedMessage;
}

/**
 * Extract the first line or title from a commit message
 */
export function getCommitTitle(message: string): string {
    // Get first line or limit to reasonable length
    return message.split('\n')[0].trim();
}

/**
 * Generate a formatted markdown body from processed commits
 */
export function generateFormattedBody(processedCommits: ProcessedCommits): string {
    const { features, fixes, improvements, docs, others } = processedCommits;

    let markdown = "";

    if (features.length > 0) {
        markdown += `### 🚀 Features\n\n${features.join('\n')}\n\n`;
    }

    if (fixes.length > 0) {
        markdown += `### 🐞 Bug Fixes\n\n${fixes.join('\n')}\n\n`;
    }

    if (improvements.length > 0) {
        markdown += `### 🔧 Improvements\n\n${improvements.join('\n')}\n\n`;
    }

    if (docs.length > 0) {
        markdown += `### 📝 Documentation\n\n${docs.join('\n')}\n\n`;
    }

    if (others.length > 0) {
        markdown += `### 🔄 Other Changes\n\n${others.join('\n')}\n\n`;
    }

    return markdown || "No changes found for this release.";
}
