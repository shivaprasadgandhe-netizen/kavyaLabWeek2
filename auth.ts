import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn() {
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.role) {
          session.user.role = token.role as string;
        } else if (session.user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
            });
            if (dbUser) {
              session.user.role = dbUser.role;
            }
          } catch (error) {
            console.error("Error fetching user role in session callback:", error);
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "USER";
      }

      if (token.email) {
        const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsRaw
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (adminEmails.includes(token.email.trim().toLowerCase())) {
          token.role = "ADMIN";
        }
      }
      return token;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.email && !user.id) return;

      const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
      const adminEmails = adminEmailsRaw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = user.email ? user.email.trim().toLowerCase() : "";
      const shouldPromote = Boolean(userEmail && adminEmails.includes(userEmail));

      try {
        const existingUser = user.id
          ? await prisma.user.findUnique({ where: { id: user.id } })
          : await prisma.user.findUnique({ where: { email: user.email! } });

        if (existingUser) {
          const updateData: { lastSignedInAt: Date; role?: "ADMIN" } = {
            lastSignedInAt: new Date(),
          };
          if (shouldPromote && existingUser.role !== "ADMIN") {
            updateData.role = "ADMIN";
          }
          await prisma.user.update({
            where: { id: existingUser.id },
            data: updateData,
          });
        }
      } catch (error) {
        console.error("Error updating user in signIn event:", error);
      }
    },
    async createUser({ user }) {
      if (user.email) {
        const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsRaw
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (adminEmails.includes(user.email.trim().toLowerCase())) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            });
          } catch (error) {
            console.error("Error setting ADMIN role in createUser event:", error);
          }
        }
      }
    },
  },
});
