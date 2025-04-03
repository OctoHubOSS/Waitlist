import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

interface Props {
    name: string;
    verifyUrl: string;
    code: string;
    email: string;
    expiresIn: string;
}

export default function VerifyEmailEmail({ name, verifyUrl, code, email, expiresIn }: Props) {
    const baseUrl = absoluteUrl();
    const supportUrl = `${baseUrl}/support`;
    const manualEntryUrl = `${baseUrl}/auth/verify?email=${encodeURIComponent(email)}`;

    return (
        <EmailLayout preview="Verify Your OctoHub Email">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Verify Your Email Address
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name},
                </p>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">
                        Email Verification Required
                    </h2>
                    <p className="text-blue-700">
                        Please verify your email address to complete your account setup. This code will expire in {expiresIn}.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Your verification code:</p>
                        <p className="text-2xl font-mono font-bold text-gray-900">{code}</p>
                    </div>

                    <p className="text-gray-700">
                        You can verify your email in two ways:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click the button below to verify automatically</li>
                        <li>Visit <a href={manualEntryUrl} className="text-blue-600 hover:underline">this page</a> and enter the code manually</li>
                    </ol>

                    <p className="text-gray-700">
                        If you didn't create an account:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Ignore this email</li>
                        <li>No action is required</li>
                        <li>Your email will not be used for any purpose</li>
                    </ol>
                </div>

                <div className="mt-8">
                    <a
                        href={verifyUrl}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Verify Email Address
                    </a>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    This is an automated message. If you have any questions, please contact our <a href={supportUrl} className="text-blue-600 hover:underline">support team</a>.
                </p>
            </div>
        </EmailLayout>
    );
} 