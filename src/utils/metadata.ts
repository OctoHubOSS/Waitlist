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
  imageUrl = "/logo.webp",
  keywords = [],
  canonicalUrl,
  metadataBase = process.env.NEXT_PUBLIC_APP_URL || "https://octohub.dev",
}: GenerateMetadataParams): Metadata {
  // Base app name
  const siteName = "OctoHub";

  // Create the full title
  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - GitHub Discovery Tool`;

  // Default description
  const metaDescription =
    description ||
    "Discover GitHub profiles, organizations, and repositories easily";

  return {
    metadataBase: new URL(metadataBase),
    title: fullTitle,
    description: metaDescription,
    keywords: ["GitHub", "repository search", "developer tools", ...keywords],
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
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
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

export function generateNotFoundMetadata(): Metadata {
  return generateMetadata({
    title: "Not Found",
    description: "We were unable to locate whatever you were looking for!",
    keywords: ["Not Found", "404"],
  });
}

/**
 * Generate repository-specific metadata
 */
export function generateRepoMetadata(
  repoName: string,
  ownerName: string,
  description?: string,
): Metadata {
  return generateMetadata({
    title: `${ownerName}/${repoName}`,
    description: description || `Explore ${ownerName}/${repoName} on OctoHub`,
    keywords: [repoName, ownerName, "GitHub repository"],
    canonicalUrl: `/repo/${ownerName}/${repoName}`,
  });
}

/**
 * Generate waitlist-specific metadata
 */
export function generateWaitlistMetadata(): Metadata {
  return generateMetadata({
    title: "Join the Waitlist",
    description: "Be among the first to experience OctoHub - Join our exclusive waitlist for early access to the next generation of code collaboration.",
    keywords: ["waitlist", "early access", "beta", "GitHub collaboration"],
    canonicalUrl: "/waitlist",
  });
}

/**
 * Generate unsubscribe-specific metadata
 */
export function generateUnsubscribeMetadata(): Metadata {
  return generateMetadata({
    title: "Unsubscribe",
    description: "Manage your OctoHub waitlist subscription preferences.",
    keywords: ["unsubscribe", "waitlist", "preferences"],
    canonicalUrl: "/waitlist/unsubscribe",
  });
}

/**
 * Generate FAQ-specific metadata
 */
export function generateFAQMetadata(): Metadata {
  return generateMetadata({
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about OctoHub, our features, and how we're revolutionizing code collaboration.",
    keywords: ["FAQ", "questions", "help", "support", "GitHub collaboration"],
    canonicalUrl: "/faq",
  });
}

/**
 * Generate privacy policy-specific metadata
 */
export function generatePrivacyMetadata(): Metadata {
  return generateMetadata({
    title: "Privacy Policy",
    description: "Learn about how OctoHub collects, uses, and protects your data.",
    keywords: ["privacy", "data protection", "terms", "policy"],
    canonicalUrl: "/privacy",
  });
}

/**
 * Generate terms-specific metadata
 */
export function generateTermsMetadata(): Metadata {
  return generateMetadata({
    title: "Terms of Service",
    description: "Read about the terms and conditions for using OctoHub's services.",
    keywords: ["terms", "conditions", "legal", "service agreement"],
    canonicalUrl: "/terms",
  });
}

/**
 * Generate coming soon-specific metadata
 */
export function generateComingSoonMetadata(): Metadata {
  return generateMetadata({
    title: "Coming Soon",
    description: "Get ready for OctoHub - The next generation of code collaboration is just around the corner. Join our waitlist to be the first to know when we launch!",
    keywords: ["coming soon", "launch", "early access", "GitHub collaboration", "waitlist"],
    canonicalUrl: "/coming-soon",
  });
}
