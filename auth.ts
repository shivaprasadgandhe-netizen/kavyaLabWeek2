import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { getClientIp, hashIp } from "@/lib/rate-limit";
import { headers } from "next/headers";

// Startup check: throw clear error naming any missing required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
] as const;

const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnv.join(", ")}. Please define them in your environment configuration.`
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,   // 1 day
  },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, profile }) {
      // 1. Reject if profile.email_verified is not true
      const isEmailVerified =
        (profile as any)?.email_verified === true ||
        (profile as any)?.email_verified === "true";

      if (!isEmailVerified) {
        return false;
      }

      // 2. For an existing user, check if status is SUSPENDED
      const existingUser = user?.id
        ? await prisma.user.findUnique({ where: { id: user.id } })
        : user?.email
        ? await prisma.user.findUnique({ where: { email: user.email } })
        : null;

      if (existingUser && existingUser.status === "SUSPENDED") {
        try {
          const reqHeaders = await headers();
          const rawIp = getClientIp(reqHeaders);
          const ipHash = hashIp(rawIp);
          const userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;

          await prisma.securityEvent.create({
            data: {
              userId: existingUser.id,
              type: "SIGN_IN_BLOCKED",
              ipHash,
              userAgent,
            },
          });
        } catch (err) {
          console.error("Error recording SIGN_IN_BLOCKED event:", err);
        }
        return "/login?error=suspended";
      }

      // 3. Keep ADMIN_EMAILS promotion from Week 3 (promote only, never demote)
      if (user?.email) {
        const adminEmailsRaw = process.env.ADMIN_EMAILS || "";
        const adminEmails = adminEmailsRaw
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const userEmail = user.email.trim().toLowerCase();
        if (adminEmails.includes(userEmail) && existingUser && existingUser.role !== "ADMIN") {
          try {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: "ADMIN" },
            });
          } catch (error) {
            console.error("Error setting ADMIN role in signIn callback:", error);
          }
        }
      }

      return true;
    },
    async session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id;
          session.user.role = (user as any).role || "USER";
          (session.user as any).status = (user as any).status || "ACTIVE";
        } else if (token) {
          if (token.sub) session.user.id = token.sub;
          if (token.role) session.user.role = token.role as string;
          if (token.status) (session.user as any).status = token.status as string;
        }
      }
      return session;
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

          // Record SIGN_IN event with hashed IP and user agent (from headers())
          let ipHash: string | null = null;
          let userAgent: string | null = null;
          try {
            const reqHeaders = await headers();
            const rawIp = getClientIp(reqHeaders);
            ipHash = hashIp(rawIp);
            userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;
          } catch {
            // Non-blocking header read
          }

          await prisma.securityEvent.create({
            data: {
              userId: existingUser.id,
              type: "SIGN_IN",
              ipHash,
              userAgent,
            },
          });

          // Attach userAgent to the latest session row for this user if missing
          if (userAgent) {
            const latestSession = await prisma.session.findFirst({
              where: { userId: existingUser.id },
              orderBy: { createdAt: "desc" },
            });
            if (latestSession && !latestSession.userAgent) {
              await prisma.session.update({
                where: { id: latestSession.id },
                data: { userAgent },
              });
            }
          }
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
