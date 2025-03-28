import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole, UserStatus } from "@prisma/client";
import type { GithubProfile } from "next-auth/providers/github";
import prisma from "@/lib/database";
import bcrypt from "bcrypt";

/**
 * Helper functions for password authentication
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (user.role === UserRole.BANNED) {
          throw new Error("Account is banned");
        }

        // Update user status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastActiveAt: new Date(),
            status: UserStatus.ONLINE,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          lastActiveAt: user.lastActiveAt,
          isAdmin: user.role === UserRole.ADMIN,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      async profile(profile: GithubProfile) {
        const user = await prisma.user.upsert({
          where: { email: profile.email || "" },
          update: {},
          create: {
            email: profile.email || "",
            name: profile.name || profile.login,
            image: profile.avatar_url,
            role: UserRole.USER,
            status: UserStatus.ONLINE,
            lastActiveAt: new Date(),
            githubId: profile.id.toString(),
            githubUsername: profile.login,
            githubDisplayName: profile.name || profile.login,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          lastActiveAt: user.lastActiveAt,
          isAdmin: user.role === UserRole.ADMIN,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.lastActiveAt = token.lastActiveAt;
        session.user.isAdmin = token.role === UserRole.ADMIN;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.lastActiveAt = user.lastActiveAt;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: "LOGIN_SUCCESS",
          metadata: {
            provider: account?.provider || "unknown",
            isNewUser: isNewUser || false,
            profile: profile ? JSON.parse(JSON.stringify(profile)) : null,
          },
        },
      });

      if (account?.provider === "github" && profile) {
        const githubProfile = profile as GithubProfile;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: githubProfile.id.toString(),
            githubUsername: githubProfile.login,
            githubDisplayName: githubProfile.name || githubProfile.login,
          },
        });
      }
    },
    async signOut({ session, token }) {
      if (session?.user?.id) {
        await prisma.userActivity.create({
          data: {
            userId: session.user.id,
            action: "LOGOUT",
            metadata: {
              provider: token.provider || "unknown",
            },
          },
        });

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            status: UserStatus.OFFLINE,
            lastActiveAt: new Date(),
          },
        });
      }
    },
  },
};

/**
 * Helper to get the server session
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * Helper to check if a user is authenticated
 */
export const isAuthenticated = async () => {
  const session = await getAuthSession();
  return !!session?.user;
};

// Password validation utilities
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
