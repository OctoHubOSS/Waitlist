import React from 'react';
import { EmailTemplateProps } from '@/lib/email/template';
import {
    Heading,
    Section,
    Text,
    Link,
} from "@react-email/components";
import EmailLayout from "@/components/EmailLayout";

type Props = EmailTemplateProps['waitlistConfirmation'];

export default function WaitlistConfirmationEmail({ email }: Props) {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/waitlist/unsubscribe?email=${encodeURIComponent(email)}`;

    return (
        <EmailLayout preview="Welcome to the OctoHub Waitlist!">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                Welcome to OctoHub!
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    Thank you for joining our waitlist! We&apos;re excited to have you as one of our early supporters.
                </Text>

                <Text className="text-gray-700 mb-4">
                    You&apos;ve been added to our waitlist with the email: <strong>{email}</strong>
                </Text>

                <Text className="text-gray-700 mb-4">
                    We&apos;re working hard to build the next generation of code collaboration and version control.
                    As a waitlist member, you&apos;ll be among the first to know when we launch and get exclusive early access.
                </Text>

                <Text className="text-gray-700 mb-4">
                    Stay tuned for updates and exciting news about our progress!
                </Text>

                <Text className="text-gray-700 mt-6">
                    Best regards,<br />
                    The OctoHub Team
                </Text>

                <Text className="text-gray-500 text-sm mt-4">
                    If you didn&apos;t sign up for the OctoHub waitlist, you can safely ignore this email.
                </Text>

                <Text className="text-gray-500 text-sm mt-2">
                    To unsubscribe from the waitlist, click{' '}
                    <Link href={unsubscribeUrl} className="text-blue-600 underline">
                        here
                    </Link>
                    .
                </Text>
            </Section>
        </EmailLayout>
    );
}