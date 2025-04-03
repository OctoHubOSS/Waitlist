'use client';

import { motion } from "framer-motion";

interface LegalLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function LegalLayout({ children, title, description }: LegalLayoutProps) {
    return (
        <div className="min-h-screen bg-github-dark">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    // Use a larger max-width and add padding on larger screens
                    className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto lg:px-8 xl:px-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
                    <p className="text-github-text-secondary mb-8">{description}</p>
                    <div className="prose prose-lg prose-invert max-w-none">
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}