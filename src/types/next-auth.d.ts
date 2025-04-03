import "next-auth";
import { UserRole, UserStatus } from "@prisma/client";

declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        displayName: string | null;
        email: string;
        role: UserRole;
        status: UserStatus;
        emailVerified: Date | null;
        subscriberId?: string | null;
    }

    interface Session {
        user: User & {
            id: string;
            name: string;
            displayName: string | null;
            email: string;
            role: UserRole;
            status: UserStatus;
            emailVerified: Date | null;
            subscriberId?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string;
        displayName: string | null;
        email: string;
        role: UserRole;
        status: UserStatus;
        emailVerified: Date | null;
        subscriberId?: string | null;
    }
} 