import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useRef } from "react";
import { Search, Home } from "lucide-react";
import { DocCategory } from "@/utils/documentation/markdown";
import { IconRenderer } from "./IconRenderer";

interface DocSidebarProps {
    categories: DocCategory[];
    selectedCategory: string | null;
    baseCategory: DocCategory | null;
    onCategorySelect: (categoryTitle: string) => void;
    isLoading: boolean;
    searchQuery: string;
    onSearch: (query: string) => void;
    onSidebarClose?: () => void;
}

export function DocSidebar({
    categories,
    selectedCategory,
    baseCategory,
    onCategorySelect,
    isLoading,
    searchQuery,
    onSearch,
    onSidebarClose = () => { }
}: DocSidebarProps) {
    const pathname = usePathname();

    // Filter navigation based on search query
    const filteredCategories = searchQuery
        ? categories
            .map((category) => ({
                ...category,
                pages: category.pages.filter((page) =>
                    page.title.toLowerCase().includes(searchQuery.toLowerCase())
                ),
            }))
            .filter((category) => category.pages.length > 0)
        : categories;

    return (
        <div className="p-0">
            {/* Search input */}
            <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-500" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full py-2 pl-10 pr-3 bg-github-dark-secondary border border-github-border rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-github-accent focus:border-github-accent"
                />
            </div>

            {isLoading ? (
                <div className="text-gray-400 text-sm">Loading navigation...</div>
            ) : (
                <nav className="mt-6">
                    {/* Root Docs quick link if we're not on it */}
                    {baseCategory && selectedCategory !== baseCategory.title && (
                        <div className="mb-6">
                            <Link
                                href="/docs"
                                className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
                                onClick={onSidebarClose}
                            >
                                <Home size={18} className="mr-2" />
                                <span>Base Documentation</span>
                            </Link>
                        </div>
                    )}

                    {/* Show sections for current category */}
                    {filteredCategories
                        .filter((category) =>
                            // Show the base category when at /docs or show the selected category
                            (pathname === "/docs" && category === baseCategory) ||
                            category.title === selectedCategory
                        )
                        .map((category, idx) => (
                            <div key={idx} className="space-y-6">
                                {category.sections && category.sections.length > 0 ? (
                                    // Show sections if available
                                    category.sections.map((section) => (
                                        <div key={section.id} className="mb-6">
                                            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3 px-3">
                                                {section.title}
                                            </h3>
                                            <div className="space-y-1">
                                                {section.pages.map((page) => {
                                                    const isActive = pathname === `/docs/${page.slug}`;
                                                    return (
                                                        <Link
                                                            href={`/docs/${page.slug}`}
                                                            key={page.slug}
                                                            className={`
                                                                flex items-center px-3 py-2 text-sm rounded-md transition-colors
                                                                ${isActive
                                                                    ? "bg-github-accent/10 text-github-accent border-l-2 border-github-accent -ml-[2px]"
                                                                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                                                                }
                                                            `}
                                                            onClick={onSidebarClose}
                                                        >
                                                            {page.icon && <IconRenderer iconName={page.icon} />}
                                                            {page.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // No sections, just show pages
                                    <>
                                        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3 px-3">
                                            {category.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {category.pages.map((page) => {
                                                const isActive = pathname === `/docs/${page.slug}`;
                                                return (
                                                    <Link
                                                        href={`/docs/${page.slug}`}
                                                        key={page.slug}
                                                        className={`
                                                            flex items-center px-3 py-2 text-sm rounded-md transition-colors
                                                            ${isActive
                                                                ? "bg-github-accent/10 text-github-accent border-l-2 border-github-accent -ml-[2px]"
                                                                : "text-gray-300 hover:text-white hover:bg-gray-800"
                                                            }
                                                        `}
                                                        onClick={onSidebarClose}
                                                    >
                                                        {page.icon && <IconRenderer iconName={page.icon} />}
                                                        {page.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                </nav>
            )}
        </div>
    );
}
