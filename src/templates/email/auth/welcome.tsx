import React from 'react';
import EmailLayout from '@/components/EmailLayout';
import { EmailTemplateProps } from '@/lib/email/template';
import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';

type Props = EmailTemplateProps['welcome'];

export default function WelcomeEmail({ name, displayName, email }: Props) {
    const baseUrl = absoluteUrl();
    const loginUrl = `${baseUrl}/auth/login`;
    const profileUrl = `${baseUrl}/profile`;
    const dashboardUrl = `${baseUrl}/dashboard`;

    return (
        <EmailLayout preview="Welcome to OctoHub!">
            <div className="max-w-[600px] mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Welcome to OctoHub!
                </h1>

                <p className="text-gray-700 mb-6">
                    Hi {name || displayName},
                </p>

                <p className="text-gray-700 mb-6">
                    Thank you for creating your account with OctoHub. We're excited to have you on board!
                </p>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Account Details
                    </h2>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <span className="font-medium">Name:</span> {displayName}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Email:</span> {email}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-700">
                        To get started with OctoHub:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Complete your profile to help us personalize your experience</li>
                        <li>Explore our features and integrations</li>
                        <li>Connect with other developers in our community</li>
                    </ol>
                </div>

                <div className="mt-8">
                    <a
                        href={dashboardUrl}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Dashboard
                    </a>
                </div>

                <p className="text-gray-600 text-sm mt-8">
                    If you have any questions or need assistance, our support team is here to help.
                </p>
            </div>
        </EmailLayout>
    );
} 