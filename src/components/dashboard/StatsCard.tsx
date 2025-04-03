import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtitle?: string;
    progress?: number;
}

export function StatsCard({ title, value, icon: Icon, subtitle, progress }: StatsCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-github-dark-secondary rounded-xl p-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-github-text-secondary">{title}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                </div>
                <div className="p-2 bg-github-accent/20 rounded-full">
                    <Icon className="h-5 w-5 text-github-accent" />
                </div>
            </div>
            {progress !== undefined ? (
                <div className="mt-3">
                    <div className="h-1.5 bg-github-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-github-accent"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
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
} 