'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface WelcomeSectionProps {
  userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState('');
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    // Set initial greeting based on time of day
    updateGreeting();
    updateDateTime();

    // Update the time every minute
    const timer = setInterval(() => {
      updateDateTime();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let newGreeting;

    if (hour < 12) {
      newGreeting = 'Good Morning';
    } else if (hour < 18) {
      newGreeting = 'Good Afternoon';
    } else {
      newGreeting = 'Good Evening';
    }

    setGreeting(newGreeting);
  };

  const updateDateTime = () => {
    // Format: "Monday, January 1, 2023 at 12:34 PM"
    const now = new Date();
    const formattedDateTime = format(now, "EEEE, MMMM d, yyyy 'at' h:mm a");
    setDateTime(formattedDateTime);
  };

  return (
    <div className="bg-github-dark-secondary rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {greeting}, {userName || 'there'}!
          </h1>
          <p className="mt-2 text-sm text-github-text-secondary">
            Here's what's happening with your account
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-github-text-secondary bg-github-dark px-3 py-1.5 rounded-lg">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {dateTime}
          </span>
        </div>
      </div>
    </div>
  );
}