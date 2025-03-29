import { renderEmailToHtml } from './renderHtml';
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { EmailTemplateProps, TemplateName } from './template';

import {
    TokenCredentialAuthenticationProvider
} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";


import {
    EmailClient,
    EmailSender,
    EmailRecipient,
    EmailTemplate,
    SendEmailOptions,
    SendEmailResult
} from '@/types/email';

/**
 * Implementation of the EmailClient interface using Microsoft Graph API
 * 
 * @class EmailClientImpl
 * @implements {EmailClient}
 * @description
 * This class provides email sending capabilities using Microsoft Graph API.
 * It implements the singleton pattern to ensure only one instance exists.
 * 
 * @example
 * // Get the email client instance
 * const client = EmailClientImpl.getInstance();
 * 
 * // Send an email
 * await client.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   text: 'Plain text content',
 *   html: '<p>HTML content</p>'
 * });
 */
class EmailClientImpl implements EmailClient {
    /**
     * Singleton instance of the email client
     * @private
     * @static
     * @type {EmailClientImpl}
     */
    private static instance: EmailClientImpl;

    /**
     * Microsoft Graph client for API calls
     * @private
     * @type {Client}
     */
    private graphClient: Client;

    /**
     * Default sender configuration
     * @private
     * @type {EmailSender}
     */
    private defaultFrom: EmailSender;

    /**
     * Creates an instance of EmailClientImpl.
     * @private
     * @constructor
     * @description
     * Initializes the Microsoft Graph client with credentials from environment variables
     * and sets up the default sender information.
     */
    private constructor() {
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
        this.graphClient = Client.initWithMiddleware({
            authProvider,
        });

        // Set default sender
        this.defaultFrom = {
            address: process.env.DEFAULT_FROM_EMAIL || 'noreply@octohub.dev',
            name: process.env.DEFAULT_FROM_NAME || 'OctoHub'
        };
    }

    /**
     * Gets the singleton instance of EmailClientImpl
     * @public
     * @static
     * @returns {EmailClientImpl} The singleton instance
     */
    public static getInstance(): EmailClientImpl {
        if (!EmailClientImpl.instance) {
            EmailClientImpl.instance = new EmailClientImpl();
        }
        return EmailClientImpl.instance;
    }

    /**
     * Collection of email template generators
     * @public
     * @type {Object}
     */
    emailTemplates = {
        /**
         * Generates a waitlist confirmation email template
         * @param {string} email - The subscriber's email address
         * @returns {EmailTemplate} The generated email template
         */
        waitlistConfirmation: (email: string): EmailTemplate => {
            const props: EmailTemplateProps['waitlistConfirmation'] = { email };
            const text = `Thank you for joining the OctoHub waitlist!\n\nYou've been added to our waitlist with the email: ${email}\n\nWe're working hard to build the next generation of code collaboration and version control. As a waitlist member, you'll be among the first to know when we launch and get exclusive early access.\n\nStay tuned for updates and exciting news about our progress!\n\nBest regards,\nThe OctoHub Team\n\nIf you didn't sign up for the OctoHub waitlist, you can safely ignore this email.`;

            return {
                subject: 'Welcome to the OctoHub Waitlist!',
                text,
                html: renderEmailToHtml('waitlistConfirmation', props)
            };
        },

        /**
         * Generates a waitlist unsubscribe confirmation email template
         * @param {string} email - The subscriber's email address
         * @returns {EmailTemplate} The generated email template
         */
        waitlistUnsubscribe: (email: string): EmailTemplate => {
            const props: EmailTemplateProps['waitlistUnsubscribe'] = { email };
            const text = `Hello,\n\nThis email confirms that you have been successfully unsubscribed from the OctoHub waitlist (${email}).\n\nIf you change your mind, you can always rejoin the waitlist by visiting our website.\n\nBest regards,\nThe OctoHub Team`;

            return {
                subject: 'Unsubscribed from OctoHub Waitlist',
                text,
                html: renderEmailToHtml('waitlistUnsubscribe', props)
            };
        }
    };

    /**
     * Sends an email using Microsoft Graph API
     * 
     * @public
     * @async
     * @param {SendEmailOptions} options - The email sending options
     * @returns {Promise<SendEmailResult>} Result of the email sending operation
     * 
     * @example
     * // Send a simple email
     * const result = await emailClient.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Hello',
     *   text: 'Plain text version',
     *   html: '<p>HTML version</p>'
     * });
     * 
     * @example
     * // Send an email to multiple recipients with a custom sender
     * const result = await emailClient.sendEmail({
     *   to: ['user1@example.com', 'user2@example.com'],
     *   subject: 'Team Update',
     *   text: 'Plain text version',
     *   html: '<p>HTML version</p>',
     *   from: {
     *     address: 'team@octohub.dev',
     *     name: 'OctoHub Team'
     *   }
     * });
     */
    async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
        try {
            const sender = options.from || this.defaultFrom;

            // Convert recipients to the correct format
            const toRecipients = Array.isArray(options.to)
                ? options.to.map(recipient => this.normalizeRecipient(recipient))
                : [this.normalizeRecipient(options.to)];

            // Create the message
            const message = {
                subject: options.subject,
                body: {
                    contentType: "HTML",
                    content: options.html,
                },
                from: {
                    emailAddress: {
                        address: sender.address,
                        name: sender.name,
                    },
                },
                toRecipients,
            };

            // Send the email using the specified sender
            await this.graphClient
                .api(`/users/${sender.address}/sendMail`)
                .post({
                    message,
                    saveToSentItems: true,
                });

            return { success: true };
        } catch (error) {
            console.error('Error sending email:', error);
            return {
                success: false,
                error: error instanceof Error ? error : new Error('Failed to send email')
            };
        }
    }

    /**
     * Normalizes recipient format for Microsoft Graph API
     * 
     * @private
     * @param {string | EmailRecipient} recipient - The recipient email or object
     * @returns {Object} Normalized recipient object for Graph API
     */
    private normalizeRecipient(recipient: string | EmailRecipient): { emailAddress: { address: string; name?: string } } {
        if (typeof recipient === 'string') {
            return {
                emailAddress: {
                    address: recipient,
                },
            };
        }
        return {
            emailAddress: {
                address: recipient.address,
                name: recipient.name,
            },
        };
    }
}

/**
 * Singleton instance of the email client
 * @type {EmailClientImpl}
 */
export const emailClient = EmailClientImpl.getInstance();

/**
 * Exported email functions for convenience
 * @type {Object}
 */
export const { sendEmail, emailTemplates } = emailClient;