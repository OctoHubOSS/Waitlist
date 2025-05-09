import React, { ComponentType } from 'react';
import WaitlistConfirmationEmail from '@/templates/email/waitlist/confirmation';
import WaitlistUnsubscribeEmail from '@/templates/email/waitlist/unsubscribe';

/**
 * Props for each email template type
 */
export type EmailTemplateProps = {
  waitlistConfirmation: {
    email: string;
  };
  waitlistUnsubscribe: {
    email: string;
  };
};

interface LoginFailedEmailProps {
  email: string;
  attempts: number;
  maxAttempts: number;
  cooldownMinutes: number;
}

/**
 * A mapping of template names to their corresponding React components
 * Each component is typed to accept the props defined in EmailTemplateProps
 */
const templateComponents: {
  [K in keyof EmailTemplateProps]: ComponentType<EmailTemplateProps[K]>
} = {
  waitlistConfirmation: WaitlistConfirmationEmail,
  waitlistUnsubscribe: WaitlistUnsubscribeEmail,
};

/**
 * Valid email template names that can be used to create email elements
 * @type {string} - A union type of all available email template keys
 */
export type TemplateName = keyof typeof templateComponents;

/**
 * Creates a React element for an email template
 * 
 * @template T - The email template name (must be a valid TemplateName)
 * @param {T} templateName - The name of the email template to create
 * @param {EmailTemplateProps[T]} props - The props to pass to the email template component
 * @returns {React.ReactElement} - A React element for the specified email template
 * @throws {Error} - Throws if the template name doesn't match any available templates
 */
export function createEmailElement<T extends TemplateName>(
  templateName: T,
  props: EmailTemplateProps[T]
) {
  const TemplateComponent = templateComponents[templateName];

  if (!TemplateComponent) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  return React.createElement(TemplateComponent, props);
}