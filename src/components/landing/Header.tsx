'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from 'react';

export default function Header() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="text-center space-y-8">
      <motion.div
        className="relative mx-auto h-32 w-32 rounded-full  flex items-center justify-center backdrop-blur-sm border border-github-border overflow-hidden"
        whileHover={{ scale: 1.05, rotate: 360 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-github-dark-secondary opacity-50" />
        {imgError ? (
          <div className="relative z-10 text-github-accent font-bold text-3xl">OH</div>
        ) : (
          <Image
            src="/logo.webp"
            alt="OctoHub"
            width={96}
            height={96}
            quality={90}
            priority
            onError={() => setImgError(true)}
            className="relative z-10"
          />
        )}
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-6xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-github-text-secondary">
          OctoHub
        </h1>
        <p className="text-2xl font-medium text-github-text-secondary">
          The Future of Code Collaboration
        </p>
        <p className="mt-4 text-xl text-github-text-secondary max-w-2xl mx-auto">
          We're reimagining how developers collaborate, share, and build software together. A modern platform for modern teams.
        </p>
      </motion.div>
    </div>
  );
}
