import { UserRole, AccountType } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      accountType: AccountType;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    accountType: AccountType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    accountType: AccountType;
  }
}
