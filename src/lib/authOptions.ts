import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { UserRole, AccountType } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: UserRole.SEEKER,
          accountType: AccountType.INDIVIDUAL,
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Check if email is verified
        if (!user.isVerified) {
          throw new Error("Please verify your email address before signing in. Check your email for a verification link.");
        }

        // @ts-expect-error: password is present in our model
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ""
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // @ts-expect-error: role/accountType are present in our model
          role: user.role,
          // @ts-expect-error: role/accountType are present in our model
          accountType: user.accountType,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error: role/accountType are present in our model
        token.role = user.role;
        // @ts-expect-error: role/accountType are present in our model
        token.accountType = user.accountType;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-expect-error: id/role/accountType are custom fields
        session.user.id = token.id as string;
        // @ts-expect-error: id/role/accountType are custom fields
        session.user.role = token.role as UserRole;
        // @ts-expect-error: id/role/accountType are custom fields
        session.user.accountType = token.accountType as AccountType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 