"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaHome, FaSignInAlt } from "react-icons/fa";

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, { title: string, description: string }> = {
        Configuration: {
            title: "Configuration Error",
            description: "There's a problem with the server configuration. Please contact support."
        },
        AccessDenied: {
            title: "Access Denied",
            description: "You don't have permission to access this resource. Please check your credentials or contact support."
        },
        Verification: {
            title: "Verification Failed",
            description: "The verification link may have expired or has already been used. Please request a new verification link."
        },
        OAuthSignin: {
            title: "OAuth Sign In Error",
            description: "There was an error initializing the OAuth sign-in process."
        },
        OAuthCallback: {
            title: "OAuth Callback Error",
            description: "There was an error processing the OAuth callback."
        },
        OAuthCreateAccount: {
            title: "Account Creation Error",
            description: "There was an error creating your account through OAuth."
        },
        EmailCreateAccount: {
            title: "Email Account Error",
            description: "There was an error creating your account with the provided email."
        },
        Callback: {
            title: "Callback Error",
            description: "There was an error during the authentication callback process."
        },
        Default: {
            title: "Authentication Error",
            description: "An unexpected authentication error occurred. Please try again later."
        },
    };

    const errorInfo = error ? errorMessages[error] ?? errorMessages.Default : errorMessages.Default;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-github-dark to-github-dark-secondary">
            <motion.div
                className="w-full max-w-md space-y-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mx-auto h-16 w-16 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/50">
                    <FaExclamationTriangle className="h-8 w-8 text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-white">{errorInfo.title}</h1>

                <div className="bg-github-dark-secondary border border-github-border rounded-md p-6 mt-4">
                    <p className="text-github-text">{errorInfo.description}</p>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-github-dark hover:bg-github-dark-secondary shadow-sm"
                        >
                            <FaHome className="mr-2 h-4 w-4" />
                            Return to home
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link
                            href="/auth/signin"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-github-accent hover:bg-github-accent-hover"
                        >
                            <FaSignInAlt className="mr-2 h-4 w-4" />
                            Try signing in again
                        </Link>
                    </motion.div>
                </div>

                <div className="mt-8 text-sm text-github-text-secondary">
                    <p>Need help? <a href="mailto:support@octosearch.dev" className="text-github-link hover:text-github-link-hover">Contact support</a></p>
                </div>
            </motion.div>
        </div>
    );
}
