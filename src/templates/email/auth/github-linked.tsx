import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import EmailLayout from "../../../components/EmailLayout";

interface GithubLinkedEmailProps {
    username: string;
}

export default function GithubLinkedEmail({ username }: GithubLinkedEmailProps) {
    return (
        <EmailLayout preview="GitHub Account Linked Successfully">
            <Heading className="mb-6 text-2xl font-bold text-gray-900">
                GitHub Account Linked
            </Heading>

            <Section className="mb-6">
                <Text className="mb-4 text-gray-700">
                    Hello,
                </Text>

                <Text className="mb-4 text-gray-700">
                    Your GitHub account with username <strong>{username}</strong> has been successfully linked to your OctoHub account.
                </Text>

                <Text className="mb-4 text-gray-700">
                    You can now use GitHub features within OctoHub and manage your repositories directly from our platform.
                </Text>

                <Text className="mb-4 text-gray-700">
                    If you did not link this GitHub account to your OctoHub account, please contact our support team immediately.
                </Text>

                <Text className="mt-6 text-gray-700">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}
