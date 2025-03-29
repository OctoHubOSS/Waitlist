'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiAlertCircle } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';

// Loading component
function ErrorLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-github-dark">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-github-accent"></div>
      <p className="mt-4 text-github-text-secondary">Loading...</p>
    </div>
  );
}

// Error component that uses useSearchParams
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Define error messages for different error types
  const errorMessages: Record<string, { title: string; message: string }> = {
    Configuration: {
      title: 'Authentication Configuration Error',
      message: 'There is a problem with the server authentication configuration. Please contact support for assistance.'
    },
    AccessDenied: {
      title: 'Access Denied',
      message: 'You do not have permission to sign in. Your account may have been suspended or you may need additional permissions.'
    },
    Verification: {
      title: 'Verification Error',
      message: 'The verification link has expired or has already been used. Please request a new verification link.'
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please check your credentials and try again.'
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      message: 'There was a problem signing in with the OAuth provider. Please try again or use a different method.'
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      message: 'There was a problem processing the OAuth callback. Please try again later.'
    },
    OAuthCreateAccount: {
      title: 'Account Creation Error',
      message: 'There was a problem creating an account with your OAuth provider. Please try again later.'
    },
    EmailCreateAccount: {
      title: 'Account Creation Error',
      message: 'There was a problem creating an account with your email. Please try again later or use a different email.'
    },
    Callback: {
      title: 'Callback Error',
      message: 'There was a problem processing the authentication callback. Please try again later.'
    },
    Default: {
      title: 'Authentication Error',
      message: 'An unexpected error occurred during authentication. Please try again later.'
    }
  };

  // Get the appropriate error info
  const errorInfo = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default;
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-github-dark">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.webp"
              alt="OctoHub"
              width={64}
              height={64}
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Authentication Error
          </h2>
        </div>
        
        <motion.div 
          className="bg-github-dark-secondary border border-github-border rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-900/20 p-3 rounded-full">
                <FiAlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-medium text-white text-center mb-2">
              {errorInfo.title}
            </h3>
            
            <p className="text-github-text-secondary text-center mb-6">
              {errorInfo.message}
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link href="/auth/signin" className="flex-1">
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent/90">
                  Try Again
                </button>
              </Link>
              
              <Link href="/" className="flex-1">
                <button className="w-full py-2 px-4 border border-github-border rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-github-dark-secondary">
                  Go Home
                </button>
              </Link>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-github-dark/40 border-t border-github-border">
            <p className="text-sm text-github-text-secondary text-center">
              Need help? <Link href="/support" className="text-github-link hover:text-github-link-hover">Contact Support</Link>
            </p>
          </div>
        </motion.div>
        
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-github-link hover:text-github-link-hover"
          >
            <FaArrowLeft className="mr-2" /> Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  );
}
