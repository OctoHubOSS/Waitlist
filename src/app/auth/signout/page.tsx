"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function SignOut() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const handleSignOut = async () => {
            try {
                await signOut({ redirect: false });
                setStatus('success');

                // Start countdown for redirection
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            router.push("/");
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            } catch (error) {
                console.error("Sign out error:", error);
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };

        handleSignOut();
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-github-dark to-github-dark-secondary px-4">
            <motion.div
                className="w-full max-w-md space-y-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mx-auto h-16 w-16 rounded-full bg-github-dark-secondary flex items-center justify-center border border-github-border">
                    <FaGithub className="h-8 w-8 text-white" />
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Signing you out...</h2>
                        <div className="flex justify-center">
                            <motion.div
                                className="h-8 w-8 border-4 border-github-accent/30 border-t-github-accent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white">You've been signed out</h2>
                        <p className="text-github-text-secondary">Thank you for using OctoSearch</p>
                        <div className="mt-6 bg-github-dark-secondary border border-github-border rounded-md p-4">
                            <p className="text-sm">
                                Redirecting to home page in <span className="text-github-accent font-bold">{countdown}</span> seconds...
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-github-accent bg-github-accent/10 hover:bg-github-accent/20"
                            >
                                Return to home now
                            </Link>
                        </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white">Sign out error</h2>
                        <p className="text-github-text-secondary">There was a problem signing you out</p>
                        <div className="pt-4">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-github-accent hover:bg-github-accent-hover"
                            >
                                Return to home
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
