import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join the Waitlist",
    description: "Be among the first to experience OctoHub - Join our exclusive waitlist for early access to the next generation of code collaboration.",
}

export default function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
} 