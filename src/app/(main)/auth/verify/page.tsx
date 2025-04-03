'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamationCircle, HiMail, HiCheckCircle, HiClock, HiKey } from 'react-icons/hi';
import Link from 'next/link';
import { TbLoader2 } from "react-icons/tb";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const type = searchParams.get('type') || 'email';
    const email = searchParams.get('email');

    const [manualCode, setManualCode] = useState('');
    const [manualEmail, setManualEmail] = useState(email || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [verificationFailed, setVerificationFailed] = useState(false);
    const [isValidatingEmail, setIsValidatingEmail] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Countdown timer for resend button
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown]);

    useEffect(() => {
        if (code) {
            setVerificationCode(code);
            handleVerification();
        }
    }, [code]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (success && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (success) {
            router.push('/auth/login?verified=true');
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [success, countdown, router]);

    const validateEmail = async (email: string) => {
        setIsValidatingEmail(true);
        try {
            const response = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(email)}`);
            const data = await response.json();
            return response.ok;
        } catch (error) {
            return false;
        } finally {
            setIsValidatingEmail(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        const targetEmail = email || manualEmail;
        if (!targetEmail) return;

        setIsResending(true);
        setResendSuccess(false);
        setError(null);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail, type })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification email');
            }

            setResendSuccess(true);
            setCountdown(60);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to resend verification email');
        } finally {
            setIsResending(false);
        }
    };

    const handleVerification = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: verificationCode,
                    email,
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If we can't parse the response as JSON, use the status text
                throw new Error(response.statusText || 'Failed to verify email');
            }

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to verify email');
            }

            // Only set success and redirect if we get a successful response
            if (data.success) {
                setSuccess(true);
                if (data.redirectTo) {
                    router.push(data.redirectTo);
                }
            } else {
                throw new Error(data.message || data.error || 'Verification failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        async function handleVerification() {
            if (!code || !email) return;

            if (isVerified) {
                router.push('/auth/login?verified=true');
                return;
            }

            setIsVerifying(true);
            setError(null);
            setVerificationFailed(false);

            try {
                const verifyResponse = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        email,
                    }),
                });

                let verifyData;
                try {
                    verifyData = await verifyResponse.json();
                } catch (e) {
                    throw new Error(verifyResponse.statusText || 'Failed to verify email');
                }

                if (!verifyResponse.ok) {
                    throw new Error(verifyData.message || verifyData.error || 'Verification failed');
                }

                if (verifyData.success) {
                    setIsVerified(true);
                    if (verifyData.redirectTo) {
                        router.push(verifyData.redirectTo);
                    }
                } else {
                    throw new Error(verifyData.message || verifyData.error || 'Verification failed');
                }
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Verification failed');
                setVerificationFailed(true);
            } finally {
                setIsVerifying(false);
            }
        }

        if (code) {
            handleVerification();
        }
    }, [code, type, email, router, isVerified]);

    const handleManualVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode || !manualEmail) return;

        if (isVerified) {
            router.push('/auth/login?verified=true');
            return;
        }

        setIsVerifying(true);
        setError(null);
        setVerificationFailed(false);

        try {
            const verifyResponse = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: manualCode,
                    email: manualEmail,
                }),
            });

            let verifyData;
            try {
                verifyData = await verifyResponse.json();
            } catch (e) {
                throw new Error(verifyResponse.statusText || 'Failed to verify email');
            }

            if (!verifyResponse.ok) {
                throw new Error(verifyData.message || verifyData.error || 'Verification failed');
            }

            if (verifyData.success) {
                setIsVerified(true);
                if (verifyData.redirectTo) {
                    router.push(verifyData.redirectTo);
                }
            } else {
                throw new Error(verifyData.message || verifyData.error || 'Verification failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Verification failed');
            setVerificationFailed(true);
        } finally {
            setIsVerifying(false);
        }
    };

    if (isVerified) {
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
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <HiCheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white text-center">
                            Email Verified
                        </h2>
                        <p className="mt-2 text-center text-sm text-github-text-secondary">
                            Your email has been successfully verified.
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm text-github-link hover:text-github-link-hover transition-colors"
                        >
                            Return to login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

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
                    <AnimatePresence mode="wait">
                        {isVerifying ? (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4"
                            >
                                <TbLoader2 className="w-8 h-8 text-red-500 animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="not-verifying"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-16 h-16 bg-github-accent/10 rounded-full flex items-center justify-center mb-4"
                            >
                                <HiMail className="w-8 h-8 text-github-accent" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        {code ? 'Verifying...' : 'Enter Verification Code'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        {code
                            ? 'Please wait while we verify your email.'
                            : 'Please enter the verification code sent to your email.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <HiExclamationCircle className="w-5 h-5 text-red-500" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {resendSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-500" />
                                <p className="text-sm text-green-500">Verification email sent successfully</p>
                            </div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                        >
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-500" />
                                <div className="text-sm text-green-500">
                                    Email verified successfully! Redirecting to login...
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!code && (
                    <form onSubmit={handleManualVerification} className="mt-8 space-y-6">
                        {!email && (
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-1">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={manualEmail}
                                    onChange={(e) => setManualEmail(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-github-dark-secondary bg-github-dark/30 rounded-lg placeholder-github-text-secondary text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                                    placeholder="Enter your email address"
                                    disabled={isVerifying || isValidatingEmail}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Verification Code
                            </label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-github-dark-secondary bg-github-dark/30 rounded-lg placeholder-github-text-secondary text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                                placeholder="Enter verification code"
                                disabled={isVerifying || isValidatingEmail}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="submit"
                                disabled={isVerifying || isValidatingEmail || !manualCode || (!email && !manualEmail)}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isVerifying ? (
                                    <div className="flex items-center">
                                        <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Verifying...
                                    </div>
                                ) : isValidatingEmail ? (
                                    <div className="flex items-center">
                                        <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Validating...
                                    </div>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={handleResend}
                        disabled={countdown > 0}
                        className="text-sm text-github-link hover:text-github-link-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {countdown > 0 ? (
                            <>
                                <HiClock className="h-4 w-4" />
                                <span>Resend in {countdown}s</span>
                            </>
                        ) : (
                            'Resend verification email'
                        )}
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/auth/login"
                        className="text-sm text-github-link hover:text-github-link-hover transition-colors"
                    >
                        Return to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
} 