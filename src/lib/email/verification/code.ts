import prisma from '@/lib/database';
import { nanoid } from 'nanoid';

export type VerificationType = 'email' | 'password' | '2fa';

export interface VerificationResult {
    success: boolean;
    error?: string;
    userId?: string | null;
}

/**
 * Generates a verification code
 */
export function generateVerificationCode(): string {
    return nanoid(6).toUpperCase();
}

/**
 * Creates a verification record in the database
 */
export async function createVerificationRecord(
    email: string,
    code: string,
    type: VerificationType,
    userId?: string,
    expiresIn: number = 3600
) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return prisma.verification.create({
        data: {
            email,
            code,
            type,
            userId,
            expiresAt,
        },
    });
}

/**
 * Verifies a code against a database record
 */
export async function verifyCode(
    email: string,
    code: string,
    type: VerificationType
): Promise<VerificationResult> {
    const verification = await prisma.verification.findFirst({
        where: {
            email,
            code,
            type,
            expiresAt: {
                gt: new Date(),
            },
        },
    });

    if (!verification) {
        return {
            success: false,
            error: 'Invalid or expired verification code',
        };
    }

    // Delete the verification record
    await prisma.verification.delete({
        where: { id: verification.id },
    });

    return {
        success: true,
        userId: verification.userId,
    };
}

/**
 * Deletes any existing verification records for an email and type
 */
export async function deleteVerificationRecords(
    email: string,
    type: VerificationType
) {
    await prisma.verification.deleteMany({
        where: {
            email,
            type,
        },
    });
} 