import {
    Button,
    Heading,
    Section,
    Text,
} from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface PasswordResetEmailProps {
    resetLink: string;
    expiresInMinutes: number;
}

export default function PasswordResetEmail({ resetLink, expiresInMinutes }: PasswordResetEmailProps) {
    return (
        <EmailLayout preview="Reset Your Password">
            <Heading className="mb-6 text-2xl font-bold text-gray-900">
                Password Reset Request
            </Heading>

            <Section className="mb-6">
                <Text className="mb-4 text-gray-700">
                    Hello,
                </Text>

                <Text className="mb-4 text-gray-700">
                    We received a request to reset your password. Click the button below to create a new password:
                </Text>

                <Button
                    className="mb-4 rounded-md bg-blue-600 px-6 py-3 text-center text-white"
                    href={resetLink}
                >
                    Reset Password
                </Button>

                <Text className="mb-4 text-gray-700">
                    If you cannot click the button above, copy and paste this URL into your browser:
                    {resetLink}
                </Text>

                <Text className="mb-4 text-gray-700">
                    This link will expire in {expiresInMinutes} minutes. If you did not request a password reset,
                    please ignore this email.
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
