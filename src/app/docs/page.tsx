import React from "react";
import Link from "next/link";
import { FaBook, FaRocket, FaCode } from "react-icons/fa";

export default function DocsPage() {
    return (
        <div className="prose prose-invert max-w-screen">
            <h1 className="text-4xl font-bold mb-6 text-white">OctoSearch Documentation</h1>

            <p className="text-lg text-gray-300 mb-8">
                Welcome to the OctoSearch documentation. Find everything you need to start exploring GitHub data efficiently.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                <Link
                    href="/docs/introduction"
                    className="no-underline"
                >
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-github-accent transition-all duration-300 h-full">
                        <div className="flex items-center mb-4">
                            <FaBook className="h-6 w-6 text-github-accent" />
                            <h3 className="text-xl font-semibold ml-3 text-white">Introduction</h3>
                        </div>
                        <p className="text-gray-300">
                            Learn about what OctoSearch is and how it can help you navigate the GitHub ecosystem.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/docs/quick-start"
                    className="no-underline"
                >
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-github-accent transition-all duration-300 h-full">
                        <div className="flex items-center mb-4">
                            <FaRocket className="h-6 w-6 text-github-accent" />
                            <h3 className="text-xl font-semibold ml-3 text-white">Quick Start</h3>
                        </div>
                        <p className="text-gray-300">
                            Get up and running with OctoSearch quickly with our step-by-step guide.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/docs/search-apis"
                    className="no-underline"
                >
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-github-accent transition-all duration-300 h-full">
                        <div className="flex items-center mb-4">
                            <FaCode className="h-6 w-6 text-github-accent" />
                            <h3 className="text-xl font-semibold ml-3 text-white">Search APIs</h3>
                        </div>
                        <p className="text-gray-300">
                            Detailed information about the search APIs and how to use them effectively.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
