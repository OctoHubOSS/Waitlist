import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        ip?: string;
        userAgent?: string;
        device?: string;
        location?: string;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            ip?: string;
            userAgent?: string;
            device?: string;
            location?: string;
        };
    }

    interface JWT {
        id: string;
        ip?: string;
        userAgent?: string;
        device?: string;
        location?: string;
    }
}