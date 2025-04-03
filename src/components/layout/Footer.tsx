'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
    {
        name: 'GitHub',
        href: 'https://github.com/OctoHubOSS',
        icon: Github,
    },
    {
        name: 'Twitter',
        href: 'https://twitter.com/HeyOctoHub',
        icon: Twitter,
    },
    {
        name: 'Discord',
        href: 'https://discord.gg/EvgtRgVEed',
        icon: MessageSquare,
    },
];

const footerLinks = [
    {
        name: 'Privacy',
        href: '/legal/privacy',
    },
    {
        name: 'Terms',
        href: '/legal/terms',
    },
    {
        name: 'Security',
        href: '/legal/security',
    },
];

export default function Footer() {
    return (
        <footer className="bg-github-dark/80 backdrop-blur-sm border-t border-github-dark-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col space-y-6">
                    {/* Brand Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center group">
                                <Image
                                    src="/logo.webp"
                                    alt="OctoHub Logo"
                                    width={32}
                                    height={32}
                                    className="rounded-lg transition-transform group-hover:scale-110"
                                />
                                <span className="ml-2 text-xl font-bold text-white group-hover:text-github-accent transition-colors">
                                    OctoHub
                                </span>
                            </Link>
                            <p className="text-github-text-secondary text-sm">
                                © {new Date().getFullYear()} Infinity Development
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            {socialLinks.map((item) => (
                                <motion.a
                                    key={item.name}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-github-text-secondary hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon className="h-5 w-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        {footerLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-github-text-secondary hover:text-white transition-colors text-sm"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
} 