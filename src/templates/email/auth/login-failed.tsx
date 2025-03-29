import { Button, Heading, Section, Text } from "@react-email/components";

import EmailLayout from "../../../components/EmailLayout";

interface LoginFailedEmailProps {
    email: string;
    attempts: number;
    maxAttempts: number;
    cooldownMinutes: number;
}

export default function LoginFailedEmail({
    email,
    attempts,
    maxAttempts,
    cooldownMinutes,
}: LoginFailedEmailProps) {
    return (
        <EmailLayout preview="Failed Login Attempt Alert">
            <Heading className="mb-6 text-2xl font-bold text-gray-900">Failed Login Attempt</Heading>

            <Section className="mb-6">
                <Text className="mb-4 text-gray-700">Hello,</Text>

                <Text className="mb-4 text-gray-700">
                    We detected {attempts} failed login {attempts === 1 ? "attempt" : "attempts"} for your account
                    ({email}).
                </Text>

                <Text className="mb-4 text-gray-700">
                    For security reasons, after {maxAttempts} failed attempts, your account will be temporarily
                    locked for {cooldownMinutes} minutes.
                </Text>

                <Text className="mb-4 text-gray-700">
                    If you did not attempt to log in, we recommend resetting your password immediately:
                </Text>

                <Button
                    className="mb-4 rounded-md bg-blue-600 px-6 py-3 text-center text-white"
                    href="https://octohub.app/auth/reset-password"
                >
                    Reset Password
                </Button>

                <Text className="mb-4 text-gray-700">
                    If you cannot click the button above, copy and paste this URL into your browser:
                    https://octohub.app/auth/reset-password
                </Text>

                <Text className="mt-6 text-gray-700">
                    Best regards,
                    <br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}