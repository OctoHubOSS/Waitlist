"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TbLoader2 } from "react-icons/tb";
import { HiExclamationCircle } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { Check, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

type RegistrationStep = "basic" | "account" | "terms";

export default function Register() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<RegistrationStep>("basic");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        displayName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({
        name: null,
        displayName: null,
        email: null,
        password: null,
        confirmPassword: null,
        terms: null
    });
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false,
    });
    const [isCheckingWaitlist, setIsCheckingWaitlist] = useState(false);
    const [waitlistStatus, setWaitlistStatus] = useState<{
        isValid: boolean;
        message: string;
    } | null>(null);
    const debouncedEmail = useDebounce(formData.email, 500);

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

    useEffect(() => {
        const checkWaitlist = async () => {
            if (!debouncedEmail || !debouncedEmail.includes('@')) return;

            setIsCheckingWaitlist(true);
            try {
                const response = await fetch('/api/auth/check-waitlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: debouncedEmail }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to check waitlist status');
                }

                setWaitlistStatus({
                    isValid: data.data.isSubscriber,
                    message: data.data.message
                });
            } catch (error) {
                setWaitlistStatus({
                    isValid: false,
                    message: 'Failed to check waitlist status'
                });
            } finally {
                setIsCheckingWaitlist(false);
            }
        };

        checkWaitlist();
    }, [debouncedEmail]);

    const handleNext = () => {
        setError(null); // Clear any previous errors
        setFieldErrors({}); // Clear field errors

        if (currentStep === "basic") {
            const newErrors: Record<string, string | null> = {};
            let hasError = false;

            if (!formData.name.trim()) {
                newErrors.name = "Please enter your full name";
                hasError = true;
            }
            if (!formData.displayName.trim()) {
                newErrors.displayName = "Please enter a username";
                hasError = true;
            }
            if (formData.displayName.length < 3) {
                newErrors.displayName = "Username must be at least 3 characters long";
                hasError = true;
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(formData.displayName)) {
                newErrors.displayName = "Username can only contain letters, numbers, underscores, and hyphens";
                hasError = true;
            }

            if (hasError) {
                setFieldErrors(newErrors);
                return;
            }
            setCurrentStep("account");
        } else if (currentStep === "account") {
            const newErrors: Record<string, string | null> = {};
            let hasError = false;

            if (!formData.email.trim()) {
                newErrors.email = "Please enter your email address";
                hasError = true;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
                hasError = true;
            }
            if (!formData.password) {
                newErrors.password = "Please enter a password";
                hasError = true;
            }
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Please confirm your password";
                hasError = true;
            }
            if (!waitlistStatus?.isValid) {
                newErrors.email = waitlistStatus?.message || "Please subscribe to the waitlist first";
                hasError = true;
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
                newErrors.password = `Password must contain ${missingRequirements.join(", ")}`;
                hasError = true;
            }

            if (hasError) {
                setFieldErrors(newErrors);
                return;
            }
            setCurrentStep("terms");
        }
    };

    const handleBack = () => {
        if (currentStep === "account") {
            setCurrentStep("basic");
        } else if (currentStep === "terms") {
            setCurrentStep("account");
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear any previous errors
        setFieldErrors({}); // Clear field errors

        // Only check terms if we're on the terms step
        if (currentStep === "terms" && !acceptedTerms) {
            setFieldErrors({ terms: "Please accept the Terms of Service and Privacy Policy" });
            return;
        }

        // If we're not on the terms step, go to the next step
        if (currentStep !== "terms") {
            handleNext();
            return;
        }

        setIsLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('displayName', formData.displayName.trim());
            formDataToSend.append('email', formData.email.trim());
            formDataToSend.append('password', formData.password);

            const response = await fetch("/api/auth/register", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create account");
            }

            // Registration successful, redirect to verify email page
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case "basic":
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`appearance-none relative block w-full px-3 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-github-border'
                                    } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                placeholder="John Doe"
                            />
                            {fieldErrors.name && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Username
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className={`appearance-none relative block w-full px-3 py-2 border ${fieldErrors.displayName ? 'border-red-500' : 'border-github-border'
                                    } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                placeholder="johndoe"
                            />
                            {fieldErrors.displayName && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.displayName}</p>
                            )}
                        </div>
                    </div>
                );

            case "account":
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`appearance-none relative block w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-github-border'
                                    } bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm transition-colors`}
                                placeholder="you@example.com"
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
                            )}
                            {isCheckingWaitlist && (
                                <p className="mt-1 text-sm text-github-text-secondary">Checking waitlist status...</p>
                            )}
                            {waitlistStatus && !isCheckingWaitlist && (
                                <p className={`mt-1 text-sm ${waitlistStatus.isValid ? 'text-green-500' : 'text-red-500'}`}>
                                    {waitlistStatus.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    className={`appearance-none relative block w-full pl-3 pr-10 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-github-border'
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
                            {fieldErrors.password && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-github-text-secondary mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className={`appearance-none relative block w-full pl-3 pr-10 py-2 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-github-border'
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
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-github-text-secondary">Password Requirements:</p>
                            <ul className="space-y-1 text-sm">
                                <li className={`flex items-center ${passwordRequirements.length ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.length ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    At least 8 characters
                                </li>
                                <li className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.uppercase ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    One uppercase letter
                                </li>
                                <li className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.lowercase ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    One lowercase letter
                                </li>
                                <li className={`flex items-center ${passwordRequirements.number ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.number ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    One number
                                </li>
                                <li className={`flex items-center ${passwordRequirements.special ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.special ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    One special character
                                </li>
                                <li className={`flex items-center ${passwordRequirements.match ? 'text-green-500' : 'text-github-text-secondary'}`}>
                                    {passwordRequirements.match ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                                    Passwords match
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            case "terms":
                return (
                    <div className="space-y-4">
                        <div className="bg-github-dark-secondary/50 p-4 rounded-lg border border-github-border">
                            <h3 className="text-lg font-medium text-white mb-2">Terms of Service</h3>
                            <p className="text-sm text-github-text-secondary mb-4">
                                By creating an account, you agree to our Terms of Service and Privacy Policy.
                            </p>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="h-4 w-4 text-github-accent focus:ring-github-accent border-github-border rounded"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-github-text-secondary">
                                    I accept the{" "}
                                    <Link href="/terms" className="text-github-link hover:text-github-link-hover">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link href="/privacy" className="text-github-link hover:text-github-link-hover">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {fieldErrors.terms && (
                                <p className="mt-1 text-sm text-red-500">{fieldErrors.terms}</p>
                            )}
                        </div>
                    </div>
                );
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="text-github-link hover:text-github-link-hover transition-colors"
                        >
                            Sign in
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
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignUp} className="mt-8 space-y-6">
                    {renderStepContent()}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === "basic"}
                            className="text-sm text-github-link hover:text-github-link-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-32 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    {currentStep === "terms" ? "Creating..." : "Next"}
                                </div>
                            ) : (
                                currentStep === "terms" ? "Create Account" : "Next"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 