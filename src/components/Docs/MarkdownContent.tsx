"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import DocsContent from '../Layout/Docs/DocsContent';

interface MarkdownContentProps {
    content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
    const router = useRouter();

    // Handle internal link navigation
    const handleClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.tagName === 'A' ? target : target.closest('a');

        if (anchor && !anchor.getAttribute('href')?.startsWith('http') &&
            !anchor.getAttribute('target')) {
            e.preventDefault();
            const href = anchor.getAttribute('href');
            if (href) {
                router.push(href);
            }
        }
    };

    return (
        <div onClick={handleClick} className="docs-content w-full">
            <DocsContent content={content} />
        </div>
    );
}
