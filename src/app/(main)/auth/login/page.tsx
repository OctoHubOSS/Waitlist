'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiLockClosed, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { TbLoader2 } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (verified) {
            setSuccess('Your email has been verified successfully! You can now log in.');
        }
        if (reset) {
            setSuccess('Your password has been reset successfully! You can now log in.');
        }
    }, [verified, reset]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setResendSuccess(false);
        setSuccess(null);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "Please verify your email before logging in") {
                    setUnverifiedEmail(formData.email);
                    setError("Please verify your email before logging in");
                } else {
                    setError(result.error);
                }
            } else {
                router.push(callbackUrl);
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    const handleResendVerification = async () => {
        if (!unverifiedEmail || isResending) return;

        setIsResending(true);
        setResendSuccess(false);
        setError(null);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: unverifiedEmail, type: 'email' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification email');
            }

            setResendSuccess(true);
            setUnverifiedEmail(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to resend verification email');
        } finally {
            setIsResending(false);
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
                    <div className="relative w-20 h-20 mb-4 transition-transform hover:scale-110">
                        <Image
                            src="/logo.webp"
                            alt="OctoHub Logo"
                            fill
                            className="object-contain rounded-lg"
                            priority
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        Or{' '}
                        <Link
                            href="/auth/register"
                            className="text-github-link hover:text-github-link-hover transition-colors"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="rounded-lg bg-red-500/10 p-4 border border-red-500/20"
                        >
                            <div className="flex items-center space-x-2">
                                <HiExclamationCircle className="w-5 h-5 text-red-500" />
                                <div className="text-sm text-red-500">{error}</div>
                            </div>
                            {unverifiedEmail && (
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <HiMail className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-500">Email not verified</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        className="text-sm text-red-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isResending ? (
                                            <div className="flex items-center">
                                                <TbLoader2 className="animate-spin -ml-1 mr-1 h-4 w-4" />
                                                Sending...
                                            </div>
                                        ) : (
                                            "Resend verification"
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {resendSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="rounded-lg bg-green-500/10 p-4 border border-green-500/20"
                        >
                            <div className="text-sm text-green-500">
                                Verification email sent! Please check your inbox.
                            </div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="rounded-lg bg-green-500/10 p-4 border border-green-500/20"
                        >
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-500" />
                                <div className="text-sm text-green-500">{success}</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiMail className="h-5 w-5 text-github-text-secondary" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-github-border'
                                        } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {formErrors.email && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <HiLockClosed className="h-5 w-5 text-github-text-secondary" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${formErrors.password ? 'border-red-500' : 'border-github-border'
                                        } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-github-text-secondary hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5" />
                                    ) : (
                                        <FaEye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {formErrors.password && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                href="/auth/forgot-password"
                                className="text-github-link hover:text-github-link-hover transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-md"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}