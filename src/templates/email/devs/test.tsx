import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import Code from "@/components/ui/Code";
import DarkEmailLayout from "@/components/DarkEmailLayout";

interface TestEmailProps {
    timestamp: string;
}

export default function TestEmail({ timestamp }: TestEmailProps) {
    return (
        <DarkEmailLayout preview="OctoHub Test Email">
            <Heading className="text-2xl font-bold text-github-text mb-6">
                OctoHub Test Email
            </Heading>

            <Section className="mb-6">
                <Text className="text-github-text mb-4">
                    Beep boop boop beep, our email configuration is setup and working as expected. GG!
                </Text>

                <Section className="bg-github-dark p-4 rounded-lg mb-4 border border-github-border">
                    <Text className="text-github-text-secondary">
                        <strong>Generated at:</strong> {new Date(timestamp).toLocaleString()}
                    </Text>

                    <Code className="mt-4 text-sm font-mono bg-github-dark p-3 rounded border border-github-border text-github-text">
                        {`{ 
                              "success": true,
                              "environment": "${process.env.NODE_ENV || 'development'}",
                              "timestamp": "${timestamp}"
                        }`}
                    </Code>

                    <Text className="text-github-text-secondary mt-4">
                        You can also use inline <Code>code snippets</Code> for variables like <Code>NODE_ENV</Code>.
                    </Text>
                </Section>

                <Text className="text-github-text mt-4">
                    If you're receiving this, it means your email delivery system is configured correctly.
                </Text>
            </Section>
        </DarkEmailLayout>
    );
}