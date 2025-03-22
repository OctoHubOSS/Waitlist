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
            address: process.env.FROM_EMAIL || 'noreply@octohub.dev',
            name: process.env.FROM_NAME || 'OctoHub'
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
         * Generates a welcome email template
         * @param {string} name - The recipient's name
         * @returns {EmailTemplate} The generated email template
         */
        welcome: (name: string): EmailTemplate => {
            const props: EmailTemplateProps['welcome'] = { name };
            const text = `Hi ${name},\n\nWelcome to OctoHub! We're excited to have you on board.\n\nBest regards,\nThe OctoHub Team`;
            
            return {
                subject: 'Welcome to OctoHub!',
                text,
                html: renderEmailToHtml('welcome', props)
            };
        },

        /**
         * Generates a password reset email template
         * @param {string} resetLink - The password reset link
         * @returns {EmailTemplate} The generated email template
         */
        passwordReset: (resetLink: string): EmailTemplate => {
            const props: EmailTemplateProps['passwordReset'] = { resetLink };
            const text = `Hello,\n\nYou requested to reset your password. Please click the following link to reset it: ${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe OctoHub Team`;
            
            return {
                subject: 'Reset Your OctoHub Password',
                text,
                html: renderEmailToHtml('passwordReset', props)
            };
        },

        /**
         * Generates a GitHub account linked email template
         * @param {string} username - The GitHub username that was linked
         * @returns {EmailTemplate} The generated email template
         */
        githubLinked: (username: string): EmailTemplate => {
            const props: EmailTemplateProps['githubLinked'] = { username };
            const text = `Hello,\n\nYour GitHub account (${username}) has been successfully linked to your OctoHub account.\n\nBest regards,\nThe OctoHub Team`;
            
            return {
                subject: 'GitHub Account Linked Successfully',
                text,
                html: renderEmailToHtml('githubLinked', props)
            };
        },

        /**
         * Generates a test email template
         * @returns {EmailTemplate} The generated email template
         */
        test: (): EmailTemplate => {
            const timestamp = new Date().toISOString();
            const props: EmailTemplateProps['test'] = { timestamp };
            const text = `Beep boop boop beep, our email configuration is setup and working as expected. GG!`;
            
            return {
                subject: 'OctoHub Test Email',
                text,
                html: renderEmailToHtml('test', props)
            };
        },

        /**
         * Generates a login failed email template
         * @param {Object} params - The parameters for the login failed email
         * @param {string} params.name - The user's name
         * @param {string} params.ipAddress - The IP address of the failed login attempt
         * @param {string} params.userAgent - The user agent of the device used
         * @param {string} params.timestamp - The timestamp of the failed login
         * @returns {EmailTemplate} The generated email template
         */
        loginFailed: (params: EmailTemplateProps['loginFailed']): EmailTemplate => {
            const { name, ipAddress, userAgent, timestamp } = params;
            const text = `Hello ${name},\n\nWe detected a failed login attempt for your account.\n\nIP Address: ${ipAddress}\nDevice: ${userAgent}\nTime: ${new Date(timestamp).toLocaleString()}\n\nIf this wasn't you, please change your password immediately.\n\nBest regards,\nThe OctoHub Team`;
            
            return {
                subject: 'Security Alert: Failed Login Attempt',
                text,
                html: renderEmailToHtml('loginFailed', params)
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