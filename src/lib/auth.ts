import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
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
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            status: "ONLINE"
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],

  callbacks: {
    async session({ session, user, token }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user?.id || token?.sub || "";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // For GitHub sign-ins, check for account linking
      if (account?.provider === "github" && user?.email && profile) {
        const githubProfile = profile as any;
        const githubId = githubProfile.id?.toString();
        const githubUsername = githubProfile.login;

        // Check if there's an existing account with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // Link the GitHub account to the existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              githubId,
              githubUsername,
              githubDisplayName: githubProfile.name || null,
              lastLoginAt: new Date(),
              status: "ONLINE"
            }
          });

          // Return the existing user ID to sign in as that user
          user.id = existingUser.id;
          return true;
        } else {
          // New GitHub user - update with GitHub-specific fields
          await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId,
              githubUsername,
              githubDisplayName: githubProfile.name || null,
              lastLoginAt: new Date(),
              status: "ONLINE"
            }
          });
        }
      }

      return true;
    }
  },

  // Configure debug mode based on environment
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};

/**
 * Helper to get the server session
 * Use this in server components and API routes
 */
export const getSession = async () => {
  return await getServerSession(authOptions);
};

/**
 * Helper to check if a user is authenticated on the server
 */
export const isAuthenticated = async () => {
  const session = await getSession();
  return !!session?.user;
};
