"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function SignIn() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        await signIn("github", { callbackUrl });
    };

    // Error messages mapping
    const errorMessages: Record<string, string> = {
        CredentialsSignin: "Invalid sign in credentials. Please try again.",
        OAuthSignin: "Error during OAuth sign in. Please try again.",
        OAuthCallback: "Error during OAuth callback. Please try again.",
        OAuthCreateAccount: "Could not create OAuth account. Please try again.",
        EmailCreateAccount: "Could not create email account. Please try again.",
        Callback: "Authorization callback error. Please try again.",
        Default: "An unexpected error occurred during sign in.",
    };

    const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-github-dark to-github-dark-secondary">
            <motion.div
                className="w-full max-w-md space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <Link href="/" className="flex justify-center">
                        <motion.div
                            className="mx-auto h-16 w-16 rounded-full bg-github-dark-secondary flex items-center justify-center border border-github-border"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Image src="/logo.webp" alt="OctoSearch" width={64} height={64} className="hover:animate-spin" />
                        </motion.div>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                        Sign in to OctoSearch
                    </h2>
                    <p className="mt-2 text-center text-github-text-secondary">
                        Use your GitHub account to access enhanced features
                    </p>
                </div>

                {errorMessage && (
                    <motion.div
                        className="rounded-md bg-red-900/30 border border-red-500/50 p-4 mb-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-300">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mt-8">
                    <motion.button
                        onClick={handleGitHubSignIn}
                        disabled={isLoading}
                        className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <FaGithub className="h-5 w-5 text-gray-500 group-hover:text-gray-400" />
                        </span>
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </div>
                        ) : (
                            "Sign in with GitHub"
                        )}
                    </motion.button>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-github-link hover:text-github-link-hover">
                        Return to home page
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
