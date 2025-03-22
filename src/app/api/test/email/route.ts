import { NextResponse } from "next/server";
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

export async function POST() {
    try {
        // Create the credential
        const credential = new ClientSecretCredential(
            process.env.AZURE_APP_TENANT_ID!,
            process.env.AZURE_APP_CLIENT_ID!,
            process.env.AZURE_APP_CLIENT_SECRET!
        );

        // Create the authentication provider
        const authProvider = new TokenCredentialAuthenticationProvider(credential, {
            scopes: ["https://graph.microsoft.com/.default"],
        });

        // Create the Graph client
        const graphClient = Client.initWithMiddleware({
            authProvider,
        });

        // Get recipients from environment variable and split into array
        const recipients = process.env.EMAIL_TO?.split(',').map(email => email.trim()) || [];

        if (recipients.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No email recipients configured",
                error: "EMAIL_TO environment variable is empty or not set"
            }, { status: 400 });
        }

        // Create the message
        const message = {
            subject: "Test Email from OctoHub",
            body: {
                contentType: "HTML",
                content: `
                    <h1>Test Email</h1>
                    <p>This is a test email sent from the OctoHub API.</p>
                    <p>If you're receiving this, the email configuration is working correctly!</p>
                    <p>Sent at: ${new Date().toISOString()}</p>
                `,
            },
            toRecipients: recipients.map(email => ({
                emailAddress: {
                    address: email,
                },
            })),
        };

        // Send the email using the shared mailbox
        await graphClient
            .api("/users/accounts@octohub.dev/sendMail")
            .post({
                message,
            });

        return NextResponse.json({
            success: true,
            message: "Test email sent successfully",
            recipients: recipients
        });
    } catch (error) {
        console.error("Error sending test email:", error);

        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const errorDetails = {
            success: false,
            message: "Failed to send test email",
            error: errorMessage,
            details: {
                isAuthError: errorMessage.toLowerCase().includes("auth"),
                isConfigError: errorMessage.toLowerCase().includes("config"),
                isConnectionError: errorMessage.toLowerCase().includes("connection"),
            }
        };

        return NextResponse.json(errorDetails, { status: 500 });
    }
}         