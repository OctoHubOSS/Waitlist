'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TbLoader2 } from "react-icons/tb";
import { HiExclamationCircle } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [countdown, setCountdown] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!email) {
            router.push('/auth/register');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsRedirecting(true);
                    router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, router]);

    const handleResendCode = async () => {
        if (!email) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification code');
            }

            // Reset countdown
            setCountdown(5);
        } catch (err: any) {
            setError(err.message || 'Failed to resend verification code');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Check your email
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        We've sent a verification code to{" "}
                        <span className="font-medium text-white">{email}</span>
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-500/10 p-4 border border-red-500/20"
                    >
                        <div className="flex items-center space-x-2">
                            <HiExclamationCircle className="w-5 h-5 text-red-500" />
                            <div className="text-sm text-red-500">{error}</div>
                        </div>
                    </motion.div>
                )}

                <div className="text-center">
                    <p className="text-sm text-github-text-secondary">
                        Redirecting to verification page in {countdown} seconds...
                    </p>
                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading || countdown > 0}
                        className="mt-4 text-sm text-github-link hover:text-github-link-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <TbLoader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Resending...
                            </div>
                        ) : (
                            "Didn't receive the code? Click to resend"
                        )}
                    </button>
                </div>

                {isRedirecting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm text-github-text-secondary"
                    >
                        Redirecting...
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
} 