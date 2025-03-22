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

interface DarkEmailLayoutProps {
    preview: string;
    children: ReactNode;
    footerText?: string;
}

/**
 * Dark mode layout for email templates
 */
export default function DarkEmailLayout({ 
    preview, 
    children,
    footerText = `© ${new Date().getFullYear()} OctoHub. All rights reserved.`
}: DarkEmailLayoutProps) {
    return (
        <Html>
            <Head>
                <style>
                    {`
                    .bg-github-dark-secondary { background-color: #0d1117 !important; }
                    .bg-github-dark { background-color: #010409 !important; }
                    .text-github-text { color: #c9d1d9 !important; }
                    .text-github-text-secondary { color: #8b949e !important; }
                    .border-github-border { border-color: #30363d !important; }
                    .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
                    `}
                </style>
            </Head>
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="bg-github-dark-secondary font-sans">
                    <Container className="mx-auto py-8 px-4 max-w-[600px]">
                        {children}

                        <Section className="text-sm text-github-text-secondary border-t border-github-border pt-4 mt-8">
                            <Text>{footerText}</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
