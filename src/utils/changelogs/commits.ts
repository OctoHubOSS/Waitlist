import { ProcessedCommit, ProcessedCommits } from '@/types/api';

/**
 * Process commits to categorize them and extract useful information
 */
export function processCommits(commits: any[]): ProcessedCommits {
    const result: ProcessedCommits = {
        commits: [],
        summary: {
            features: 0,
            fixes: 0,
            improvements: 0,
            docs: 0,
            others: 0,
            totalCommits: 0
        }
    };

    commits.forEach(commit => {
        if (!commit || !commit.commit) return;

        const message = commit.commit.message || '';
        const firstLine = getCommitTitle(message);
        let type: 'feature' | 'fix' | 'improvement' | 'docs' | 'other' = "other";

        // Match the categorization logic from the client component more closely
        if (
            /^feat|feature|add|enhance|new/i.test(firstLine) ||
            message.toLowerCase().includes('feat:') ||
            message.toLowerCase().includes('feature:')
        ) {
            type = "feature";
            result.summary.features++;
        } else if (
            /^fix|bug|issue|resolve|close/i.test(firstLine) ||
            message.toLowerCase().includes('fix:') ||
            message.toLowerCase().includes('bug:')
        ) {
            type = "fix";
            result.summary.fixes++;
        } else if (
            /^refactor|perf|improve|update|optimize|chore/i.test(firstLine) ||
            message.toLowerCase().includes('refactor:') ||
            message.toLowerCase().includes('perf:') ||
            message.toLowerCase().includes('improve:') ||
            message.toLowerCase().includes('update:')
        ) {
            type = "improvement";
            result.summary.improvements++;
        } else if (
            /^doc|readme|changelog/i.test(firstLine) ||
            message.toLowerCase().includes('doc:') ||
            message.toLowerCase().includes('docs:') ||
            message.toLowerCase().includes('readme:')
        ) {
            type = "docs";
            result.summary.docs++;
        } else {
            result.summary.others++;
        }

        // Format commit data similar to how the client component does
        result.commits.push({
            sha: commit.sha || '',
            shortSha: commit.sha ? commit.sha.substring(0, 7) : '',
            message: cleanCommitMessage(firstLine), // Clean up message for better display
            fullMessage: message,
            date: commit.commit.author?.date || null,
            author: {
                name: commit.commit.author?.name || null,
                email: commit.commit.author?.email || null,
                login: commit.author?.login || null,
                avatar_url: commit.author?.avatar_url || null
            },
            url: commit.html_url || '',
            type
        });
    });

    result.summary.totalCommits = commits.length;

    // Sort commits by type: features first, then fixes, then improvements, then docs, then others
    result.commits.sort((a, b) => {
        const typeOrder = {
            feature: 0,
            fix: 1,
            improvement: 2,
            docs: 3,
            other: 4
        };
        return typeOrder[a.type] - typeOrder[b.type];
    });

    return result;
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
    const { commits, summary } = processedCommits;

    if (commits.length === 0) {
        return "No changes found for this release.";
    }

    // Group commits by type
    const features: string[] = [];
    const fixes: string[] = [];
    const improvements: string[] = [];
    const docs: string[] = [];
    const others: string[] = [];

    commits.forEach((commit: ProcessedCommit) => {
        const message = commit.message;
        // Format exactly like the client component does
        const formattedItem = `- ${message} ([${commit.shortSha}](${commit.url}))`;

        switch (commit.type) {
            case 'feature':
                features.push(formattedItem);
                break;
            case 'fix':
                fixes.push(formattedItem);
                break;
            case 'improvement':
                improvements.push(formattedItem);
                break;
            case 'docs':
                docs.push(formattedItem);
                break;
            default:
                others.push(formattedItem);
                break;
        }
    });

    // Build markdown exactly matching the client component format
    let markdown = '';

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
