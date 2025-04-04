'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Bell, Settings, FileText, Code, LogOut, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

function UserAvatar({ name }: { name: string | null | undefined }) {
    const initials = name ? name.split(' ').map(n => n[0]).join('') : 'US';

    return (
        <div className="w-8 h-8 rounded-full bg-github-accent text-white flex items-center justify-center uppercase">
            {initials}
        </div>
    );
}

export function DashboardNav() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { data: session } = useSession();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const sidebarRef = useRef(null);

    // Handle responsive view
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Account', href: '/dashboard/account', icon: User },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { name: 'Feature Requests', href: '/dashboard/feature-requests', icon: FileText },
        { name: 'API Access', href: '/dashboard/api', icon: Code },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    // Mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Sidebar for desktop
    const DesktopSidebar = () => {
        return (
            <div
                className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-github-dark-secondary min-h-screen p-4 transition-all duration-300 relative`}
                ref={sidebarRef}
            >
                {/* Logo and Collapse Button */}
                <div className="flex items-center mb-8 pl-3 justify-between">
                    <div className="flex items-center">
                        <Image
                            src="/logo.webp"
                            alt="OctoHub"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        {!isSidebarCollapsed && <span className="ml-2 text-white font-bold text-xl">OctoHub</span>}
                    </div>
                    <button onClick={toggleSidebarCollapse} className="text-github-text-secondary hover:text-white">
                        {isSidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-github-dark text-white'
                                    : 'text-github-text-secondary hover:bg-github-dark hover:text-white'
                                    } transition-colors`}
                            >
                                <item.icon className="h-5 w-5" />
                                {!isSidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info and Sign Out */}
                <div className="absolute bottom-0 left-0 w-full border-t border-github-dark pt-4">
                    {session?.user && (
                        <div className={`mb-4 pl-3 ${isSidebarCollapsed && 'items-center'}`}>
                            <div className="flex items-center space-x-2">
                                <UserAvatar name={session.user.name} />
                                {!isSidebarCollapsed && <div className="text-white font-semibold">{session.user.name}</div>}
                            </div>
                            {!isSidebarCollapsed && <div className="text-sm text-github-text-secondary">{session.user.email}</div>}
                        </div>
                    )}

                    {/* Sign Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md text-github-text-secondary hover:bg-github-dark hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        {!isSidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>
        );
    };

    // Mobile header with menu button
    const MobileHeader = () => (
        <div className="lg:hidden sticky top-0 z-10 bg-github-dark-secondary p-4 flex items-center justify-between">
            <div className="flex items-center">
                <Image
                    src="/logo.webp"
                    alt="OctoHub"
                    width={28}
                    height={28}
                    className="rounded-lg"
                />
                <span className="ml-2 text-white font-bold text-lg">OctoHub</span>
            </div>
            <div className="relative">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md text-github-text-secondary hover:text-white hover:bg-github-dark transition-colors"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-xl z-10 bg-github-dark-secondary divide-y divide-gray-700"
                        >
                            <nav className="py-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:bg-github-dark hover:text-white"
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="py-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center px-4 py-2 text-sm text-github-text-secondary hover:bg-github-dark hover:text-red-400 w-full text-left"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <>
            {isMobile ? (
                <MobileHeader />
            ) : (
                <DesktopSidebar />
            )}
        </>
    );
}