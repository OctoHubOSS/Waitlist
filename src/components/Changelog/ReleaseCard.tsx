import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, GitCommitIcon, TagIcon } from "lucide-react";

interface ReleaseCardProps {
    version: string;
    name: string;
    isLatest: boolean;
    publishedAt: string | null;
    description: string;
    formattedBody: string;
    prerelease: boolean;
    draft: boolean;
    url: string;
    summary: {
        features: number;
        fixes: number;
        improvements: number;
        docs: number;
        others: number;
        totalCommits: number;
    };
}

export default function ReleaseCard({
    version,
    name,
    isLatest,
    publishedAt,
    description,
    formattedBody,
    prerelease,
    draft,
    url,
    summary
}: ReleaseCardProps) {
    // Determine release status and badge style
    const getStatusBadge = () => {
        if (prerelease) {
            return {
                label: "Pre-release",
                className: "bg-amber-500/10 border-amber-500/20 text-amber-500"
            };
        }
        if (draft) {
            return {
                label: "Draft",
                className: "bg-blue-500/10 border-blue-500/20 text-blue-500"
            };
        }
        if (isLatest) {
            return {
                label: "Latest",
                className: "bg-green-500/10 border-green-500/20 text-green-500"
            };
        }
        return {
            label: "Stable",
            className: "bg-primary/10 border-primary/20 text-primary"
        };
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const status = getStatusBadge();

    return (
        <div className="p-6 transition-colors border rounded-lg bg-background/50 hover:bg-background/80 mb-6">
            <div className="flex flex-col justify-between gap-2 mb-4 md:flex-row md:items-center">
                <div>
                    <h3 className="flex items-center text-xl font-medium">
                        {name || `Release ${version}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1 bg-muted/30">
                            <TagIcon className="w-3 h-3" />
                            {version}
                        </Badge>
                        {publishedAt && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-muted/30">
                                <CalendarIcon className="w-3 h-3" />
                                {formatDate(publishedAt)}
                            </Badge>
                        )}
                        {summary.totalCommits > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <GitCommitIcon className="w-3 h-3" />
                                {summary.totalCommits} commits
                            </Badge>
                        )}
                    </div>
                </div>
                <Badge variant="outline" className={status.className}>
                    {status.label}
                </Badge>
            </div>

            <div
                className="mb-4 prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: formattedBody }}
            />

            <div className="flex justify-end">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                >
                    View on GitHub
                </a>
            </div>
        </div>
    );
}
