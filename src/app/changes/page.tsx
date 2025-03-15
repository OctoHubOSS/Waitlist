"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, GitCommit, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Changelog } from "@/types/api";

export default function Changelogs() {
    const [changelogs, setChangelogs] = useState<Changelog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChangelogs = async () => {
            try {
                const response = await fetch('/api/repo/changelog');

                if (!response.ok) {
                    throw new Error('Failed to fetch changelog');
                }

                const data = await response.json();
                setChangelogs(data.changelogs || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching changelog:', err);
                setError(err.message || 'Failed to load changelog');
            } finally {
                setLoading(false);
            }
        };

        fetchChangelogs();
    }, []);

    const renderSkeletons = () => (
        <div className="space-y-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-6 border rounded-lg bg-background/50">
                    <Skeleton className="w-1/4 h-6 mb-4" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-full h-4 mb-2" />
                    <Skeleton className="w-3/4 h-4" />
                    <div className="flex justify-end mt-4">
                        <Skeleton className="w-20 h-6" />
                    </div>
                </div>
            ))}
        </div>
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (changelog: Changelog) => {
        if (changelog.prerelease) {
            return {
                label: "Pre-release",
                className: "bg-amber-500/10 border-amber-500/20 text-amber-500"
            };
        }
        if (changelog.draft) {
            return {
                label: "Draft",
                className: "bg-blue-500/10 border-blue-500/20 text-blue-500"
            };
        }
        if (changelog.isLatest) {
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

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-10">
                <Link
                    href="/"
                    className="text-github-link hover:text-github-link-hover mb-4 inline-flex items-center gap-1 transition-colors"
                >
                    <span aria-hidden="true">&larr;</span> Back to home
                </Link>

                <h1 className="text-4xl font-bold mb-3 mt-6">Changelogs</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Stay updated with the latest changes and feature releases of OctoSearch.
                </p>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">OctoSearch Releases</h2>
                <Link
                    href="https://github.com/git-logs/octosearch"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 text-sm transition-colors rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                >
                    <FaGithub className="w-4 h-4" />
                    View on GitHub
                </Link>
            </div>

            {loading ? (
                renderSkeletons()
            ) : error ? (
                <div className="p-8 text-center border rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="mx-auto h-12 w-12 mb-3" />
                    <p className="mb-4">Error loading changelog: {error}</p>
                    <button
                        className="px-4 py-2 text-sm bg-destructive text-white rounded-md hover:bg-destructive/80"
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            // Retry fetching
                            fetch('/api/repo/changelog')
                                .then(response => response.json())
                                .then(data => {
                                    setChangelogs(data.changelogs || []);
                                    setLoading(false);
                                })
                                .catch(err => {
                                    setError(err.message);
                                    setLoading(false);
                                });
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : changelogs.length === 0 ? (
                <div className="p-8 text-center border rounded-lg bg-muted/50">
                    <p>No releases found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {changelogs.map(changelog => {
                        const status = getStatusBadge(changelog);

                        return (
                            <div key={changelog.version} className="p-6 transition-colors border rounded-lg bg-background/50 hover:bg-background/80">
                                <div className="flex flex-col justify-between gap-2 mb-4 md:flex-row md:items-center">
                                    <div>
                                        <h3 className="flex items-center text-xl font-medium">
                                            {changelog.name || `Release ${changelog.version}`}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <Badge variant="outline" className="flex items-center gap-1 bg-muted/30">
                                                <Tag className="w-3 h-3" />
                                                {changelog.version}
                                            </Badge>
                                            {changelog.publishedAt && (
                                                <Badge variant="outline" className="flex items-center gap-1 bg-muted/30">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(changelog.publishedAt)}
                                                </Badge>
                                            )}
                                            {changelog.summary.totalCommits > 0 && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <GitCommit className="w-3 h-3" />
                                                    {changelog.summary.totalCommits} commits
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
                                    dangerouslySetInnerHTML={{ __html: changelog.formattedBody }}
                                />

                                <div className="flex justify-end">
                                    <a
                                        href={changelog.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View on GitHub
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
