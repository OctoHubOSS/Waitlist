import {
    Heading,
    Section,
    Text,
    Button,
} from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface PasswordResetEmailProps {
    resetLink: string;
}

export default function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
    return (
        <EmailLayout preview="Reset Your OctoHub Password">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                Password Reset Request
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    Hello,
                </Text>

                <Text className="text-gray-700 mb-4">
                    We received a request to reset your OctoHub password. Click the button below to reset your password:
                </Text>

                <Button 
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    href={resetLink}>
                    Reset Your Password
                </Button>

                <Text className="text-gray-700 mt-4">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </Text>

                <Text className="text-gray-600 text-sm mt-4">
                    This link will expire in 24 hours.
                </Text>

                <Text className="text-gray-700 mt-6">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}
