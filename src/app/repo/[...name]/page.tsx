import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateRepoMetadata } from "@/utils/metadata";
import { Suspense } from "react";
import RepositoryPageClient from "@/components/Layout/Repository/PageClient";
import RepositoryCardSkeleton from "@/components/Layout/Repository/Skeleton";

interface PageProps {
    params: Promise<{
        name: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const [owner, repo] = resolvedParams.name;
    return generateRepoMetadata(repo, owner);
}

export default async function RepoPage({ params }: PageProps) {
    try {
        const resolvedParams = await params;
        const { name } = resolvedParams;

        if (!name || name.length !== 2) {
            notFound();
        }

        const [owner, repo] = name;

        return (
            <Suspense
                fallback={
                    <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                        <RepositoryCardSkeleton />
                    </div>
                }
            >
                <RepositoryPageClient params={resolvedParams} />
            </Suspense>
        );
    } catch (error) {
        console.error("Error loading repository:", error);
        return notFound();
    }
}