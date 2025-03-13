/**
 * Extract repository owner and name from URL or params
 */
export function extractRepoInfo(nameParams: string[], pathname: string) {
    let extractedOwner, extractedRepo;

    if (Array.isArray(nameParams) && nameParams.length >= 2) {
        [extractedOwner, extractedRepo] = nameParams;
    } else {
        // Extract from URL path as fallback
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length >= 3 && pathParts[0] === 'repo') {
            extractedOwner = pathParts[1];
            extractedRepo = pathParts[2];
        }
    }

    // Return structured result
    return {
        extractedOwner,
        extractedRepo,
        error: (!extractedOwner || !extractedRepo) ? "Could not determine repository from URL" : null
    };
}

/**
 * Format repository size to human-readable string
 */
export function formatRepoSize(sizeInKB: number): string {
    if (sizeInKB < 1024) {
        return `${sizeInKB} KB`;
    } else {
        return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    // Determine appropriate time unit
    for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }

    return "just now";
}