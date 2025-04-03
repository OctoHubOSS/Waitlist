import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

type Props = EmailTemplateProps['twoFactor'];

export default function TwoFactorEmail({ name, code, expiresIn }: Props) {
    const baseUrl = absoluteUrl();
    const supportUrl = `${baseUrl}/support`;
    const securityUrl = `${baseUrl}/security`;

    return (
        <EmailLayout preview="Your OctoHub Two-Factor Authentication Code">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Two-Factor Authentication Code
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name},
                </p>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">
                        Your Authentication Code
                    </h2>
                    <p className="text-blue-700 mb-4">
                        Use the following code to complete your login:
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <p className="font-mono text-2xl text-center text-blue-900 tracking-wider">
                            {code}
                        </p>
                    </div>
                    <p className="text-blue-700 mt-4">
                        This code will expire in {expiresIn}.
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        To complete your login:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Enter this code in the login form</li>
                        <li>If you don't see the login form, return to the previous tab</li>
                        <li>Make sure to enter the code before it expires</li>
                    </ol>

                    <p className="text-gray-700">
                        If you didn't request this code:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Do not enter this code</li>
                        <li>Contact our support team immediately</li>
                        <li>Review your account security settings</li>
                    </ol>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    This is an automated message. If you have any questions, please contact our <a href={supportUrl} className="text-blue-600 hover:underline">support team</a> or visit our <a href={securityUrl} className="text-blue-600 hover:underline">security page</a>.
                </p>
            </div>
        </EmailLayout>
    );
} 