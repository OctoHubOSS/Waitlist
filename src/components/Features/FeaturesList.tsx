import React from "react";
import { FeatureCard } from "./FeatureCard";
import {
    RiSearchLine,
    RiFileCodeLine,
    RiBrainLine,
    RiFilterLine,
    RiFlashlightLine,
    RiHistoryLine
} from "react-icons/ri";

export function FeaturesList() {
    const features = [
        {
            icon: <RiSearchLine className="w-full h-full" />,
            title: "Advanced Search",
            description: "Find code instantly with powerful search capabilities that understand context and semantics."
        },
        {
            icon: <RiFileCodeLine className="w-full h-full" />,
            title: "Code Intelligence",
            description: "Search not just by text, but by code structure, functions, and patterns across repositories."
        },
        {
            icon: <RiBrainLine className="w-full h-full" />,
            title: "Semantic Understanding",
            description: "Our AI-powered search understands code relationships and functionalities, not just keywords."
        },
        {
            icon: <RiFilterLine className="w-full h-full" />,
            title: "Smart Filters",
            description: "Narrow down results by language, file type, repository, date, and more with intuitive filters."
        },
        {
            icon: <RiFlashlightLine className="w-full h-full" />,
            title: "Blazing Fast",
            description: "Get results in milliseconds, even across massive codebases and multiple repositories."
        },
        {
            icon: <RiHistoryLine className="w-full h-full" />,
            title: "Search History",
            description: "Easily track and revisit your past searches with comprehensive search history."
        }
    ];

    return (
        <div className="py-12">
            <h2 className="text-3xl font-bold mb-12 text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
        </div>
    );
}
