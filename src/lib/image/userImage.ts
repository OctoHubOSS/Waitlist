import prisma from '@/lib/database';
import { processImage, validateImage, base64ToDataUrl } from './processor';

export interface UserImageData {
    data: string; // base64 encoded image
    format: string;
    width: number;
    height: number;
    size: number;
}

/**
 * Updates a user's profile image
 */
export async function updateUserImage(
    userId: string,
    imageData: string | Buffer,
    options = {}
): Promise<UserImageData> {
    // Convert to buffer if base64 string
    const buffer = Buffer.isBuffer(imageData) ? imageData : Buffer.from(imageData, 'base64');

    // Validate image
    await validateImage(buffer);

    // Process image
    const processed = await processImage(buffer, options);

    // Delete existing image if any
    await prisma.userImage.deleteMany({
        where: { userId },
    });

    // Create new image record
    const image = await prisma.userImage.create({
        data: {
            data: processed.data,
            format: processed.format,
            width: processed.width,
            height: processed.height,
            size: processed.size,
            userId,
        },
    });

    return {
        data: image.data,
        format: image.format,
        width: image.width,
        height: image.height,
        size: image.size,
    };
}

/**
 * Gets a user's profile image as a data URL
 */
export async function getUserImage(userId: string): Promise<string | null> {
    const image = await prisma.userImage.findUnique({
        where: { userId },
    });

    if (!image) {
        return null;
    }

    return base64ToDataUrl(image.data, image.format);
}

/**
 * Deletes a user's profile image
 */
export async function deleteUserImage(userId: string): Promise<void> {
    await prisma.userImage.deleteMany({
        where: { userId },
    });
}

/**
 * Gets image metadata for a user
 */
export async function getUserImageMetadata(userId: string) {
    return prisma.userImage.findUnique({
        where: { userId },
        select: {
            format: true,
            width: true,
            height: true,
            size: true,
        },
    });
} 