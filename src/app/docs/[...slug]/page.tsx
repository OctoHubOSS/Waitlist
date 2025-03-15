import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs } from '@/utils/markdown';
import MarkdownContent from '@/components/Docs/MarkdownContent';

// Generate static paths at build time
export async function generateStaticParams() {
    const docs = await getAllDocs();

    return docs.map(doc => {
        const slugParts = doc.slug.split('/');
        return { slug: slugParts };
    });
}

// Page component
export default async function DocPage({
    params,
}: {
    params: { slug?: string[] };
}) {
    try {
        // Await the params object before using its properties
        const awaitedParams = await params;

        // Join slug parts to form the complete slug path
        const fullSlug: any = awaitedParams.slug?.join('/');

        // Fetch the document
        const doc = await getDocBySlug(fullSlug);

        // If content could not be found
        if (!doc) {
            return notFound();
        }

        return (
            <article className="pb-16 w-full">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{doc.metadata.title}</h1>
                    {doc.metadata.description && (
                        <p className="text-gray-400 text-lg">{doc.metadata.description}</p>
                    )}
                </header>

                <MarkdownContent content={doc.content} />
            </article>
        );
    } catch (error) {
        console.error("Error loading markdown document:", error);
        return notFound();
    }
}
