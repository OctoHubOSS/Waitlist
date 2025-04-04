'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, ClipboardList, Bell, History } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: string; // Accept icon as a string
    subtitle?: string;
    progress?: number;
    href?: string;
    tooltip?: string;
    loading?: boolean;
}

// Map of icon names to components
const iconMap: Record<string, React.FC<{ className?: string }>> = {
    TrendingUp,
    ClipboardList,
    Bell,
    History,
};

export function StatsCard({ 
    title, 
    value, 
    icon, 
    subtitle, 
    progress, 
    href,
    tooltip,
    loading = false
}: StatsCardProps) {
    const IconComponent = iconMap[icon]; // Resolve the icon component from the map

    const card = (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-github-dark-secondary rounded-xl p-4"
            title={tooltip}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-github-text-secondary">{title}</p>
                    {loading ? (
                        <div className="mt-1 h-6 w-12 bg-github-dark rounded animate-pulse"></div>
                    ) : (
                        <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                    )}
                </div>
                {IconComponent && (
                    <div className="p-2 bg-github-accent/20 rounded-full">
                        <IconComponent className="h-5 w-5 text-github-accent" />
                    </div>
                )}
            </div>
            
            {progress !== undefined ? (
                <div className="mt-3">
                    <div className="h-1.5 bg-github-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-github-accent"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                    {subtitle && (
                        <p className="mt-2 text-xs text-github-text-secondary">
                            {subtitle}
                        </p>
                    )}
                </div>
            ) : (
                subtitle && (
                    <p className="mt-2 text-sm text-github-text-secondary">
                        {subtitle}
                    </p>
                )
            )}
        </motion.div>
    );

    if (href) {
        return <Link href={href}>{card}</Link>;
    }

    return card;
}