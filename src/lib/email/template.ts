import React, { ComponentType } from 'react';
import WaitlistConfirmationEmail from '@/templates/email/waitlist/confirmation';
import WaitlistUnsubscribeEmail from '@/templates/email/waitlist/unsubscribe';
import WelcomeEmail from '@/templates/email/auth/welcome';
import AccountLockdownEmail from '@/templates/email/auth/account-lockdown';
import PasswordResetEmail from '@/templates/email/auth/password-reset';
import ForgotPasswordEmail from '@/templates/email/auth/forgot-password';
import VerifyEmailEmail from '@/templates/email/auth/verify-email';
import EmailChangeEmail from '@/templates/email/auth/email-change';
import TwoFactorEmail from '@/templates/email/auth/two-factor';

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
  welcome: {
    name: string;
    displayName: string;
    email: string;
  };
  accountLockdown: {
    name: string;
    email: string;
    ip: string;
    timestamp: string;
    unlockUrl: string;
  };
  passwordReset: {
    name: string;
    email: string;
    resetUrl: string;
    expiresIn: string;
  };
  forgotPassword: {
    name: string;
    email: string;
    resetUrl: string;
    expiresIn: string;
  };
  verifyEmail: {
    name: string;
    verifyUrl: string;
    code: string;
    email: string;
    expiresIn: string;
  };
  emailChange: {
    name: string;
    oldEmail: string;
    newEmail: string;
    revertUrl: string;
    expiresIn: string;
  };
  twoFactor: {
    name: string;
    email: string;
    code: string;
    expiresIn: string;
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
  welcome: WelcomeEmail,
  accountLockdown: AccountLockdownEmail,
  passwordReset: PasswordResetEmail,
  forgotPassword: ForgotPasswordEmail,
  verifyEmail: VerifyEmailEmail,
  emailChange: EmailChangeEmail,
  twoFactor: TwoFactorEmail,
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