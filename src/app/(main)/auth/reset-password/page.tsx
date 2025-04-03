'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HiLockClosed, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { TbLoader2 } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false,
    });

    useEffect(() => {
        if (!code || !email) {
            router.push('/auth/forgot-password');
        }
    }, [code, email, router]);

    const validatePassword = (password: string, confirmPassword: string) => {
        setPasswordRequirements({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            match: password === confirmPassword && password !== "" && confirmPassword !== "",
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });
        validatePassword(newPassword, formData.confirmPassword);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newConfirmPassword = e.target.value;
        setFormData({ ...formData, confirmPassword: newConfirmPassword });
        validatePassword(formData.password, newConfirmPassword);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.password) {
            errors.password = 'Password is required';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        }
        if (!Object.values(passwordRequirements).every(Boolean)) {
            const missingRequirements = Object.entries(passwordRequirements)
                .filter(([_, value]) => !value)
                .map(([key]) => {
                    switch (key) {
                        case "length":
                            return "at least 8 characters";
                        case "uppercase":
                            return "one uppercase letter";
                        case "lowercase":
                            return "one lowercase letter";
                        case "number":
                            return "one number";
                        case "special":
                            return "one special character";
                        case "match":
                            return "passwords to match";
                        default:
                            return key;
                    }
                });
            errors.password = `Password must contain ${missingRequirements.join(", ")}`;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/login?reset=true');
            }, 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    if (!code || !email) {
        return null;
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
                        Please enter your new password below
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
                                    Password reset successful! Redirecting to login...
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <form onSubmit={onSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-github-text-secondary mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-github-text-secondary" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handlePasswordChange}
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-github-text-secondary mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiLockClosed className="h-5 w-5 text-github-text-secondary" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-github-border'
                                            } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-github-text-secondary hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-5 w-5" />
                                        ) : (
                                            <FaEye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {formErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="bg-github-dark-secondary/50 p-4 rounded-lg border border-github-border">
                                <div className="space-y-2">
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.length ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.length ? "✓" : "✗"}</span>
                                        <span className="text-xs">8+ characters</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.uppercase ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.uppercase ? "✓" : "✗"}</span>
                                        <span className="text-xs">Uppercase letter</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.lowercase ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.lowercase ? "✓" : "✗"}</span>
                                        <span className="text-xs">Lowercase letter</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.number ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.number ? "✓" : "✗"}</span>
                                        <span className="text-xs">Number</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.special ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.special ? "✓" : "✗"}</span>
                                        <span className="text-xs">Special character</span>
                                    </div>
                                    <div className={`flex items-center space-x-2 ${passwordRequirements.match ? "text-green-400" : "text-red-400"}`}>
                                        <span className="text-sm">{passwordRequirements.match ? "✓" : "✗"}</span>
                                        <span className="text-xs">Passwords match</span>
                                    </div>
                                </div>
                            </div>
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
                                        Resetting password...
                                    </div>
                                ) : (
                                    'Reset Password'
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
                        Back to login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
} 