'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { HiQrcode, HiKey, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { TbLoader2 } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface TwoFactorSetupResponse {
    qrCode: string;
    secret: string;
    backupCodes: string[];
}

export default function TwoFactorSetupPage() {
    const router = useRouter();
    const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (step === 'setup') {
            initializeSetup();
        }
    }, [step]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 'verify' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const initializeSetup = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/2fa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initialize 2FA setup');
            }

            setSetupData(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: verificationCode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify 2FA code');
            }

            setStep('complete');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        router.push('/dashboard');
    };

    if (isLoading && !setupData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-github-dark to-github-dark-secondary">
                <div className="flex items-center space-x-2">
                    <TbLoader2 className="animate-spin h-8 w-8 text-github-accent" />
                    <span className="text-white">Initializing 2FA setup...</span>
                </div>
            </div>
        );
    }

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
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-center text-sm text-github-text-secondary">
                        {step === 'setup' && 'Set up 2FA to enhance your account security'}
                        {step === 'verify' && 'Verify your 2FA setup'}
                        {step === 'complete' && '2FA setup complete!'}
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

                {step === 'setup' && setupData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="bg-github-dark-secondary/50 p-6 rounded-lg border border-github-border">
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative w-48 h-48">
                                    <Image
                                        src={setupData.qrCode}
                                        alt="2FA QR Code"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <div className="text-center text-sm text-github-text-secondary mb-4">
                                Scan this QR code with your authenticator app
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-github-text-secondary">Manual Entry Code:</span>
                                    <div className="flex items-center space-x-2">
                                        <code className="text-sm bg-github-dark/50 px-2 py-1 rounded">
                                            {showSecret ? setupData.secret : '••••••••••••••••'}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="text-github-text-secondary hover:text-white transition-colors"
                                        >
                                            {showSecret ? (
                                                <FaEyeSlash className="h-4 w-4" />
                                            ) : (
                                                <FaEye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-github-text-secondary">Backup Codes:</span>
                                    <div className="flex items-center space-x-2">
                                        <code className="text-sm bg-github-dark/50 px-2 py-1 rounded">
                                            {showBackupCodes ? setupData.backupCodes.join(' ') : '••••••••••••••••'}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => setShowBackupCodes(!showBackupCodes)}
                                            className="text-github-text-secondary hover:text-white transition-colors"
                                        >
                                            {showBackupCodes ? (
                                                <FaEyeSlash className="h-4 w-4" />
                                            ) : (
                                                <FaEye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                            <div className="flex items-start space-x-2">
                                <HiExclamationCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div className="text-sm text-yellow-500">
                                    <p className="font-medium">Important:</p>
                                    <ul className="mt-1 list-disc list-inside">
                                        <li>Save your backup codes in a secure location</li>
                                        <li>You'll need these codes if you lose access to your authenticator app</li>
                                        <li>Each backup code can only be used once</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('verify')}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent"
                        >
                            Continue to Verification
                        </button>
                    </motion.div>
                )}

                {step === 'verify' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 space-y-6"
                    >
                        <form onSubmit={handleVerification} className="space-y-4">
                            <div>
                                <label htmlFor="verificationCode" className="block text-sm font-medium text-github-text-secondary mb-1">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <HiKey className="h-5 w-5 text-github-text-secondary" />
                                    </div>
                                    <input
                                        id="verificationCode"
                                        name="verificationCode"
                                        type="text"
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 py-2 border border-github-border bg-github-dark-secondary/50 placeholder-github-text-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent sm:text-sm"
                                        placeholder="Enter 6-digit code"
                                    />
                                </div>
                            </div>

                            <div className="text-center text-sm text-github-text-secondary">
                                Time remaining: {countdown}s
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <TbLoader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 'complete' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                            <div className="flex items-center space-x-2">
                                <HiCheckCircle className="w-5 h-5 text-green-500" />
                                <div className="text-sm text-green-500">
                                    Two-factor authentication has been successfully enabled!
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-github-accent hover:bg-github-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-github-accent"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
} 