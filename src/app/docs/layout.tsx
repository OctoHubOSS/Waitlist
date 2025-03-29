"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DocCategory } from "@/utils/documentation/markdown";
import { DocSidebar } from "@/components/Layout/Docs/DocSidebar";
import { CategoryDropdown } from "@/components/Layout/Docs/CategoryDropdown";
import { DocBreadcrumb } from "@/components/Layout/Docs/DocBreadcrumb";

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [baseCategory, setBaseCategory] = useState<DocCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/docs/categories');
        const data = await response.json();
        setCategories(data);

        // Find the base category (Getting Started)
        const base = data.find((c: DocCategory) => c.isRootCategory);
        setBaseCategory(base);

        // Set selected category based on path
        const pathParts = pathname.split('/').filter(Boolean);
        if (pathParts.length > 1) {
          setSelectedCategory(pathParts[1]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [pathname]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  // Get current page title for breadcrumbs
  const currentPagePath = pathname.split("/").filter(Boolean);
  const currentSlug = currentPagePath[currentPagePath.length - 1];

  // Find the current page info
  let currentPage;
  if (currentPagePath.length > 2) {
    // Look for page in the specific category
    const category = categories.find((c) =>
      c.pages.some(p => p.slug.includes(`/${currentSlug}`))
    );

    currentPage = category?.pages.find((p) => p.slug.includes(`/${currentSlug}`));
  } else if (currentPagePath.length === 2) {
    // It's a root-level doc (directly under /docs)
    const page = categories
      .flatMap(cat => cat.pages)
      .find(p => p.slug === currentSlug);

    if (page) {
      currentPage = page;
    }
  }

  // Find current root category
  const currentRootCategory = categories.find(cat =>
    selectedCategory === cat.title || pathname.includes(`/docs/${cat.title.toLowerCase().replace(/\s+/g, '-')}`)
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header with dropdown */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-github-border sticky top-0 bg-github-dark z-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-800 focus:outline-none"
        >
          <Menu size={24} />
        </button>

        <CategoryDropdown
          rootCategories={categories}
          currentRootCategory={currentRootCategory}
          onSelectCategory={setSelectedCategory}
          isOpen={false}
          setIsOpen={() => { }}
          isMobile={true}
        />

        <div className="w-10"></div> {/* Empty div to balance the layout */}
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 
          w-4/5 md:w-72 lg:w-80 bg-github-dark 
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 transition-transform duration-200 ease-in-out
          overflow-y-auto md:border-r border-github-border
          md:h-screen md:sticky md:top-0
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <CategoryDropdown
              rootCategories={categories}
              currentRootCategory={currentRootCategory}
              onSelectCategory={setSelectedCategory}
              isOpen={false}
              setIsOpen={() => { }}
            />

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-800 md:hidden focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <DocSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            baseCategory={baseCategory}
            onCategorySelect={setSelectedCategory}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onSidebarClose={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      {/* Main content - Modified to be full width */}
      <main className="flex-1 bg-github-dark w-full">
        {/* Breadcrumb navigation */}
        <DocBreadcrumb currentPage={currentPage} />

        <div className="p-4 md:p-6 w-full max-w-none">{children}</div>
      </main>
    </div>
  );
}
