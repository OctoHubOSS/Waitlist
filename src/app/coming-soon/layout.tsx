import "@/app/globals.css";
import { generateComingSoonMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = generateComingSoonMetadata();

export default function ComingSoonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-github-dark">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #374151',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {children}
        </div>
    );
} 