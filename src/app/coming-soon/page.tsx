'use client';

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCode, FaRocket, FaArrowRight, FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useState, useEffect } from 'react';

const features = [
  {
    title: "Modern Git Platform",
    description: "A fresh take on code hosting and collaboration, built for the modern developer",
    icon: FaCode,
  },
  {
    title: "Advanced Search",
    description: "Lightning-fast code search with advanced filtering and semantic understanding",
    icon: HiSparkles,
  },
  {
    title: "Developer First",
    description: "Built with developer experience at its core, focusing on what matters most",
    icon: FaRocket,
  },
];

// FAQ items
const faqs = [
  {
    question: "What is OctoHub?",
    answer: "OctoHub is a modern Git platform designed to revolutionize how developers collaborate. We're building a next-generation code hosting and collaboration platform that focuses on developer experience, powerful features, and seamless integration with modern development workflows."
  },
  {
    question: "How is OctoHub different from other Git platforms?",
    answer: "OctoHub brings a fresh perspective to code hosting with modern features, improved performance, and a focus on developer experience. We're building on what works while introducing innovative features that make development more efficient and enjoyable. Our platform is designed from the ground up for modern development workflows."
  },
  {
    question: "What features will OctoHub offer?",
    answer: "OctoHub will include advanced code search, modern collaboration tools, integrated CI/CD, and powerful repository management. We're focusing on features that matter most to developers, with a particular emphasis on performance, security, and ease of use."
  },
  {
    question: "Can I import my existing repositories?",
    answer: "Yes! We're developing comprehensive import tools to make it easy to move your repositories from any Git platform to OctoHub. This includes preserving your repository history, issues, pull requests, and other metadata."
  },
  {
    question: "What happens when I join the waitlist?",
    answer: "By joining our waitlist, you'll be among the first to know when we launch. You'll receive exclusive early access opportunities, special launch offers, and regular updates about our progress. We'll never spam you - you'll only receive important updates about our launch."
  },
  {
    question: "Is OctoHub free to use?",
    answer: "We'll offer both free and paid tiers. The free tier will include generous limits for individual developers and small teams, while paid tiers will provide additional features and higher limits for larger organizations."
  }
];

// Set launch date to 4 months from now
const LAUNCH_DATE = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
      {Object.entries(timeLeft).map(([key, value]) => (
        <motion.div
          key={key}
          className="flex flex-col items-center p-4 rounded-lg border border-github-border bg-github-dark-secondary/30 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-3xl font-bold text-white">{value.toString().padStart(2, '0')}</span>
          <span className="text-sm text-github-text-secondary capitalize">{key}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function ComingSoonPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto">
      <div className="relative flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(88, 166, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(35, 134, 54, 0.2) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(88, 166, 255, 0.1) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(88, 166, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: "4rem 4rem",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-4xl space-y-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo and Title Section */}
          <div className="text-center space-y-8">
            <motion.div
              className="relative mx-auto h-32 w-32 rounded-full bg-gradient-to-r from-github-dark to-github-dark-secondary flex items-center justify-center backdrop-blur-sm border border-github-border overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 360 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-github-dark-secondary opacity-50" />
              <Image
                src="/logo.webp"
                alt="OctoHub"
                width={96}
                height={96}
                className="relative z-10"
              />
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

          {/* Countdown Timer */}
          <motion.div
            className="space-y-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-white">Launch Countdown</h2>
            <CountdownTimer targetDate={LAUNCH_DATE} />
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex flex-col items-center p-6 rounded-lg border border-github-border bg-github-dark-secondary/30 backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                custom={index}
              >
                <feature.icon className="w-8 h-8 text-github-accent mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-github-text-secondary text-center">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  className="border border-github-border rounded-lg bg-github-dark-secondary/30 backdrop-blur-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-github-dark-secondary/50 transition-colors"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <span className="text-lg font-medium text-white">{faq.question}</span>
                    <span className={`transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-github-text-secondary">{faq.answer}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-white">Stay Connected</h3>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="https://github.com/OctoHubOSS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-github-text-secondary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGithub className="w-8 h-8" />
              </motion.a>
              <motion.a
                href="https://twitter.com/HeyOctoHub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-github-text-secondary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTwitter className="w-8 h-8" />
              </motion.a>
              <motion.a
                href="https://discord.gg/EvgtRgVEed"
                target="_blank"
                rel="noopener noreferrer"
                className="text-github-text-secondary hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDiscord className="w-8 h-8" />
              </motion.a>
            </div>
          </motion.div>

          {/* Subscribe Button */}
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
        </motion.div>
      </div>
    </div>
  );
}
