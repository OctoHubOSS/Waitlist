import { absoluteUrl } from '@/utils/urlBuilder/absoluteUrl';
import { sendPasswordResetEmail, sendTwoFactorEmail, sendVerificationEmail as sendEmailVerification } from './account';
import { VerificationType, generateVerificationCode, createVerificationRecord, verifyCode, deleteVerificationRecords } from './verification/code';

export type { VerificationType };
export { verifyCode };

export interface VerificationOptions {
    type: VerificationType;
    email: string;
    name: string;
    userId?: string;
    expiresIn?: number;
}

/**
 * Sends a verification email
 */
export async function sendVerificationEmail(options: VerificationOptions) {
    const { type, email, name, userId, expiresIn = 3600 } = options;
    const code = generateVerificationCode();

    // Create verification record
    await createVerificationRecord(email, code, type, userId, expiresIn);

    // Send email based on type
    switch (type) {
        case 'email':
            await sendEmailVerification({
                name,
                email,
                verifyUrl: `${absoluteUrl()}/auth/verify?code=${code}&type=email&email=${encodeURIComponent(email)}`,
                code,
                expiresIn: '1 hour'
            });
            break;
        case 'password':
            await sendPasswordResetEmail({
                name,
                email,
                resetUrl: `${absoluteUrl()}/auth/verify?code=${code}&type=password&email=${encodeURIComponent(email)}`,
                expiresIn: '1 hour'
            });
            break;
        case '2fa':
            await sendTwoFactorEmail({
                name,
                email,
                code,
                expiresIn: '5 minutes'
            });
            break;
    }
}

/**
 * Initiates the verification process
 */
export async function initiateVerification(options: VerificationOptions) {
    await sendVerificationEmail(options);
}

/**
 * Resends a verification code
 */
export async function resendVerificationCode(options: VerificationOptions) {
    // Delete any existing verification records for this email and type
    await deleteVerificationRecords(options.email, options.type);

    // Send a new verification email
    await sendVerificationEmail(options);
} 