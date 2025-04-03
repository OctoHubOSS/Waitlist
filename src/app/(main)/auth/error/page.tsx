'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessages: Record<string, string> = {
        'Configuration': 'There is a problem with the server configuration.',
        'AccessDenied': 'You do not have permission to sign in.',
        'Verification': 'The verification token has expired or has already been used.',
        'Default': 'An error occurred while trying to sign in.',
    };

    const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-github-dark to-github-dark-secondary py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                className="max-w-md w-full space-y-8 bg-github-dark/50 backdrop-blur-sm p-8 rounded-xl border border-github-dark-secondary shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-4">
                        <Image
                            src="/logo.webp"
                            alt="OctoHub Logo"
                            fill
                            className="object-contain rounded-lg"
                            priority
                        />
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        {errorMessage}
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <Link
                        href="/auth/login"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent transition-colors"
                    >
                        Try signing in again
                    </Link>
                    <Link
                        href="/"
                        className="w-full flex justify-center py-2.5 px-4 border border-github-border rounded-lg shadow-sm text-sm font-medium text-github-text-secondary hover:bg-github-dark-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent transition-colors"
                    >
                        Return to home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
} 