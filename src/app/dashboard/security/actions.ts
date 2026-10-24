"use server";

import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { checkRevokeSessionsRateLimit, checkDeleteRateLimit, getClientIp, hashIp } from "@/lib/rate-limit";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface SecurityActionResult {
  success: boolean;
  error?: string;
}

/**
 * Revokes all sessions for the authenticated user except the current session.
 * Rate limited to 10 requests per user per hour.
 */
export async function signOutOtherSessions(): Promise<SecurityActionResult> {
  const { user } = await requireUser();

  const { allowed, retryAfterSeconds } = await checkRevokeSessionsRateLimit(user.id);
  if (!allowed) {
    return {
      success: false,
      error: `Too many session revocation requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
    };
  }

  const cookieStore = await cookies();
  const currentToken =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (currentToken) {
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: { sessionToken: currentToken },
      },
    });
  }

  // Record SESSIONS_REVOKED
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    const ipHash = hashIp(rawIp);
    const userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: "SESSIONS_REVOKED",
        ipHash,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Error logging SESSIONS_REVOKED:", err);
  }

  revalidatePath("/dashboard/security");
  return { success: true };
}

/**
 * Revokes all sessions for the user including current, then redirects to /login.
 */
export async function signOutEverywhere(): Promise<void> {
  const { user } = await requireUser();

  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    const ipHash = hashIp(rawIp);
    const userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: "SESSIONS_REVOKED",
        ipHash,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Error logging SESSIONS_REVOKED on signout everywhere:", err);
  }

  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  redirect("/login");
}

/**
 * Deletes the user account permanently after verifying typed email matches.
 * Rate limited to 5 attempts per user per hour.
 * Cascades delete accounts, sessions, and security events.
 * Preserves AuditLog with onDelete: SetNull.
 */
export async function deleteAccount(confirmationEmail: string): Promise<SecurityActionResult> {
  const { user } = await requireUser();

  const { allowed, retryAfterSeconds } = await checkDeleteRateLimit(user.id);
  if (!allowed) {
    return {
      success: false,
      error: `Too many deletion attempts. Please wait ${retryAfterSeconds} seconds before trying again.`,
    };
  }

  if (
    !confirmationEmail ||
    confirmationEmail.trim().toLowerCase() !== (user.email || "").toLowerCase()
  ) {
    return {
      success: false,
      error: "The confirmation email does not match your account email address.",
    };
  }

  // Record ACCOUNT_DELETED event before deletion for record-keeping
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    const ipHash = hashIp(rawIp);
    const userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;

    await prisma.securityEvent.create({
      data: {
        userId: user.id,
        type: "ACCOUNT_DELETED",
        ipHash,
        userAgent,
      },
    });
  } catch (err) {
    console.error("Error logging ACCOUNT_DELETED event:", err);
  }

  // Deleting user cascades accounts, sessions, and security events; audit logs are preserved with actorId/targetUserId set to null.
  await prisma.user.delete({
    where: { id: user.id },
  });

  redirect("/");
}
