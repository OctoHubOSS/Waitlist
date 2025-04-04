import { BaseApiService } from './base';
import { ApiResponse, ApiValidationSchema } from '@/types/apiClient';
import { z } from 'zod';
import { WaitlistStatus } from '@prisma/client';

// Validation schemas
const createSubscriberSchema: ApiValidationSchema = {
    request: z.object({
        email: z.string().email(),
        name: z.string().optional(),
        referralCode: z.string().optional(),
        metadata: z.record(z.any()).optional(),
    }),
    response: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
        status: z.nativeEnum(WaitlistStatus),
        referralCode: z.string().nullable(),
        metadata: z.record(z.any()).nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
};

const updateSubscriberSchema: ApiValidationSchema = {
    request: z.object({
        status: z.nativeEnum(WaitlistStatus).optional(),
        name: z.string().optional(),
        metadata: z.record(z.any()).optional(),
    }),
    response: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string().nullable(),
        status: z.nativeEnum(WaitlistStatus),
        referralCode: z.string().nullable(),
        metadata: z.record(z.any()).nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
};

/**
 * Waitlist service implementation
 */
export class WaitlistService extends BaseApiService {
    /**
     * Creates a new waitlist subscriber
     */
    async createSubscriber(data: {
        email: string;
        name?: string;
        referralCode?: string;
        metadata?: Record<string, any>;
    }): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/waitlist/subscribers',
            data,
            schema: createSubscriberSchema,
        });
    }

    /**
     * Updates a waitlist subscriber
     */
    async updateSubscriber(
        id: string,
        data: {
            status?: WaitlistStatus;
            name?: string;
            metadata?: Record<string, any>;
        }
    ): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'PATCH',
            endpoint: `/waitlist/subscribers/${id}`,
            data,
            schema: updateSubscriberSchema,
        });
    }

    /**
     * Gets a waitlist subscriber by ID
     */
    async getSubscriber(id: string): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'GET',
            endpoint: `/waitlist/subscribers/${id}`,
        });
    }

    /**
     * Gets a waitlist subscriber by email
     */
    async getSubscriberByEmail(email: string): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'GET',
            endpoint: '/waitlist/subscribers',
            params: { email },
        });
    }

    /**
     * Gets all waitlist subscribers
     */
    async getSubscribers(params?: {
        status?: WaitlistStatus;
        page?: number;
        limit?: number;
    }): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'GET',
            endpoint: '/waitlist/subscribers',
            params: params as Record<string, string>,
        });
    }

    /**
     * Deletes a waitlist subscriber
     */
    async deleteSubscriber(id: string): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'DELETE',
            endpoint: `/waitlist/subscribers/${id}`,
        });
    }
} 