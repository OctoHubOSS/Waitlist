import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const deleteAccountSchema = z.object({
    password: z.string().min(1, "Password is required"),
    confirmation: z.string().min(1, "Please type 'DELETE' to confirm")
        .refine(val => val === 'DELETE', "Please type 'DELETE' to confirm"),
});

// DELETE /api/base/users/[id]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Only allow users to delete their own account
        if (session.user.id !== params.id) {
            return errors.forbidden('You can only delete your own account');
        }

        // Validate request body
        const validation = await validateBody(req, deleteAccountSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid request data', validation.error);
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: { password: true }
        });

        if (!user?.password) {
            return errors.badRequest('Cannot delete OAuth account');
        }

        // Verify password (you'll need to implement password verification)
        // const isPasswordValid = await verifyPassword(validation.data.password, user.password);
        // if (!isPasswordValid) {
        //     return errors.unauthorized('Invalid password');
        // }

        // Soft delete the user account
        await prisma.user.update({
            where: { id: params.id },
            data: {
                deletedAt: new Date(),
                email: null,
                password: null,
                // Optionally anonymize other data
                name: '[deleted]',
                displayName: null,
                bio: null,
                website: null,
                location: null,
                image: null,
                githubId: null,
                githubUsername: null,
                githubDisplayName: null,
            }
        });

        // Log the account deletion
        await prisma.userActivity.create({
            data: {
                userId: params.id,
                action: 'ACCOUNT_DELETED',
                metadata: {
                    deletedAt: new Date().toISOString()
                },
                ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
                userAgent: req.headers.get('user-agent'),
            }
        });

        return successResponse(null, 'Account deleted successfully', undefined, 204);
    } catch (error) {
        return handleApiError(error);
    }
} 