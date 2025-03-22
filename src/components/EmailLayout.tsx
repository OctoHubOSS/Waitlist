import { Tailwind } from "@react-email/tailwind";
import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { ReactNode } from "react";

interface EmailLayoutProps {
    preview: string;
    children: ReactNode;
    footerText?: string;
}

/**
 * Standard layout for all email templates
 * Provides consistent styling and structure across emails
 */
export default function EmailLayout({ 
    preview, 
    children,
    footerText = `© ${new Date().getFullYear()} OctoHub. All rights reserved.`
}: EmailLayoutProps) {
    return (
        <Html>
            <Head>
                <style>
                    {`
                    .bg-github-dark-secondary { background-color: #0d1117 !important; }
                    .bg-github-dark { background-color: #010409 !important; }
                    .bg-white { background-color: #ffffff !important; }
                    .text-github-text { color: #c9d1d9 !important; }
                    .text-github-text-secondary { color: #8b949e !important; }
                    .text-gray-700 { color: #374151 !important; }
                    .text-gray-600 { color: #4b5563 !important; }
                    .text-gray-500 { color: #6b7280 !important; }
                    .border-github-border { border-color: #30363d !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .bg-blue-600 { background-color: #2563eb !important; }
                    .text-white { color: #ffffff !important; }
                    .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
                    `}
                </style>
            </Head>
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="font-sans">
                    <Container className="mx-auto py-8 px-4 max-w-[600px]">
                        {children}

                        <Section className="text-sm text-gray-500 border-t border-gray-200 pt-4 mt-8">
                            <Text>{footerText}</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
