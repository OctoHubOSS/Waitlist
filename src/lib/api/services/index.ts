export * from './base';
export * from './waitlist';

// Export service instances
import { WaitlistService } from './waitlist';
import { getApiConfig } from '../config';

export const waitlistService = new WaitlistService(getApiConfig()); 