'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HiMail, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { TbLoader2 } from "react-icons/tb";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEmail(value);
        // Clear error when user starts typing
        if (formErrors.email) {
            setFormErrors(prev => ({ ...prev, email: '' }));
        }
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setSuccess(true);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
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
                    <h2 className="text-3xl font-extrabold text-white text-center">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        Enter your email address and we'll send you instructions to reset your password
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
                                <div className="text-sm text-green-500">
                                    If an account exists with this email, you will receive password reset instructions.
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <form onSubmit={onSubmit} className="mt-8 space-y-6">
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
                                    value={email}
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
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Reset Instructions'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/auth/login"
                        className="text-sm text-github-link hover:text-github-link-hover transition-colors"
                    >
                        Remember your password? Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
} 