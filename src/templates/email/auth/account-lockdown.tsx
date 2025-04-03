import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

type Props = EmailTemplateProps['accountLockdown'];

export default function AccountLockdownEmail({ name, email, ip, timestamp, unlockUrl }: Props) {
    const baseUrl = absoluteUrl();
    const supportUrl = `${baseUrl}/support`;
    const securityUrl = `${baseUrl}/security`;

    return (
        <EmailLayout preview="Important: Your Account Has Been Locked">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Account Security Alert
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name},
                </p>

                <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-red-900 mb-4">
                        Your Account Has Been Temporarily Locked
                    </h2>
                    <p className="text-red-700 mb-4">
                        We've detected multiple failed login attempts to your account from the following IP address:
                    </p>
                    <p className="font-mono bg-red-100 p-3 rounded text-red-900 mb-4">
                        {ip}
                    </p>
                    <p className="text-red-700">
                        Time of detection: {timestamp}
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        If this was you:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click the button below to unlock your account</li>
                        <li>Reset your password to ensure account security</li>
                        <li>Review your recent login activity</li>
                    </ol>

                    <p className="text-gray-700">
                        If this wasn't you:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Do not click the unlock button</li>
                        <li>Contact our support team immediately</li>
                        <li>Consider enabling two-factor authentication for additional security</li>
                    </ol>
                </div>

                <div className="mt-8">
                    <a
                        href={unlockUrl}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Unlock Account
                    </a>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    This is an automated security alert. If you have any questions, please contact our <a href={supportUrl} className="text-blue-600 hover:underline">support team</a> or visit our <a href={securityUrl} className="text-blue-600 hover:underline">security page</a>.
                </p>
            </div>
        </EmailLayout>
    );
} 