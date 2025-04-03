import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
    currentImage?: string | null;
    onImageChange?: (image: string | File) => void;
    onImageDelete?: () => void;
    maxSize?: number; // in MB
    maxWidth?: number;
    maxHeight?: number;
    className?: string;
    mode?: 'authenticated' | 'unauthenticated';
}

export function ImageUpload({
    currentImage,
    onImageChange,
    onImageDelete,
    maxSize = 5,
    maxWidth = 400,
    maxHeight = 400,
    className = '',
    mode = 'authenticated',
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`Image size must be less than ${maxSize}MB`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            setPreview(dataUrl);
            // In unauthenticated mode, pass the file directly
            if (mode === 'unauthenticated') {
                onImageChange?.(file);
            } else {
                onImageChange?.(dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        setIsUploading(true);
        try {
            if (mode === 'authenticated') {
                const response = await fetch('/api/user/image', {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }
            }

            setPreview(null);
            onImageDelete?.();
            toast.success('Image deleted successfully');
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {preview ? (
                <div className="relative group">
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Profile"
                            width={maxWidth}
                            height={maxHeight}
                            className="rounded-lg object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <Upload className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isUploading}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Click to upload
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                Max {maxSize}MB
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
} 