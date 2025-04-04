'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Github, Twitter, MessageSquare, User, Settings, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollLink from './ScrollLink';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            setIsUserMenuOpen(false);
        }
    }, [status]);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Waitlist', href: '/waitlist/subscribe' },
        { name: 'Features', href: '/#features' },
        { name: 'FAQ', href: '/#faq' },
    ];

    const userMenuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Account', href: '/dashboard/account', icon: User },
        { name: 'Sign Out', onClick: () => signOut(), icon: LogOut },
    ];

    const isActive = (path: string) => pathname === path;

    const UserAvatar = ({ className = "" }: { className?: string }) => {
        if (imgError || !session?.user?.image) {
            return (
                <div className={`flex items-center justify-center rounded-full bg-github-accent/20 text-github-accent font-medium ${className}`}>
                    {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
            );
        }

        return (
            <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className={`rounded-full ${className}`}
                onError={() => setImgError(true)}
            />
        );
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-github-dark/95 backdrop-blur-md shadow-lg border-b border-github-dark-secondary' : 'bg-github-dark/80 backdrop-blur-sm'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group">
                        <Image
                            src="/logo.webp"
                            alt="OctoHub Logo"
                            width={40}
                            height={40}
                            className="rounded-lg transition-transform group-hover:scale-110 group-hover:rotate-6"
                        />
                        <span className="ml-2 text-xl font-bold text-white group-hover:text-github-accent transition-colors">
                            OctoHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <ScrollLink
                                key={item.name}
                                href={item.href}
                                className={`text-github-text-secondary hover:text-white transition-colors ${isActive(item.href) ? 'text-white font-medium' : ''}`}
                            >
                                {item.name}
                            </ScrollLink>
                        ))}
                        <div className="flex items-center space-x-4">
                            {status === 'authenticated' ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 text-github-text-secondary hover:text-white transition-colors"
                                    >
                                        <UserAvatar className="w-8 h-8 border border-github-dark-secondary shadow" />
                                        <span className="text-sm font-medium">{session.user?.name}</span>
                                        <svg
                                            className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-github-dark border border-github-dark-secondary"
                                            >
                                                <div className="py-1">
                                                    {userMenuItems.map((item) => (
                                                        item.onClick ? (
                                                            <button
                                                                key={item.name}
                                                                onClick={() => {
                                                                    item.onClick();
                                                                    setIsUserMenuOpen(false);
                                                                }}
                                                                className="w-full flex items-center px-4 py-2 text-sm text-github-text-secondary hover:text-white hover:bg-github-dark-secondary transition-colors"
                                                            >
                                                                <item.icon className="h-4 w-4 mr-3" />
                                                                {item.name}
                                                            </button>
                                                        ) : (
                                                            <Link
                                                                key={item.name}
                                                                href={item.href}
                                                                onClick={() => setIsUserMenuOpen(false)}
                                                                className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:text-white hover:bg-github-dark-secondary transition-colors"
                                                            >
                                                                <item.icon className="h-4 w-4 mr-3" />
                                                                {item.name}
                                                            </Link>
                                                        )
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 rounded-md bg-github-accent hover:bg-github-accent/90 text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-github-text-secondary hover:text-white focus:outline-none"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="md:hidden py-4"
                        >
                            <div className="flex flex-col space-y-4">
                                {navigation.map((item) => (
                                    <ScrollLink
                                        key={item.name}
                                        href={item.href}
                                        className={`text-github-text-secondary hover:text-white transition-colors ${isActive(item.href) ? 'text-white font-medium' : ''}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </ScrollLink>
                                ))}
                                {status === 'authenticated' ? (
                                    <div className="flex items-center space-x-2 py-2">
                                        <UserAvatar className="w-8 h-8" />
                                        <span className="text-sm font-medium text-white">{session.user?.name}</span>
                                    </div>
                                ) : (
                                    <Link
                                        href="/auth/login"
                                        className="w-full px-4 py-2 rounded-md bg-github-accent hover:bg-github-accent/90 text-white transition-colors text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                )}
                                {status === 'authenticated' && (
                                    <div className="space-y-2">
                                        {userMenuItems.map((item) => (
                                            item.onClick ? (
                                                <button
                                                    key={item.name}
                                                    onClick={() => {
                                                        item.onClick();
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center px-4 py-2 text-sm text-github-text-secondary hover:text-white hover:bg-github-dark-secondary transition-colors rounded-md"
                                                >
                                                    <item.icon className="h-4 w-4 mr-3" />
                                                    {item.name}
                                                </button>
                                            ) : (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:text-white hover:bg-github-dark-secondary transition-colors rounded-md"
                                                >
                                                    <item.icon className="h-4 w-4 mr-3" />
                                                    {item.name}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}