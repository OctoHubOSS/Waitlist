import React from "react";
import { IconType } from "react-icons";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4">
                {icon}
            </div>

            <h3 className="text-xl font-semibold mb-2">{title}</h3>

            <p className="text-gray-600 dark:text-gray-300">
                {description}
            </p>
        </div>
    );
}
