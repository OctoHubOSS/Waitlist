import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateDocsMetadata } from "@/utils/metadata";
import { getDocBySlug, getAllDocs } from "@/utils/documentation/markdown";
import MarkdownContent from "@/components/Docs/MarkdownContent";

// Generate static paths at build time
export async function generateStaticParams() {
    const docs = await getAllDocs();

    return docs.map((doc) => {
        const slugParts = doc.slug.split("/");
        return { slug: slugParts };
    });
}

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    return generateDocsMetadata(resolvedParams.slug);
}

// Page component
export default async function DocPage({ params }: PageProps) {
    try {
        // Await the params object
        const resolvedParams = await params;
        const { slug } = resolvedParams;

        if (!slug || slug.length === 0) {
            notFound();
        }

        // Join slug parts to form the complete slug path
        const fullSlug = slug.join("/");

        // Fetch the document
        const doc = await getDocBySlug(fullSlug);

        // If content could not be found
        if (!doc) {
            return notFound();
        }

        return (
            <article className="w-full px-0">
                <header className="mb-2 px-0">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {doc.data.title}
                    </h1>
                    {doc.data.description && (
                        <p className="text-gray-400 text-lg">{doc.data.description}</p>
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
