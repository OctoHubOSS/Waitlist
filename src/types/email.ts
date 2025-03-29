// Email sender configuration
export interface EmailSender {
    address: string;
    name?: string;
}

// Email recipient configuration
export interface EmailRecipient {
    address: string;
    name?: string;
}

// Email template variables
export interface EmailTemplateVars {
    waitlistConfirmation: {
        email: string;
        text: string;
    };
}

// Email template result
export interface EmailTemplate {
    subject: string;
    text: string;
    html: string;
}

// Email send options
export interface SendEmailOptions {
    to: string | string[] | EmailRecipient | EmailRecipient[];
    subject: string;
    text: string;
    html: string;
    from?: EmailSender;
}

// Email send result
export interface SendEmailResult {
    success: boolean;
    error?: Error;
}

// Email client configuration
export interface EmailClientConfig {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    defaultFrom?: EmailSender;
}

// Email client interface
export interface EmailClient {
    sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
    emailTemplates: {
        waitlistConfirmation: (email: string) => EmailTemplate;
        waitlistUnsubscribe: (email: string) => EmailTemplate;
    };
}