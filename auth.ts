import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

// Read AUTH_SECRET and AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET from the environment.
// At startup, throw a clear error naming any missing variable.
const requiredAuthVars = [
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
] as const;

const missingVars = requiredAuthVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingVars.join(", ")}`
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,   // 1 day
  },
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, profile }) {
      // 1. Reject unverified emails (profile.email_verified must be true)
      const isEmailVerified =
        (profile as any)?.email_verified === true ||
        (profile as any)?.email_verified === "true";

      if (!isEmailVerified) {
        return false;
      }

      // 2. Reject SUSPENDED users
      const email = user.email || (profile as any)?.email;
      if (email) {
        const existingUser = await db.user.findUnique({
          where: { email },
          select: { status: true },
        });

        if (existingUser?.status === "SUSPENDED") {
          return "/login?error=suspended";
        }
      }

      return true;
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

      const userEmail = (user.email || "").trim().toLowerCase();
      const shouldPromote = Boolean(userEmail && adminEmails.includes(userEmail));

      try {
        const existingUser = user.id
          ? await db.user.findUnique({ where: { id: user.id } })
          : await db.user.findUnique({ where: { email: user.email! } });

        if (existingUser) {
          const updateData: { lastSignedInAt: Date; role?: "ADMIN" } = {
            lastSignedInAt: new Date(),
          };
          if (shouldPromote && existingUser.role !== "ADMIN") {
            updateData.role = "ADMIN";
          }
          await db.user.update({
            where: { id: existingUser.id },
            data: updateData,
          });
        }
      } catch (error) {
        console.error("Error updating user in events.signIn:", error);
      }
    },
  },
});
