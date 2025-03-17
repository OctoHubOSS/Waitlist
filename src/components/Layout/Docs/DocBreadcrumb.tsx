import Link from "next/link";
import React from "react";

interface DocBreadcrumbProps {
    currentPage?: {
        title: string;
        slug: string;
    } | null;
}

export function DocBreadcrumb({ currentPage }: DocBreadcrumbProps) {
    return (
        <div className="bg-github-dark border-b border-github-border p-4">
            <div className="w-full max-w-none">
                <div className="text-sm text-gray-400 flex items-center">
                    <Link href="/docs" className="hover:text-white">
                        Docs
                    </Link>
                    {currentPage && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="text-white font-medium">
                                {currentPage.title}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
