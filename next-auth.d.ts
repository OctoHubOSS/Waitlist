import { UserRole, UserStatus } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    status: UserStatus;
    lastActiveAt: Date | null;
    isAdmin?: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      status: UserStatus;
      lastActiveAt: Date | null;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    lastActiveAt: Date | null;
    isAdmin?: boolean;
  }
}