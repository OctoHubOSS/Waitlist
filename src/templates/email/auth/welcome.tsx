import {
    Heading,
    Section,
    Text,
    Button,
} from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface WelcomeEmailProps {
    name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
    return (
        <EmailLayout preview="Welcome to OctoHub!">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                Welcome to OctoHub!
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    Hi {name},
                </Text>

                <Text className="text-gray-700 mb-4">
                    We're excited to have you on board with OctoHub! Your account has been successfully created.
                </Text>

                <Button 
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    href="https://app.octohub.dev/dashboard">
                    Go to Dashboard
                </Button>

                <Text className="text-gray-700 mt-4">
                    If you have any questions, feel free to reach out to our support team.
                </Text>

                <Text className="text-gray-700 mt-6">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}
