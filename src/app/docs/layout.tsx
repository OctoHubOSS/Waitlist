"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { DocCategory } from "@/utils/markdown";
import * as LucideIcons from "lucide-react";
import * as ReactIcons from "react-icons/fa";

interface DocsLayoutProps {
    children: React.ReactNode;
}

// Icon component that can render icons from either Lucide or React Icons
const IconRenderer = ({ iconName }: { iconName?: string }) => {
    if (!iconName) return null;

    // Try to use Lucide icons first
    const LucideIcon = (LucideIcons as any)[iconName];
    if (LucideIcon) {
        return <LucideIcon size={18} className="mr-2" />;
    }

    // Fall back to React Icons
    const iconPrefix = iconName.substring(0, 2);
    const iconSet = (ReactIcons as any)[iconPrefix];
    if (iconSet) {
        const ReactIcon = iconSet[iconName];
        if (ReactIcon) {
            return <ReactIcon size={18} className="mr-2" />;
        }
    }

    // Default fallback
    return null;
};

export default function DocsLayout({ children }: DocsLayoutProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<DocCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await fetch('/api/docs/categories');
                const data = await response.json();
                setCategories(data);

                // Set initially expanded sections based on defaultOpen in meta
                const defaultOpenSections = data
                    .filter((category: any) => category.defaultOpen)
                    .map((category: any) => category.title);
                setExpandedSections(defaultOpenSections);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    // Get current page title for breadcrumbs
    const currentPagePath = pathname.split('/').filter(Boolean);
    const currentSlug = currentPagePath[currentPagePath.length - 1];

    // Check if it's a categorized path
    const slug = currentPagePath.length > 2 ? currentPagePath[1] : null;

    // Find the current page info
    let currentPage;
    if (slug) {
        // Look for page in the specified category
        const category = categories.find(c =>
            c.pages.some(p => p.slug.startsWith(`${slug}/`) && p.slug.endsWith(`/${currentSlug}`))
        );
        currentPage = category?.pages.find(p => p.slug.endsWith(`/${currentSlug}`));
    } else {
        // Look for page in all categories
        for (const category of categories) {
            const page = category.pages.find(p => p.slug === currentSlug);
            if (page) {
                currentPage = page;
                break;
            }
        }
    }

    // Filter navigation based on search query
    const filteredCategories = searchQuery
        ? categories.map(category => ({
            ...category,
            pages: category.pages.filter(page =>
                page.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.pages.length > 0)
        : categories;

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-github-border sticky top-0 bg-github-dark z-10">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-800 focus:outline-none"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-semibold text-white">Documentation</h1>
                <div className="w-8"></div> {/* Empty div to balance the layout */}
            </div>

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-30 
                    w-4/5 md:w-72 lg:w-80 bg-github-dark 
                    transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 transition-transform duration-200 ease-in-out
                    overflow-y-auto md:border-r border-github-border
                    md:h-screen md:sticky md:top-0
                `}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-xl font-bold text-white">Documentation</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-md text-gray-400 hover:bg-gray-800 md:hidden focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search input */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documentation..."
                            className="w-full py-2 pl-10 pr-3 bg-github-dark-secondary border border-github-border rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-github-accent focus:border-github-accent"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-gray-400 text-sm">Loading navigation...</div>
                    ) : (
                        <nav>
                            {filteredCategories.map((category, idx) => (
                                <div key={idx} className="mb-4">
                                    <button
                                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-400 uppercase tracking-wider py-2 hover:text-white focus:outline-none"
                                        onClick={() => toggleSection(category.title)}
                                        aria-expanded={expandedSections.includes(category.title)}
                                    >
                                        <span className="flex items-center">
                                            <IconRenderer iconName={category.icon} />
                                            {category.title}
                                        </span>
                                        {expandedSections.includes(category.title) ? (
                                            <ChevronDown size={18} />
                                        ) : (
                                            <ChevronRight size={18} />
                                        )}
                                    </button>

                                    {expandedSections.includes(category.title) && (
                                        <ul className="mt-1 space-y-1 pl-2 border-l border-gray-800">
                                            {category.pages.map((page) => {
                                                const isActive = pathname === `/docs/${page.slug}`;
                                                return (
                                                    <li key={page.slug}>
                                                        <Link
                                                            href={`/docs/${page.slug}`}
                                                            className={`
                                                                flex items-center px-3 py-2 text-sm rounded-md transition-colors
                                                                ${isActive
                                                                    ? "bg-github-accent/10 text-github-accent border-l-2 border-github-accent -ml-[2px]"
                                                                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                                                                }
                                                            `}
                                                            onClick={() => setSidebarOpen(false)}
                                                        >
                                                            {page.icon && (
                                                                <IconRenderer iconName={page.icon} />
                                                            )}
                                                            {page.title}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </nav>
                    )}
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 w-full">
                {/* Breadcrumb navigation */}
                <div className="bg-github-dark border-b border-github-border p-4 md:py-6 md:px-8">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="text-sm text-gray-400 flex items-center">
                            <Link href="/docs" className="hover:text-white">
                                Docs
                            </Link>
                            {currentPage && (
                                <>
                                    <span className="mx-2">/</span>
                                    <span className="text-white font-medium">{currentPage.title}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8 lg:p-10">
                    <div className="max-w-5xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
