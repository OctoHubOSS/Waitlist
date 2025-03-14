import Link from "next/link";
import React from "react";
import { FeaturesList } from "@/components/Features/FeaturesList";

interface AboutLayoutProps {
    children?: React.ReactNode;
    showFeatures?: boolean;
}

export default function AboutLayout({ children, showFeatures = true }: AboutLayoutProps) {
    return (
        <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Supercharge Your <span className="text-purple-600 dark:text-purple-400">Code Search</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                OctoSearch helps developers find the code they need quickly and efficiently with advanced search capabilities for repositories.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/search"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
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
            <div className="max-w-4xl mx-auto py-12 prose dark:prose-invert max-w-none">
                {children}
            </div>

            {/* Features Section */}
            {showFeatures && (
                <section id="features" className="py-12 md:py-20 bg-gray-50 dark:bg-gray-900 -mx-4 px-4">
                    <div className="max-w-6xl mx-auto">
                        <FeaturesList />
                    </div>
                </section>
            )}

            {/* Footer Section */}
            <div className="max-w-4xl mx-auto mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 py-8">
                    <Link href="/legal/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
                        Terms of Service
                    </Link>
                    <Link href="/legal/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
                        Privacy Policy
                    </Link>
                    <span className="ml-auto">
                        © {new Date().getFullYear()} OctoSearch
                    </span>
                </div>
            </div>
        </div>
    );
}
