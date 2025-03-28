import { Metadata } from "next";
import { generateWaitlistMetadata } from "@/utils/metadata";

export const metadata: Metadata = generateWaitlistMetadata();

export default function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 