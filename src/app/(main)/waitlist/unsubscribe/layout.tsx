import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Unsubscribe from Waitlist",
    description: "Unsubscribe from the OctoHub waitlist and stop receiving updates.",
}

export default function UnsubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 