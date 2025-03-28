'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

export default function UnsubscribePage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUnsubscribed, setIsUnsubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (email) {
            setIsLoading(false);
        }
    }, [email]);

    const handleUnsubscribe = async () => {
        if (!email) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/waitlist/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unsubscribe');
            }

            setIsUnsubscribed(true);
            toast.success('Successfully unsubscribed from the waitlist.');
        } catch (error) {
            console.error('Unsubscribe error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to unsubscribe');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-github-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-github-accent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-github-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <motion.div
                className="max-w-md w-full space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-github-dark to-github-dark-secondary flex items-center justify-center backdrop-blur-sm border border-github-border overflow-hidden">
                        <Image
                            src="/logo.webp"
                            alt="OctoHub"
                            width={64}
                            height={64}
                            className="relative z-10"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white">
                        {isUnsubscribed ? 'Unsubscribed' : 'Unsubscribe from Waitlist'}
                    </h1>
                    <p className="text-xl text-github-text-secondary">
                        {isUnsubscribed
                            ? 'You have been successfully unsubscribed from our waitlist.'
                            : `Are you sure you want to unsubscribe ${email ? `(${email})` : ''} from the waitlist?`}
                    </p>
                </div>

                {/* Unsubscribe Form or Confirmation */}
                <motion.div
                    className="mt-8 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {!isUnsubscribed ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2 text-github-text-secondary">
                                <FaEnvelope className="w-5 h-5" />
                                <span>{email}</span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleUnsubscribe}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    <FaCheck className="w-4 h-4" />
                                    {isSubmitting ? 'Unsubscribing...' : 'Confirm Unsubscribe'}
                                </button>
                                <a
                                    href="/"
                                    className="flex-1 px-6 py-3 rounded-lg bg-github-dark-secondary hover:bg-github-dark-secondary/80 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <FaTimes className="w-4 h-4" />
                                    Cancel
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-github-text-secondary mb-4">
                                You can resubscribe at any time by visiting our waitlist page.
                            </p>
                            <a
                                href="/waitlist/subscribe"
                                className="inline-flex items-center px-6 py-3 rounded-lg bg-github-accent hover:bg-github-accent/90 text-white font-medium transition-colors duration-200"
                            >
                                Resubscribe
                            </a>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
} 