'use client';

import { motion } from "framer-motion";
import Header from "@/components/landing/Header";
import Countdown from "@/components/landing/Countdown";
import Features from "@/components/landing/Features";
import FAQ from "@/components/landing/FAQ";
import SocialLinks from "@/components/landing/SocialLinks";
import WaitlistCTA from "@/components/landing/WaitlistCTA";
import Background from "@/components/landing/Background";

export default function ComingSoonPage() {
  return (
    <div className="container mx-auto">
      <div className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative z-10 w-full max-w-4xl space-y-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Title Section */}
          <Header />

          {/* Countdown Timer */}
          <Countdown />

          {/* Features Section */}
          <section id="features" className="w-full py-16">
            <Features />
          </section>

          {/* FAQ Section */}
          <section id="faq" className="w-full py-16">
            <FAQ />
          </section>

          {/* Social Links */}
          <SocialLinks />

          {/* Subscribe Button */}
          <WaitlistCTA />
        </motion.div>
      </div>
    </div>
  );
}
