import sharp from 'sharp';
import { Buffer } from 'buffer';

export interface ProcessedImage {
    data: string; // base64 encoded image
    width: number;
    height: number;
    size: number;
    format: string;
}

export interface ImageProcessingOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
    format: 'webp',
};

/**
 * Processes an image by:
 * 1. Resizing if needed
 * 2. Converting to the specified format
 * 3. Compressing
 * 4. Converting to base64
 */
export async function processImage(
    input: Buffer | string,
    options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
    try {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        // If input is base64, convert to buffer
        const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'base64');

        // Process image with sharp
        const processed = await sharp(buffer)
            .resize(opts.maxWidth, opts.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .toFormat(opts.format || 'webp', { quality: opts.quality })
            .toBuffer();

        // Get image metadata
        const metadata = await sharp(processed).metadata();

        if (!metadata.width || !metadata.height || !metadata.format) {
            throw new Error('Failed to process image: Invalid metadata');
        }

        return {
            data: processed.toString('base64'),
            width: metadata.width,
            height: metadata.height,
            size: processed.length,
            format: metadata.format,
        };
    } catch (error) {
        console.error('Image processing error:', error);
        throw new Error('Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Validates an image by checking:
 * 1. File size
 * 2. Dimensions
 * 3. Format
 */
export async function validateImage(
    buffer: Buffer,
    maxSize: number = 5 * 1024 * 1024, // 5MB
    maxDimension: number = 2000
): Promise<boolean> {
    try {
        if (buffer.length > maxSize) {
            throw new Error(`Image size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }

        // Check dimensions using sharp
        const metadata = await sharp(buffer).metadata();
        if (metadata.width && metadata.width > maxDimension) {
            throw new Error(`Image width exceeds ${maxDimension}px limit`);
        }
        if (metadata.height && metadata.height > maxDimension) {
            throw new Error(`Image height exceeds ${maxDimension}px limit`);
        }

        // Check format
        const validFormats = ['jpeg', 'png', 'webp'];
        if (!metadata.format || !validFormats.includes(metadata.format)) {
            throw new Error('Invalid image format. Supported formats: JPEG, PNG, WebP');
        }

        return true;
    } catch (error) {
        console.error('Image validation error:', error);
        throw new Error('Failed to validate image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Converts a base64 image to a data URL
 */
export function base64ToDataUrl(base64: string, format: string): string {
    return `data:image/${format};base64,${base64}`;
}

/**
 * Extracts base64 data from a data URL
 */
export function dataUrlToBase64(dataUrl: string): string {
    const matches = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid data URL format');
    }
    return matches[1];
} 