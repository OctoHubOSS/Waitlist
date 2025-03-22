import { Heading, Section, Text } from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface LoginFailedEmailProps {
    name: string;
    ipAddress: string;
    userAgent: string;
    timestamp: string;
}

export default function LoginFailedEmail({
    name,
    ipAddress,
    userAgent,
    timestamp,
}: LoginFailedEmailProps) {
    return (
        <EmailLayout 
            preview="Failed Login Attempt Detected" 
            footerText="This is an automated message, please do not reply to this email.">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                Failed Login Attempt Detected
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    Hello {name},
                </Text>

                <Text className="text-gray-700 mb-4">
                    We detected a failed login attempt for your account. Here are the details:
                </Text>

                <Section className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Text className="text-gray-600 mb-2">
                        <strong>IP Address:</strong> {ipAddress}
                    </Text>
                    <Text className="text-gray-600 mb-2">
                        <strong>Device:</strong> {userAgent}
                    </Text>
                    <Text className="text-gray-600">
                        <strong>Time:</strong> {new Date(timestamp).toLocaleString()}
                    </Text>
                </Section>

                <Text className="text-gray-700 mb-4">
                    If this was you, you can ignore this email. If you didn't attempt to log in, we recommend:
                </Text>

                <ul className="list-disc pl-6 text-gray-700 mb-4">
                    <li>Changing your password immediately</li>
                    <li>Enabling two-factor authentication if not already enabled</li>
                    <li>Checking your account for any unauthorized activity</li>
                    <li>Contacting our support team if you have concerns</li>
                </ul>

                <Text className="text-gray-700">
                    Stay safe!
                </Text>
            </Section>
        </EmailLayout>
    );
}