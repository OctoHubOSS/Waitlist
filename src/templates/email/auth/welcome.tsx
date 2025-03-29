import {
    Button,
    Heading,
    Section,
    Text,
} from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface WelcomeEmailProps {
    name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
    return (
        <EmailLayout preview="Welcome to OctoHub">
            <Heading className="mb-6 text-2xl font-bold text-gray-900">
                Welcome to OctoHub!
            </Heading>

            <Section className="mb-6">
                <Text className="mb-4 text-gray-700">
                    Hello {name},
                </Text>

                <Text className="mb-4 text-gray-700">
                    Thank you for joining OctoHub! We&apos;re excited to have you on board and can&apos;t wait to
                    help you manage your GitHub repositories more efficiently.
                </Text>

                <Text className="mb-4 text-gray-700">
                    Get started by exploring our features:
                </Text>

                <Button
                    className="mb-4 rounded-md bg-blue-600 px-6 py-3 text-center text-white"
                    href="https://octohub.app/dashboard"
                >
                    Go to Dashboard
                </Button>

                <Text className="mb-4 text-gray-700">
                    If you have any questions or need assistance, don&apos;t hesitate to reach out to our support
                    team.
                </Text>

                <Text className="mt-6 text-gray-700">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}
