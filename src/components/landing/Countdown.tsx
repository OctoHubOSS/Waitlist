'use client';

import { motion } from "framer-motion";
import { useState, useEffect } from 'react';

// Launch date - July 30th, 2025
const LAUNCH_DATE = new Date(2025, 6, 30); // Month is 0-indexed

type TimeLeftType = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeftType>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Initial calculation
    calculateTimeLeft();
    
    // Set up the interval
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Cleanup function
    return () => clearInterval(timer);
    
    function calculateTimeLeft() {
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
        // If we've passed the target date
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    }
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

export default function Countdown() {
  return (
    <motion.div
      className="space-y-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold text-white">Counting Down to Something Amazing</h2>
      <p className="text-github-text-secondary mb-6">Join us on this journey to transform code collaboration</p>
      <CountdownTimer targetDate={LAUNCH_DATE} />
    </motion.div>
  );
}
