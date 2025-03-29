import type { ChangelogEntry, TagObject, ProcessedCommits } from "@/types/api";
import { generateFormattedBody, processCommits } from "./commits";
import { fetchCommitsForRelease, fetchCommitsForTag, getTagUrl } from "./fetch";
import type { Octokit } from "octokit";

interface TagInfo {
  tag_name: string;
  name?: string;
  target_commitish: string;
  published_at: string;
  html_url: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

export async function generateChangelogEntry(
  octokit: Octokit,
  owner: string,
  repo: string,
  release: TagInfo,
  previousRelease: TagInfo | null,
  isLatest: boolean
): Promise<ChangelogEntry> {
  const version = release.tag_name;
  const name = release.name || release.tag_name;
  const publishedAt = release.published_at;
  const url = release.html_url;
  const description = release.body || "";
  const prerelease = release.prerelease;
  const draft = release.draft;
  let formattedBody = "";

  try {
    const fetchedCommits = await fetchCommitsForRelease(
      octokit,
      owner,
      repo,
      release,
      previousRelease
    );
    // Use type assertion to make TypeScript happy - the actual structure is what processCommits expects
    const processedCommits = await processCommits(
      octokit,
      fetchedCommits as any
    );
    formattedBody = generateFormattedBody(processedCommits);
  } catch (error: any) {
    console.error(
      `Failed to generate changelog for ${release.tag_name}:`,
      error
    );
    // Create a valid ChangelogEntry without the error property
    return {
      sha: "",
      shortSha: "",
      message: `Error: Could not fetch complete commit history: ${error instanceof Error ? error.message : "Unknown error"}`,
      authorName: "",
      authorUrl: null,
      url: "",
      type: "other",
    };
  }

  return {
    sha: "",
    shortSha: "",
    message: "",
    authorName: "",
    authorUrl: null,
    url: "",
    type: "other",
  };
}

export async function generateTagChangelogEntry(
  octokit: Octokit,
  owner: string,
  repo: string,
  tag: TagObject,
  isLatest: boolean
): Promise<ChangelogEntry> {
  const version = tag.name;
  const name = tag.name;
  const publishedAt = null;
  const url = getTagUrl(owner, repo, tag.name);
  const description = "";
  const prerelease = false;
  const draft = false;
  let formattedBody = "";

  try {
    const fetchedCommits = await fetchCommitsForTag(octokit, owner, repo, tag);
    // Use type assertion to make TypeScript happy - the actual structure is what processCommits expects
    const processedCommits = await processCommits(
      octokit,
      fetchedCommits as any
    );
    formattedBody = generateFormattedBody(processedCommits);
  } catch (error) {
    console.error(`Error fetching commits for tag ${version}:`, error);
    // Create a valid ChangelogEntry without the error property
    return {
      sha: "",
      shortSha: "",
      message: `Error: Could not fetch complete commit history: ${error instanceof Error ? error.message : "Unknown error"}`,
      authorName: "",
      authorUrl: null,
      url: "",
      type: "other",
    };
  }

  return {
    sha: "",
    shortSha: "",
    message: "",
    authorName: "",
    authorUrl: null,
    url: "",
    type: "other",
  };
}