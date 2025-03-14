import { Metadata } from "next";
import { generateNotFoundMetadata } from "@/utils/metadata";
import NotFoundLayout from "@/components/Layout/NotFound";

export const metadata: Metadata = generateNotFoundMetadata();

export default function NotFoundPage({ children }: { children: React.ReactNode }) {
    return <NotFoundLayout children={children} />;
}
