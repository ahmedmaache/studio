// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { User as PrismaUser, AdminRole } from '@prisma/client'; // Use PrismaUser to avoid conflict

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          console.log('No user found or user has no password (maybe OAuth user)');
          return null;
        }
        
        const isValidPassword = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isValidPassword) {
          console.log('Invalid password');
          return null;
        }

        // Return the user object that will be encoded in the JWT
        // Ensure you only return necessary, non-sensitive information
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Our custom role
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Using JWT for sessions
  },
  callbacks: {
    async jwt({ token, user }) {
      // user parameter is only passed on initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role as AdminRole; // Cast to access custom role property
        token.name = user.name; // Add name to token
        token.email = user.email; // Add email to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
        // session.user.name = token.name as string | null | undefined; // Already part of default session
        // session.user.email = token.email as string | null | undefined; // Already part of default session
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login', // Redirect users to this page for login
    // error: '/admin/login', // Optionally, redirect to login on error
  },
  secret: process.env.NEXTAUTH_SECRET, // Make sure to set this in .env
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
