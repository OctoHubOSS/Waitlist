"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChangelogLayoutProps {
    children: React.ReactNode;
    title: string;
    repositories?: {
        id: string;
        name: string;
        owner: string;
        repo: string;
        disabled?: boolean;
        comingSoon?: boolean;
    }[];
}

export default function ChangelogLayout({
    children,
    title,
    repositories = []
}: ChangelogLayoutProps) {
    const [activeRepo, setActiveRepo] = useState<string | null>(
        repositories.length > 0 ? repositories.find(r => !r.disabled)?.id || null : null
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-10">
                <Link
                    href="/"
                    className="text-github-link hover:text-github-link-hover mb-4 inline-flex items-center gap-1 transition-colors"
                >
                    <span aria-hidden="true">&larr;</span> Back to home
                </Link>

                <h1 className="text-4xl font-bold mb-3 mt-6">{title}</h1>

                {repositories.length > 0 && (
                    <div className="mt-6">
                        <Tabs
                            defaultValue={activeRepo || undefined}
                            onValueChange={(value) => setActiveRepo(value)}
                            className="w-full"
                        >
                            <div className="overflow-x-auto">
                                <TabsList className="mb-6">
                                    {repositories.map(repo => (
                                        <TabsTrigger
                                            key={repo.id}
                                            value={repo.id}
                                            disabled={repo.disabled}
                                            className="relative"
                                        >
                                            {repo.name}
                                            {repo.comingSoon && (
                                                <span className="absolute px-1.5 py-0.5 text-[10px] font-medium bg-amber-500 text-white rounded-sm -top-1 -right-1">
                                                    SOON
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {repositories.map(repo => (
                                <TabsContent key={repo.id} value={repo.id}>
                                    {children}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                )}
                {repositories.length === 0 && children}
            </div>
        </div>
    );
}
