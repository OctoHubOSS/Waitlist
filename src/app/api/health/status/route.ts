import { NextRequest, NextResponse } from "next/server";
import prisma from '@root/prisma/database';
import { ApiClient } from '@/lib/api/client';
import { handleApiError, successResponse } from "@/lib/api/responses";

// Create API client instance
const api = new ApiClient(prisma);

/**
 * Minimal health check endpoint for load balancers and simple monitoring
 * GET /api/health/status - Returns minimal status information (200 OK if healthy)
 */
export async function GET(req: NextRequest) {
    try {
        return api.handler(async () => {
            try {
                // Simple DB connectivity check
                await prisma.$queryRaw`SELECT 1`;
                
                return successResponse({
                    status: "ok",
                    timestamp: new Date().toISOString()
                }, "System operational");
            } catch (error) {
                // Return 503 if database is down
                return successResponse({
                    status: "error",
                    timestamp: new Date().toISOString()
                }, "System degraded", 503);
            }
        })(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}
