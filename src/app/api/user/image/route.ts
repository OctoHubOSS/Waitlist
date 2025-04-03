import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { updateUserImage, deleteUserImage, UserImageData } from '@/lib/image/userImage';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { BaseApiRoute } from '@/lib/api/routes/base';
import { successResponse, errors } from '@/lib/api/responses';
import { withTimeout } from '@/lib/api/utils';
import { z } from 'zod';

/**
 * User image route for handling profile image uploads and deletions
 */
class UserImageRoute extends BaseApiRoute<any> {
    constructor() {
        // Use an empty schema since we're handling formData manually
        super(z.any());
    }

    async handle(request: NextRequest): Promise<Response> {
        const method = request.method.toUpperCase();
        
        try {
            switch (method) {
                case 'POST':
                    return await withTimeout(this.handleUpload(request), 15000);
                case 'DELETE':
                    return await withTimeout(this.handleDelete(request), 5000);
                default:
                    return this.methodNotAllowed(request);
            }
        } catch (error) {
            console.error('Error in user image operation:', error);
            
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Request timed out');
            }
            
            return this.handleError(error);
        }
    }

    /**
     * Handle image upload
     */
    private async handleUpload(request: NextRequest): Promise<Response> {
        try {
            // Check authentication
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to upload an image');
            }

            // Parse form data
            const formData = await request.formData();
            const file = formData.get('image') as File;

            if (!file) {
                return errors.badRequest('No image provided');
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                return errors.badRequest('Invalid file type. Supported types: JPEG, PNG, GIF, WebP');
            }

            // Validate file size (max 5MB)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return errors.badRequest('File too large. Maximum size is 5MB');
            }

            // Convert File to Buffer
            const buffer = Buffer.from(await file.arrayBuffer());

            // Process and save the image
            const imageData = await updateUserImage(session.user.id, buffer);

            // Log the successful upload
            await AuditLogger.logAuth(
                AuditAction.UPDATE_PROFILE,
                AuditStatus.SUCCESS,
                session.user.id,
                undefined,
                { 
                    action: 'profile_image_updated',
                    fileSize: file.size,
                    fileType: file.type
                },
                request
            );

            // Use the actual properties from the returned imageData
            return successResponse({
                data: imageData.data,
                format: imageData.format,
                width: imageData.width,
                height: imageData.height,
                fileSize: imageData.size
            }, 'Image uploaded successfully');
        } catch (error) {
            // Log the error
            console.error('Error uploading image:', error);
            return this.handleError(error);
        }
    }

    /**
     * Handle image deletion
     */
    private async handleDelete(request: NextRequest): Promise<Response> {
        try {
            // Check authentication
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to delete your image');
            }

            // Delete the image
            await deleteUserImage(session.user.id);

            // Log the successful deletion
            await AuditLogger.logAuth(
                AuditAction.UPDATE_PROFILE,
                AuditStatus.SUCCESS,
                session.user.id,
                undefined,
                { action: 'profile_image_deleted' },
                request
            );

            return successResponse({
                message: 'Image deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            return this.handleError(error);
        }
    }

    /**
     * Return supported HTTP methods
     */
    protected getSupportedMethods(): string[] {
        return ['POST', 'DELETE', 'OPTIONS', 'HEAD'];
    }
}

// Create a single route instance
const route = new UserImageRoute();

// Export route handlers
export const POST = route.handle.bind(route);
export const DELETE = route.handle.bind(route);
export const OPTIONS = route.methodNotAllowed.bind(route);
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);