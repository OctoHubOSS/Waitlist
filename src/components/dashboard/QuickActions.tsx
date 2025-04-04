'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Github, User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface QuickActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    external?: boolean;
}

function QuickActionCard({
    title,
    description,
    buttonText,
    onClick,
    href,
    icon,
    external = false
}: QuickActionCardProps) {
    const content = (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-github-dark-secondary rounded-xl p-4"
        >
            <div className="flex items-start mb-2">
                <div className="p-2 bg-github-accent/20 rounded-full mr-3 mt-1">
                    {icon || <MessageCircle className="h-5 w-5 text-github-accent" />}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
                    <p className="text-sm text-github-text-secondary mb-4">
                        {description}
                    </p>
                </div>
            </div>
            {onClick ? (
                <button
                    onClick={onClick}
                    className="w-full px-4 py-2 bg-github-accent text-white text-sm rounded-lg hover:bg-github-accent/90 transition-colors flex items-center justify-center"
                >
                    {buttonText}
                    {external && <ArrowUpRight className="h-4 w-4 ml-1" />}
                </button>
            ) : (
                <div className="w-full px-4 py-2 bg-github-accent text-white text-sm rounded-lg hover:bg-github-accent/90 transition-colors flex items-center justify-center">
                    {buttonText}
                    {external && <ArrowUpRight className="h-4 w-4 ml-1" />}
                </div>
            )}
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block" target={external ? "_blank" : undefined}>
                {content}
            </Link>
        );
    }

    return content;
}

export function QuickActions() {
    return (
        <div className="space-y-4">
            <QuickActionCard
                title="Submit Feature Request"
                description="Have an idea for improving OctoHub? Share it with us!"
                buttonText="New Feature Request"
                href="/dashboard/feature-requests/new"
                icon={<MessageCircle className="h-5 w-5 text-github-accent" />}
            />

            <QuickActionCard
                title="Join the Community"
                description="Connect with other users and share your experiences"
                buttonText="Join Discord"
                href="https://discord.gg/octohub"
                icon={<Github className="h-5 w-5 text-github-accent" />}
                external={true}
            />
            
            <QuickActionCard
                title="Update Your Profile"
                description="Manage your account settings and preferences"
                buttonText="View Profile"
                href="/dashboard/account"
                icon={<User className="h-5 w-5 text-github-accent" />}
            />
        </div>
    );
}