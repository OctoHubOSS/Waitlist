'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Loading component
function UnsubscribeLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-github-accent"></div>
      <p className="mt-4 text-github-text-secondary">Processing your request...</p>
    </div>
  );
}

// Main unsubscribe form component that uses useSearchParams
function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState(email);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailInput) {
      setError('Please enter your email address.');
      return;
    }
    
    setIsUnsubscribing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/waitlist/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unsubscribe. Please try again.');
      }
      
      setIsUnsubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-github-dark">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
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
            Unsubscribe from Waitlist
          </h2>
          <p className="mt-2 text-sm text-github-text-secondary">
            We're sorry to see you go! Confirm your email address to unsubscribe.
          </p>
        </div>

        {isUnsubscribed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-github-dark-secondary border border-github-border rounded-md p-6 text-center"
          >
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Successfully Unsubscribed</h3>
            <p className="text-github-text-secondary mb-4">
              You've been removed from our waitlist. You won't receive any more emails from us.
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-github-link hover:text-github-link-hover"
            >
              <FaArrowLeft className="mr-2" /> Return to home page
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-github-dark-secondary border border-github-border rounded-md p-6"
          >
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-start">
                <FaExclamationCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder="your-email@example.com"
                  className="w-full px-3 py-2 border border-github-border rounded-md bg-github-dark text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isUnsubscribing}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent ${
                    isUnsubscribing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isUnsubscribing ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span> Unsubscribing...
                    </>
                  ) : (
                    'Confirm Unsubscribe'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-github-link hover:text-github-link-hover"
              >
                Return to home page
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Main page component wrapped with Suspense
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeForm />
    </Suspense>
  );
}