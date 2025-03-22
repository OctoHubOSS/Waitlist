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
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
                GitHub Account Linked
            </Heading>

            <Section className="mb-6">
                <Text className="text-gray-700 mb-4">
                    Hello,
                </Text>

                <Text className="text-gray-700 mb-4">
                    Your GitHub account with username <strong>{username}</strong> has been successfully linked to your OctoHub account.
                </Text>

                <Text className="text-gray-700 mb-4">
                    You can now use GitHub features within OctoHub and manage your repositories directly from our platform.
                </Text>

                <Text className="text-gray-700 mb-4">
                    If you did not link this GitHub account to your OctoHub account, please contact our support team immediately.
                </Text>

                <Text className="text-gray-700 mt-6">
                    Best regards,<br />
                    The OctoHub Team
                </Text>
            </Section>
        </EmailLayout>
    );
}
