"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TbLoader2 } from "react-icons/tb";
import { HiExclamationCircle } from "react-icons/hi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
        match: false,
    });

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

    const handleNext = () => {
        if (currentStep === "basic") {
            if (!formData.name.trim() || !formData.displayName.trim()) {
                setError("Please fill in all fields");
                return;
            }
            setCurrentStep("account");
        } else if (currentStep === "account") {
            if (!formData.email.trim() || !formData.password || !formData.confirmPassword) {
                setError("Please fill in all fields");
                return;
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
                setError(`Password must contain ${missingRequirements.join(", ")}`);
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
        if (!acceptedTerms) {
            setError("Please accept the Terms of Service and Privacy Policy");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Registration failed");
            }
            router.push("/auth/signin?registered=true");
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case "basic":
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-github-text-secondary">
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-github-text-secondary">
                                Username
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                autoComplete="username"
                                required
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                                placeholder="johndoe123"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                className="btn btn-primary"
                            >
                                Next
                            </button>
                        </div>
                    </motion.div>
                );
            case "account":
                return (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-github-text-secondary">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                    className="block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-github-text-secondary hover:text-github-accent transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-github-text-secondary">
                                Confirm password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    className="block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-github-text-secondary hover:text-github-accent transition-colors"
                                >
                                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {!Object.values(passwordRequirements).every(Boolean) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2"
                                >
                                    <div className="bg-github-dark-secondary/40 border border-github-border rounded-lg p-4">
                                        <p className="text-xs font-medium text-github-text-secondary mb-3">Missing requirements:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {!passwordRequirements.length && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">8+ characters</span>
                                                </div>
                                            )}
                                            {!passwordRequirements.uppercase && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">Uppercase letter</span>
                                                </div>
                                            )}
                                            {!passwordRequirements.lowercase && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">Lowercase letter</span>
                                                </div>
                                            )}
                                            {!passwordRequirements.number && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">Number</span>
                                                </div>
                                            )}
                                            {!passwordRequirements.special && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">Special character</span>
                                                </div>
                                            )}
                                            {!passwordRequirements.match && (
                                                <div className="flex items-center space-x-2 text-red-400">
                                                    <span className="text-sm">✗</span>
                                                    <span className="text-xs">Passwords match</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="btn btn-secondary"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="btn btn-primary"
                            >
                                Next
                            </button>
                        </div>
                    </motion.div>
                );
            case "terms":
                return (
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="bg-github-dark-secondary/40 border border-github-border rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium text-white">Welcome to OctoHub!</h3>
                            <p className="text-github-text-secondary">
                                Before you create your account, please review our terms and policies.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-github-link mb-2">Terms of Service</h4>
                                    <p className="text-sm text-github-text-secondary">
                                        By accepting these terms, you agree to:
                                    </p>
                                    <ul className="mt-2 space-y-2 text-sm text-github-text-secondary list-disc list-inside">
                                        <li>Use the platform responsibly and in accordance with our guidelines</li>
                                        <li>Maintain the security of your account and credentials</li>
                                        <li>Respect intellectual property rights and licensing</li>
                                        <li>Not engage in any harmful or malicious activities</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-github-link mb-2">Privacy Policy</h4>
                                    <p className="text-sm text-github-text-secondary">
                                        We handle your data with care:
                                    </p>
                                    <ul className="mt-2 space-y-2 text-sm text-github-text-secondary list-disc list-inside">
                                        <li>Your personal information is encrypted and securely stored</li>
                                        <li>We never share your data with third parties without consent</li>
                                        <li>You have full control over your account data</li>
                                        <li>Regular security audits protect your information</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-github-link mb-2">Account Security</h4>
                                    <p className="text-sm text-github-text-secondary">
                                        To protect your account:
                                    </p>
                                    <ul className="mt-2 space-y-2 text-sm text-github-text-secondary list-disc list-inside">
                                        <li>Use a strong, unique password</li>
                                        <li>Enable two-factor authentication when available</li>
                                        <li>Keep your account credentials secure</li>
                                        <li>Report any suspicious activity immediately</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-github-border">
                                <div className="flex items-start space-x-3">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="h-4 w-4 rounded border-github-border bg-github-dark-secondary text-github-accent focus:ring-github-accent"
                                        />
                                    </div>
                                    <div className="text-sm text-github-text-secondary">
                                        <label htmlFor="terms" className="font-medium">
                                            I agree to the{" "}
                                            <Link
                                                href="/legal/terms"
                                                className="text-github-link hover:text-github-link-hover"
                                            >
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                href="/legal/privacy"
                                                className="text-github-link hover:text-github-link-hover"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="btn btn-secondary"
                            >
                                Back
                            </button>
                            <AnimatePresence>
                                {acceptedTerms ? (
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-primary"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <TbLoader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Creating account...
                                            </div>
                                        ) : (
                                            "Create account"
                                        )}
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        className="text-sm text-github-text-secondary"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        Accept the terms to continue
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div
            className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
            }}
        >
            {/* Static background with subtle patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(35, 134, 54, 0.2) 0%, transparent 50%)",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(88, 166, 255, 0.1) 1px, transparent 1px), 
                                        linear-gradient(90deg, rgba(88, 166, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: "4rem 4rem",
                    }}
                />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-md space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <Link href="/" className="flex justify-center">
                        <motion.div
                            className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-github-dark to-github-dark-secondary flex items-center justify-center backdrop-blur-sm border border-github-border overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 bg-github-dark-secondary opacity-50" />
                            <Image
                                src="/logo.webp"
                                alt="OctoSearch"
                                width={64}
                                height={64}
                                className="relative z-10 hover:animate-spin"
                            />
                        </motion.div>
                    </Link>
                    <motion.h2
                        className="mt-6 text-center text-3xl font-bold tracking-tight text-white"
                        variants={itemVariants}
                    >
                        Create your{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-github-link to-github-accent">
                            OctoHub
                        </span>{" "}
                        account
                    </motion.h2>

                    {/* Progress Tracker */}
                    <motion.div
                        className="mt-8 space-y-2"
                        variants={itemVariants}
                    >
                        <div className="relative h-2 bg-github-dark-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="absolute h-full bg-gradient-to-r from-github-accent to-github-link"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: currentStep === "basic"
                                        ? "33%"
                                        : currentStep === "account"
                                            ? "66%"
                                            : "100%"
                                }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                            <div className="absolute inset-0 flex justify-between px-2">
                                <div className={`w-2 h-2 rounded-full mt-1 ${currentStep === "basic"
                                    ? "bg-github-accent"
                                    : "bg-green-500"
                                    }`} />
                                <div className={`w-2 h-2 rounded-full mt-1 ${currentStep === "account"
                                    ? "bg-github-accent"
                                    : currentStep === "terms"
                                        ? "bg-green-500"
                                        : "bg-github-dark-secondary"
                                    }`} />
                                <div className={`w-2 h-2 rounded-full mt-1 ${currentStep === "terms"
                                    ? "bg-github-accent"
                                    : "bg-github-dark-secondary"
                                    }`} />
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className={`${currentStep === "basic" ? "text-github-accent" : "text-github-text-secondary"}`}>
                                Basic Info
                            </span>
                            <span className={`${currentStep === "account" ? "text-github-accent" : "text-github-text-secondary"}`}>
                                Account Details
                            </span>
                            <span className={`${currentStep === "terms" ? "text-github-accent" : "text-github-text-secondary"}`}>
                                Terms
                            </span>
                        </div>
                    </motion.div>

                    {/* Step Description */}
                    <motion.p
                        className="mt-4 text-center text-github-text-secondary"
                        variants={itemVariants}
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep === "basic" && (
                            "Welcome! Let's start with your basic information. This will help us personalize your experience."
                        )}
                        {currentStep === "account" && (
                            "Great! Now let's set up your account credentials. Choose a strong password to keep your account secure."
                        )}
                        {currentStep === "terms" && (
                            "Almost there! Please review our terms and policies to ensure a safe and enjoyable experience."
                        )}
                    </motion.p>
                </motion.div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="rounded-md bg-red-900/20 backdrop-blur-sm border border-red-500/50 p-4 mb-4"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <HiExclamationCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form
                    onSubmit={handleSignUp}
                    className="mt-8 space-y-6"
                    variants={itemVariants}
                >
                    <AnimatePresence mode="wait">
                        {renderStepContent()}
                    </AnimatePresence>
                </motion.form>

                <motion.div className="mt-2 text-center" variants={itemVariants}>
                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-github-link hover:text-github-link-hover transition-all hover:underline underline-offset-4"
                    >
                        Already have an account? Sign in
                    </Link>
                </motion.div>
            </motion.div>

            {/* Subtle fixed position decorative elements */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-github-dark to-transparent opacity-50 pointer-events-none"></div>
            <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-github-dark to-transparent opacity-50 pointer-events-none"></div>
        </div>
    );
} 