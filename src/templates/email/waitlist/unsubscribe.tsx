import React from 'react';
import { EmailTemplateProps } from '@/lib/email/template';
import {
    Heading,
    Section,
    Text,
    Link,
} from "@react-email/components";
import EmailLayout from "@/components/EmailLayout";

type Props = EmailTemplateProps['waitlistUnsubscribe'];

export default function WaitlistUnsubscribeEmail({ email }: Props) {
    return (
        <EmailLayout preview="You have been unsubscribed from the OctoHub waitlist">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                Unsubscribed from OctoHub Waitlist
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    This email confirms that you have been successfully unsubscribed from the OctoHub waitlist ({email}).
                </Text>

                <Text className="text-gray-700 mb-4">
                    If you change your mind, you can always{' '}
                    <Link
                        href="https://octohub.dev/waitlist/subscribe"
                        className="text-blue-600 underline">
                        rejoin the waitlist
                    </Link>{' '}
                    by visiting our website.
                </Text>

                <Text className="text-gray-700 mt-6">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
} 