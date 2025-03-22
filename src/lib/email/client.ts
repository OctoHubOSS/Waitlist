import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { renderEmailTemplate } from './template';

// Template variable types
type EmailTemplateVars = {
    welcome: { name: string };
    passwordReset: { resetLink: string };
    githubLinked: { username: string };
    test: { timestamp: string };
};

// Email sender configuration
type EmailSender = {
    address: string;
    name?: string;
};

// Create the credential
const credential = new ClientSecretCredential(
    process.env.EMAIL_TENANT_ID!,
    process.env.EMAIL_CLIENT_ID!,
    process.env.EMAIL_CLIENT_SECRET!
);

// Create the authentication provider
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
});

// Create the Graph client
const graphClient = Client.initWithMiddleware({
    authProvider,
});

// Default sender configuration
const defaultSender: EmailSender = {
    address: process.env.EMAIL_FROM || 'noreply@octohub.dev',
    name: 'OctoHub',
};

// Email templates
export const emailTemplates = {
    welcome: (name: string) => ({
        subject: 'Welcome to OctoHub!',
        text: `Hi ${name},\n\nWelcome to OctoHub! We're excited to have you on board.\n\nBest regards,\nThe OctoHub Team`,
        html: renderEmailTemplate('welcome', { name }),
    }),

    passwordReset: (resetLink: string) => ({
        subject: 'Reset Your OctoHub Password',
        text: `Hello,\n\nYou requested to reset your password. Please click the following link to reset it: ${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe OctoHub Team`,
        html: renderEmailTemplate('passwordReset', { resetLink }),
    }),

    githubLinked: (username: string) => ({
        subject: 'GitHub Account Linked Successfully',
        text: `Hello,\n\nYour GitHub account (${username}) has been successfully linked to your OctoHub account.\n\nBest regards,\nThe OctoHub Team`,
        html: renderEmailTemplate('githubLinked', { username }),
    }),

    test: () => ({
        subject: 'Test Email from OctoHub',
        text: `This is a test email sent from the OctoHub API.\n\nIf you're receiving this, the email configuration is working correctly!\n\nSent at: ${new Date().toISOString()}`,
        html: renderEmailTemplate('test', { timestamp: new Date().toISOString() }),
    })
};

// Send email function
export async function sendEmail({
    to,
    subject,
    text,
    html,
    from,
}: {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: EmailSender;
}) {
    try {
        const sender = from || defaultSender;

        // Create the message
        const message = {
            subject,
            body: {
                contentType: "HTML",
                content: html,
            },
            from: {
                emailAddress: {
                    address: sender.address,
                    name: sender.name,
                },
            },
            toRecipients: Array.isArray(to)
                ? to.map(email => ({
                    emailAddress: {
                        address: email,
                    },
                }))
                : [{
                    emailAddress: {
                        address: to,
                    },
                }],
        };

        await graphClient
            .api(`/users/${sender.address}/sendMail`)
            .post({
                message,
            });

        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
