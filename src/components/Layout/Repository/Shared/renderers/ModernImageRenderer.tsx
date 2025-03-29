import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

// Use the same interface as ImageRenderer for consistency
interface ModernImageRendererProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function ModernImageRenderer({ src, alt = '', className }: ModernImageRendererProps) {
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
