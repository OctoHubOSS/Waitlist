'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { FaShieldAlt, FaEnvelope, FaUserShield, FaTimes, FaCheck, FaBan } from 'react-icons/fa';
import Link from 'next/link';
import { createApiClient } from '@/lib/api/client';
import { createClientApiConfig } from '@/lib/api/config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// Fix: Configure the client with the explicit baseUrl
const apiClient = createApiClient(createClientApiConfig({
  baseUrl: '/api' // Explicitly set the base URL to /api
}));

export default function SubscribePage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
    const [showUnsubscribePrompt, setShowUnsubscribePrompt] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Use the API client provided by the library
    const subscribeToWaitlist = async (email: string, name?: string, referralCode?: string, metadata?: Record<string, any>) => {
        try {
            // Use a direct path without /api prefix since the client adds it
            const response = await apiClient.post(
                '/waitlist/subscribe', 
                {
                    email,
                    name,
                    referralCode,
                    source: 'website',
                    metadata
                }
            );
            
            return response;
        } catch (error) {
            console.error('Error subscribing to waitlist:', error);
            return {
                success: false,
                message: 'Failed to subscribe to waitlist',
            };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setIsSubmitting(true);

        try {
            const data = await subscribeToWaitlist(email);

            if (data.status === 409) {
                setIsAlreadySubscribed(true);
                setShowUnsubscribePrompt(true);
                return;
            }

            if (!data.success) {
                throw new Error(data.message || 'Failed to join waitlist');
            }

            toast.success('Successfully joined the waitlist! Check your email for confirmation.');
            setEmail('');
        } catch (error) {
            console.error('Waitlist subscription error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to join waitlist');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowUnsubscribePrompt(false);
        setIsAlreadySubscribed(false);
        setEmail('');
    };

    const trustPoints = [
        {
            icon: FaShieldAlt,
            title: 'No Spam',
            description: 'We only send essential updates about OctoHub and never share your email with third parties.',
        },
        {
            icon: FaEnvelope,
            title: 'Limited Emails',
            description: 'You\'ll only receive important updates about our launch and early access opportunities.',
        },
        {
            icon: FaUserShield,
            title: 'Privacy First',
            description: 'Your email is stored securely and you can unsubscribe at any time with one click.',
        },
        {
            icon: FaTimes,
            title: 'Easy Unsubscribe',
            description: 'Every email includes an unsubscribe link, and you can also unsubscribe from our website.',
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <motion.div
                className="max-w-4xl w-full space-y-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-github-dark to-github-dark-secondary flex items-center justify-center backdrop-blur-sm border border-github-border overflow-hidden">
                        {imgError ? (
                            <div className="relative z-10 text-github-accent font-bold text-3xl">OH</div>
                        ) : (
                            <Image
                                src="/logo.webp"
                                alt="OctoHub"
                                width={64}
                                height={64}
                                className="relative z-10"
                                quality={90}
                                priority
                                onError={() => setImgError(true)}
                            />
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-white">
                        {isAlreadySubscribed ? 'Already Subscribed' : 'Join the OctoHub Waitlist'}
                    </h1>
                    <p className="text-xl text-github-text-secondary max-w-2xl mx-auto">
                        {isAlreadySubscribed
                            ? 'This email is already subscribed to our waitlist.'
                            : 'Be among the first to experience the future of code collaboration. Get exclusive early access and special launch offers.'}
                    </p>
                </div>

                {/* Trust Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trustPoints.map((point, index) => (
                        <motion.div
                            key={point.title}
                            className="flex items-start space-x-4 p-6 rounded-lg border border-github-border bg-github-dark-secondary/30 backdrop-blur-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <point.icon className="w-6 h-6 text-github-accent mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-white">{point.title}</h3>
                                <p className="text-github-text-secondary mt-1">{point.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Subscribe Form or Unsubscribe Prompt */}
                <motion.div
                    className="max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {!isAlreadySubscribed ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-lg bg-github-dark-secondary/50 border border-github-border focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent text-white placeholder-github-text-secondary"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full px-6 py-3 rounded-lg bg-github-accent hover:bg-github-accent/90 text-white font-medium transition-colors duration-200 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                            </button>
                        </form>
                    ) : showUnsubscribePrompt ? (
                        <div className="space-y-4">
                            <p className="text-center text-github-text-secondary">
                                You are already subscribed to the OctoHub waitlist. Would you like to unsubscribe?
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    href={`/waitlist/unsubscribe?email=${encodeURIComponent(email)}`}
                                    className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <FaCheck className="w-4 h-4" />
                                    Confirm
                                </Link>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-6 py-3 rounded-lg bg-github-dark-secondary hover:bg-github-dark-secondary/80 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    <FaBan className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : null}
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="text-center text-sm text-github-text-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>
                        By joining the waitlist, you agree to receive updates about OctoHub.
                        You can unsubscribe at any time.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}