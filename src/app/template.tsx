'use client';

import Navigation from "@/components/Static/Navigation";
import Footer from "@/components/Static/Footer";
import { usePathname } from 'next/navigation';

export default function Template({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Don't render navigation and footer for the coming-soon page
    if (pathname === '/coming-soon') {
        return children;
    }

    if (pathname === '/waitlist/subscribe') {
        return children;
    }

    if (pathname === '/waitlist/unsubscribe') {
        return children;
    }

    return (
        <>
            <Navigation />
            <div className="flex flex-col min-h-screen">
                <main className="w-full flex-grow mt-20">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
} 