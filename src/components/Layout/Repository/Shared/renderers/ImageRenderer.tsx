import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface ImageRendererProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ImageRenderer({ src, alt = '', className }: ImageRendererProps) {
  // If image is from external source, use Image component with domains configured in next.config.js
  if (src.startsWith('http')) {
    return (
      <div className={cn('relative overflow-hidden rounded-md', className)}>
        <Image 
          src={src} 
          alt={alt} 
          width={800} 
          height={600} 
          className="max-w-full h-auto"
          style={{ objectFit: 'contain' }}
          unoptimized={!src.startsWith('https://github.com') && !src.startsWith('https://raw.githubusercontent.com')}
        />
      </div>
    );
  }

  // For local repository images, we need to handle them differently
  return (
    <div className={cn('overflow-hidden rounded-md', className)}>
      <Image 
        src={src} 
        alt={alt} 
        width={800} 
        height={600} 
        className="max-w-full h-auto"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
