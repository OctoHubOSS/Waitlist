import React, { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { createClientApiConfig } from '@/lib/api/config';

// Create a proper API client using the library
// Fix: Configure the client with the correct baseUrl
const apiClient = createApiClient(createClientApiConfig({
  baseUrl: '/api' // Explicitly set the base URL to /api
}));

// Create a standardized API client for waitlist operations
export const waitlistClient = {
  subscribe: async (data: { 
    email: string; 
    name?: string; 
    referralCode?: string;
    source?: string;
    metadata?: Record<string, any>;
  }) => {
    // Make sure we use the waitlist path without /api prefix since the client adds it
    return await apiClient.post('/waitlist/subscribe', data);
  },
  
  check: async (email: string) => {
    // Fix: Use the correct path without duplicate /api prefix
    return await apiClient.post('/waitlist/status', { email });
  },
  
  unsubscribe: async (email: string, reason?: string) => {
    // Fix: Use the correct path without duplicate /api prefix
    const data = { email, reason };
    return await apiClient.post('/waitlist/unsubscribe', data);
  }
};

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await waitlistClient.subscribe({
        email,
        name,
        referralCode,
        source: 'waitlist-form'
      });
      
      if (result.success) {
        // Handle success
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle unexpected errors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
        required 
      />
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Name" 
      />
      <input 
        type="text" 
        value={referralCode} 
        onChange={(e) => setReferralCode(e.target.value)} 
        placeholder="Referral Code" 
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
      </button>
    </form>
  );
};

export default WaitlistForm;
