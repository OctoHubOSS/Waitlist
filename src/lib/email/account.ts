import { emailClient } from './client';
import { renderEmailToHtml } from './renderHtml';
import { EmailTemplateProps } from './template';

const ACCOUNT_FROM = {
    address: 'accounts@octohub.dev',
    name: 'OctoHub Accounts'
};

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(props: EmailTemplateProps['welcome']) {
    const html = await renderEmailToHtml('welcome', props);

    await emailClient.sendEmail({
        to: props.email,
        subject: 'Welcome to OctoHub!',
        text: `Welcome to OctoHub, ${props.name || props.displayName}!`,
        html,
        from: ACCOUNT_FROM
    });
}

/**
 * Sends an account lockdown notification email
 */
export async function sendAccountLockdownEmail(props: EmailTemplateProps['accountLockdown']) {
    const html = await renderEmailToHtml('accountLockdown', props);

    await emailClient.sendEmail({
        to: props.email,
        subject: 'Important: Your Account Has Been Locked',
        text: `Your OctoHub account has been temporarily locked due to multiple failed login attempts.`,
        html,
        from: ACCOUNT_FROM
    });
}

/**
 * Sends an email change notification
 */
export async function sendEmailChangeEmail(props: EmailTemplateProps['emailChange']) {
    const html = await renderEmailToHtml('emailChange', props);

    await emailClient.sendEmail({
        to: props.oldEmail,
        subject: 'Important: Your Email Address Has Been Changed',
        text: `Your OctoHub account email has been changed from ${props.oldEmail} to ${props.newEmail}.`,
        html,
        from: ACCOUNT_FROM
    });
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(props: EmailTemplateProps['passwordReset']) {
    const html = await renderEmailToHtml('passwordReset', props);

    await emailClient.sendEmail({
        to: props.email,
        subject: 'Reset Your OctoHub Password',
        text: `You requested to reset your OctoHub password. This link will expire in ${props.expiresIn}.`,
        html,
        from: ACCOUNT_FROM
    });
}

/**
 * Sends a two-factor authentication code email
 */
export async function sendTwoFactorEmail(props: EmailTemplateProps['twoFactor']) {
    const html = await renderEmailToHtml('twoFactor', props);

    await emailClient.sendEmail({
        to: props.email,
        subject: 'Your OctoHub Two-Factor Authentication Code',
        text: `Your two-factor authentication code is: ${props.code}. This code will expire in ${props.expiresIn}.`,
        html,
        from: ACCOUNT_FROM
    });
}

/**
 * Sends an email verification email
 */
export async function sendVerificationEmail(props: EmailTemplateProps['verifyEmail']) {
    const html = await renderEmailToHtml('verifyEmail', props);

    await emailClient.sendEmail({
        to: props.email,
        subject: 'Verify your email address',
        text: `Your verification code is: ${props.code}. This code will expire in ${props.expiresIn}.`,
        html,
        from: ACCOUNT_FROM
    });
} 