'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface ScrollLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function ScrollLink({ href, children, className, onClick }: ScrollLinkProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isSectionLink = href.startsWith('/#');

    if (isHomePage && isSectionLink) {
        const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            const targetId = href.replace('/#', '');
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            onClick?.();
        };

        return (
            <a href={href} onClick={handleClick} className={className}>
                {children}
            </a>
        );
    }

    return (
        <Link href={href} className={className} onClick={onClick}>
            {children}
        </Link>
    );
} 