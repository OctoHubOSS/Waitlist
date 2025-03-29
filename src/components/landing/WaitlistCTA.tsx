'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from 'react-icons/fa';

export default function WaitlistCTA() {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      <Link
        href="/waitlist/subscribe"
        className="inline-flex items-center px-8 py-4 rounded-lg bg-github-accent hover:bg-github-accent/90 text-white font-medium text-lg transition-colors duration-200"
      >
        Join the Waitlist
        <FaArrowRight className="ml-2" />
      </Link>
      <p className="mt-4 text-github-text-secondary">
        Be among the first to experience the future of code collaboration
      </p>
    </motion.div>
  );
}
