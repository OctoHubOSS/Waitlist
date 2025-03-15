"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { TbLoader2 } from "react-icons/tb";
import { HiExclamationCircle } from "react-icons/hi";
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

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : null;

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
            Sign in to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-github-link to-github-accent">
              OctoSearch
            </span>
          </motion.h2>
          <motion.p
            className="mt-2 text-center text-github-text-secondary"
            variants={itemVariants}
          >
            Use your GitHub account to access enhanced features
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {errorMessage && (
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
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="mt-8" variants={itemVariants}>
          <motion.button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-4 px-4 border border-github-border bg-gradient-to-r from-black to-github-dark-secondary text-sm font-medium rounded-xl text-white hover:border-github-link focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent focus:ring-offset-github-dark ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            whileHover={{
              scale: 1.01,
              boxShadow: "0 0 15px rgba(88, 166, 255, 0.2)",
              borderColor: "rgba(88, 166, 255, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FaGithub className="h-5 w-5 text-gray-400 group-hover:text-github-link transition-colors" />
            </span>
            {isLoading ? (
              <div className="flex items-center">
                <TbLoader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Signing in...
              </div>
            ) : (
              "Sign in with GitHub"
            )}
          </motion.button>
        </motion.div>

        <motion.div className="mt-2 text-center" variants={itemVariants}>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-github-link hover:text-github-link-hover transition-all hover:underline underline-offset-4"
          >
            Return to home page
          </Link>
        </motion.div>

        {/* Additional decorative elements */}
        <motion.div
          className="mt-16 text-center text-xs text-github-text-secondary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Searching GitHub repositories made simple
        </motion.div>
      </motion.div>

      {/* Subtle fixed position decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-github-dark to-transparent opacity-50 pointer-events-none"></div>
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-github-dark to-transparent opacity-50 pointer-events-none"></div>
    </div>
  );
}
