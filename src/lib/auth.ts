import NextAuth, { NextAuthConfig, Session, User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createDefaultCategories } from "./categories";
import { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";

export const authOptions: NextAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        // Ensure default categories are created
        await createDefaultCategories(token.sub);
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User | undefined }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth } = NextAuth(authOptions);
