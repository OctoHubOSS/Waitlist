"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaEnvelope } from "react-icons/fa";
import { TbLoader2 } from "react-icons/tb";
import { HiExclamationCircle } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"github" | "credentials">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleGitHubSignIn = async () => {
    if (!acceptedTerms) {
      return;
    }
    setIsLoading(true);
    await signIn("github", { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return;
    }
    setIsLoading(true);
    await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
  };

  // Error messages mapping
  const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
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
              OctoHub
            </span>
          </motion.h2>
          <motion.p
            className="mt-2 text-center text-github-text-secondary"
            variants={itemVariants}
          >
            Choose your preferred sign-in method
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

        {/* Auth method selector */}
        <motion.div className="flex justify-center space-x-4" variants={itemVariants}>
          <button
            onClick={() => setAuthMethod("credentials")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${authMethod === "credentials"
              ? "bg-github-dark-secondary text-white border border-github-link"
              : "text-github-text-secondary hover:text-white"
              }`}
          >
            Email
          </button>
          <button
            onClick={() => setAuthMethod("github")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${authMethod === "github"
              ? "bg-github-dark-secondary text-white border border-github-link"
              : "text-github-text-secondary hover:text-white"
              }`}
          >
            GitHub
          </button>
        </motion.div>

        {/* GitHub Sign In */}
        <AnimatePresence mode="wait">
          {authMethod === "github" && (
            <motion.div
              key="github"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              <motion.button
                onClick={handleGitHubSignIn}
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-4 px-4 border border-github-border bg-gradient-to-r from-black to-github-dark-secondary text-sm font-medium rounded-xl text-white hover:border-github-link focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent focus:ring-offset-github-dark ${isLoading ? "opacity-70 cursor-not-allowed" : ""
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
          )}

          {/* Email/Password Sign In */}
          {authMethod === "credentials" && (
            <motion.form
              key="credentials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleCredentialsSignIn}
              className="mt-8 space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="off"
                    placeholder="example@octohub.dev"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-github-text-secondary">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="text-github-link hover:text-github-link-hover"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-sm">
                  <Link
                    href="/auth/register"
                    className="text-github-link hover:text-github-link-hover"
                  >
                    Create an account
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className={`w-full flex justify-center py-4 px-4 border border-github-border bg-gradient-to-r from-black to-github-dark-secondary text-sm font-medium rounded-xl text-white hover:border-github-link focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent focus:ring-offset-github-dark ${(isLoading || !acceptedTerms) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <TbLoader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in with Email"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Legal Policy Agreement */}
        <motion.div
          className="mt-8 flex space-x-3 items-center justify-center"
          variants={itemVariants}
        >
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
        </motion.div>

        <motion.div className="mt-2 text-center" variants={itemVariants}>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-github-link hover:text-github-link-hover transition-all hover:underline underline-offset-4"
          >
            Return to home page
          </Link>
        </motion.div>
      </motion.div>

      {/* Subtle fixed position decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-github-dark to-transparent opacity-50 pointer-events-none"></div>
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-github-dark to-transparent opacity-50 pointer-events-none"></div>
    </div>
  );
}
