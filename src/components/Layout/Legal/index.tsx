"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export default function LegalLayout({
  children,
  title,
  lastUpdated,
}: LegalLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);

  // Extract headings from the content when mounted
  useEffect(() => {
    // Small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      const contentDiv = document.querySelector(".prose");
      if (contentDiv) {
        const headingElements = contentDiv.querySelectorAll("h2, h3");
        const extractedHeadings = Array.from(headingElements).map(
          (heading) => ({
            id:
              heading.id ||
              heading.textContent?.toLowerCase().replace(/[^\w]+/g, "-") ||
              "",
            text: heading.textContent || "",
          }),
        );

        // Add IDs to headings if they don't have one
        headingElements.forEach((heading) => {
          if (!heading.id) {
            heading.id =
              heading.textContent?.toLowerCase().replace(/[^\w]+/g, "-") || "";
          }
        });

        setHeadings(extractedHeadings);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [children]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10">
        <Link
          href="/"
          className="text-github-link hover:text-github-link-hover mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-3 mt-6">{title}</h1>

        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Last Updated On: <span className="font-medium">{lastUpdated}</span>
          </p>
        )}

        {/* Table of Contents Dropdown */}
        {headings.length > 0 && (
          <div className="mt-4 border border-github-border rounded-md bg-gradient-to-b from-github-dark to-github-dark-secondary shadow-sm">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-between items-center w-full px-5 py-3 text-left font-medium rounded-t-md transition-colors hover:bg-github-dark-secondary"
            >
              <span className="text-github-text">Table of Contents</span>
              {isOpen ? (
                <FaChevronUp className="w-4 h-4 text-github-text-secondary" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-github-text-secondary" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 py-3 border-t border-github-border bg-github-dark-secondary rounded-b-md shadow-inner">
                <ul className="space-y-1.5">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <button
                        className={`text-left w-full px-2 py-1.5 rounded transition-colors hover:bg-github-dark hover:text-github-link ${
                          heading.text.startsWith("   ")
                            ? "ml-4 text-sm text-github-text-secondary"
                            : "font-medium text-github-text"
                        }`}
                        onClick={() => scrollToHeading(heading.id)}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none legal-content">
        {children}
      </div>
    </div>
  );
}
