import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

type Props = EmailTemplateProps['passwordReset'];

export default function PasswordResetEmail({ name, resetUrl, expiresIn }: Props) {
    const baseUrl = absoluteUrl();
    const supportUrl = `${baseUrl}/support`;
    const securityUrl = `${baseUrl}/security`;

    return (
        <EmailLayout preview="Reset Your OctoHub Password">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Password Reset Request
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name},
                </p>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">
                        Reset Your Password
                    </h2>
                    <p className="text-blue-700">
                        We received a request to reset your password. This link will expire in {expiresIn}.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        To reset your password:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click the button below to create a new password</li>
                        <li>Choose a strong password that you haven't used before</li>
                        <li>Make sure to save your new password securely</li>
                    </ol>

                    <p className="text-gray-700">
                        If you didn't request this password reset:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Ignore this email</li>
                        <li>Your password will remain unchanged</li>
                        <li>Contact our support team if you have concerns</li>
                    </ol>
                </div>

                <div className="mt-8">
                    <a
                        href={resetUrl}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Reset Password
                    </a>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    This is an automated message. If you have any questions, please contact our <a href={supportUrl} className="text-blue-600 hover:underline">support team</a> or visit our <a href={securityUrl} className="text-blue-600 hover:underline">security page</a>.
                </p>
            </div>
        </EmailLayout>
    );
} 