import React from 'react';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';
import { generateNotFoundMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import BackButton from '@/components/ui/BackButton';

export const metadata: Metadata = generateNotFoundMetadata();

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-github-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-6 bg-github-dark-secondary border border-github-border rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-6 py-6 px-4">
          <div className="rounded-full bg-amber-100 p-3">
            <FiAlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-github-text-secondary">
              The page you were looking for doesn&apos;t exist or you may not have access to it.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <BackButton />
            
            <Link href="/" className="flex-1">
              <button className="w-full py-2 px-4 bg-github-accent text-white rounded-md hover:bg-github-accent/90 transition-colors">
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
