import { Metadata } from "next";

interface GenerateMetadataParams {
  title?: string;
  description?: string;
  imageUrl?: string;
  keywords?: string[];
  canonicalUrl?: string;
  metadataBase?: string;
}

/**
 * Generates consistent metadata for pages throughout the application
 */
export function generateMetadata({
  title,
  description,
  imageUrl = "/og-image.png",
  keywords = [],
  canonicalUrl,
  metadataBase = process.env.NEXT_PUBLIC_APP_URL || "https://octosearch.vercel.app",
}: GenerateMetadataParams): Metadata {
  // Base app name
  const siteName = "OctoSearch";
  
  // Create the full title
  const fullTitle = title 
    ? `${title} | ${siteName}`
    : `${siteName} - GitHub Discovery Tool`;
  
  // Default description
  const metaDescription = description || 
    "Discover GitHub profiles, organizations, and repositories easily";
  
  return {
    metadataBase: new URL(metadataBase),
    title: fullTitle,
    description: metaDescription,
    keywords: [
      "GitHub", 
      "repository search", 
      "developer tools",
      ...keywords
    ],
    icons: {
      icon: "/logo.webp",
    },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      siteName: siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
  };
}

/**
 * Generate repository-specific metadata
 */
export function generateRepoMetadata(repoName: string, ownerName: string, description?: string): Metadata {
  return generateMetadata({
    title: `${ownerName}/${repoName}`,
    description: description || `Explore ${ownerName}/${repoName} on OctoSearch`,
    keywords: [repoName, ownerName, "GitHub repository"],
    canonicalUrl: `/repo/${ownerName}/${repoName}`,
  });
}