import Link from "next/link";
import React from "react";

interface AboutLayoutProps {
  children?: React.ReactNode;
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <div className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Supercharge Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-github-accent via-github-link to-github-accent-hover">
                  Development Experience
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                OctoHub is a powerful, feature-rich code hosting and collaboration platform designed to enhance software development workflows. Built as a modern alternative to traditional version control platforms, OctoHub provides advanced tools for developers, teams, and organizations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/search"
                  className="px-6 py-3 bg-github-accent hover:bg-github-accent-hover text-white rounded-md font-medium transition-colors"
                >
                  Try It Now
                </Link>
                <Link
                  href="#features"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto py-12 prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
