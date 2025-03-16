import nodemailer from 'nodemailer';

// Email transport configuration using MS365
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Email templates
export const emailTemplates = {
    welcome: (name: string) => ({
        subject: 'Welcome to OctoSearch!',
        text: `Hi ${name},\n\nWelcome to OctoSearch! We're excited to have you on board.\n\nBest regards,\nThe OctoSearch Team`,
        html: `<h1>Welcome to OctoSearch!</h1><p>Hi ${name},</p><p>Welcome to OctoSearch! We're excited to have you on board.</p><p>Best regards,<br>The OctoSearch Team</p>`,
    }),

    passwordReset: (resetLink: string) => ({
        subject: 'Reset Your OctoSearch Password',
        text: `Hello,\n\nYou requested to reset your password. Please click the following link to reset it: ${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe OctoSearch Team`,
        html: `<h1>Reset Your Password</h1><p>Hello,</p><p>You requested to reset your password. Please click the button below to reset it:</p><p><a href="${resetLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p><p>If you didn't request this, please ignore this email.</p><p>Best regards,<br>The OctoSearch Team</p>`,
    }),

    githubLinked: (username: string) => ({
        subject: 'GitHub Account Linked Successfully',
        text: `Hello,\n\nYour GitHub account (${username}) has been successfully linked to your OctoSearch account.\n\nBest regards,\nThe OctoSearch Team`,
        html: `<h1>GitHub Account Linked</h1><p>Hello,</p><p>Your GitHub account (<strong>${username}</strong>) has been successfully linked to your OctoSearch account.</p><p>Best regards,<br>The OctoSearch Team</p>`,
    })
};

// Send email function
export async function sendEmail({
    to,
    subject,
    text,
    html,
}: {
    to: string;
    subject: string;
    text: string;
    html: string;
}) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'accounts@octoflow.com',
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
