'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Bell, Settings } from 'lucide-react';

export function DashboardNav() {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Account', href: '/dashboard/account', icon: User },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-github-dark-secondary min-h-screen p-4">
            <nav className="space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md ${isActive
                                ? 'bg-github-dark text-white'
                                : 'text-github-text-secondary hover:bg-github-dark hover:text-white'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 