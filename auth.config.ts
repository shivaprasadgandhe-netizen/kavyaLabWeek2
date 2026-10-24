import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id;
          (session.user as any).role = (user as any).role || "USER";
          (session.user as any).status = (user as any).status || "ACTIVE";
        } else if (token) {
          if (token.sub) session.user.id = token.sub;
          if (token.role) (session.user as any).role = token.role as string;
          if (token.status) (session.user as any).status = token.status as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
