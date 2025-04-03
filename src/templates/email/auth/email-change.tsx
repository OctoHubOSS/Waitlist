import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

type Props = EmailTemplateProps['emailChange'];

export default function EmailChangeEmail({ name, oldEmail, newEmail, revertUrl, expiresIn }: Props) {
    const baseUrl = absoluteUrl();
    const supportUrl = `${baseUrl}/support`;
    const securityUrl = `${baseUrl}/security`;

    return (
        <EmailLayout preview="Important: Your Email Address Has Been Changed">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Email Address Change Notification
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name},
                </p>

                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-yellow-900 mb-4">
                        Email Address Change Detected
                    </h2>
                    <p className="text-yellow-700 mb-4">
                        We've detected that your email address has been changed from:
                    </p>
                    <p className="font-mono bg-yellow-100 p-3 rounded text-yellow-900 mb-4">
                        {oldEmail}
                    </p>
                    <p className="text-yellow-700 mb-4">
                        to:
                    </p>
                    <p className="font-mono bg-yellow-100 p-3 rounded text-yellow-900">
                        {newEmail}
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        If you made this change:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>No action is required</li>
                        <li>Your account will continue to work as normal</li>
                        <li>Future communications will be sent to your new email</li>
                    </ol>

                    <p className="text-gray-700">
                        If you didn't make this change:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Click the button below to revert this change</li>
                        <li>This link will expire in {expiresIn}</li>
                        <li>Contact our support team immediately</li>
                    </ol>
                </div>

                <div className="mt-8">
                    <a
                        href={revertUrl}
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Revert Email Change
                    </a>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    This is an automated security alert. If you have any questions, please contact our <a href={supportUrl} className="text-blue-600 hover:underline">support team</a> or visit our <a href={securityUrl} className="text-blue-600 hover:underline">security page</a>.
                </p>
            </div>
        </EmailLayout>
    );
} 