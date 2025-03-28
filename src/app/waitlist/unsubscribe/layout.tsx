import { Metadata } from "next";
import { generateUnsubscribeMetadata } from "@/utils/metadata";

export const metadata: Metadata = generateUnsubscribeMetadata();

export default function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 