import "./globals.css";
import { Metadata } from "next";
import { absoluteUrl } from "@/utils/absoluteUrl";

export const metadata: Metadata = {
  title: {
    template: '%s | OctoHub',
    default: 'OctoHub'
  },
  description: "We're re-imagining how developers collaborate, share, and build software together. A modern platform for modern teams.",
  openGraph: {
    url: "https://octohub.dev",
    title: {
      template: '%s | OctoHub',
      default: 'OctoHub'
    },
    description: "We're re-imagining how developers collaborate, share, and build software together. A modern platform for modern teams.",
    images: "/banner.png",
    siteName: "OctoHub",
  },
  twitter: {
    card: 'summary_large_image',
    creator: "@TheRealToxicDev",
    title: {
      template: '%s | OctoHub',
      default: 'OctoHub'
    },
    description: "We're re-imagining how developers collaborate, share, and build software together. A modern platform for modern teams.",
    images: "/banner.png",
  },
  metadataBase: absoluteUrl()
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="dark">
        <body className="min-h-screen bg-gradient-to-b from-github-dark to-github-dark-secondary">
          {children}
        </body>
      </html>
  );
}
