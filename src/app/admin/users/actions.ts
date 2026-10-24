"use server";

import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isSelfDemotion } from "@/lib/admin/self-demotion";
import { validateRole, validateSuspensionReason } from "@/lib/validation";
import { logError } from "@/lib/logger";
import {
  checkAdminRoleRateLimit,
  checkAdminStatusRateLimit,
  getClientIp,
  hashIp,
} from "@/lib/rate-limit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

/**
 * Changes a user's role between USER and ADMIN.
 * Rate limited to 30 requests per admin per minute.
 * Prevents self-demotion lockout.
 * Writes AuditLog for admin history and SecurityEvent for user history.
 */
export async function changeRole(
  userId: string,
  newRole: string
): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();
  const actorId = actor.id;

  // Rate limiting: 30 requests per admin per minute
  const { allowed, retryAfterSeconds } = await checkAdminRoleRateLimit(actorId);
  if (!allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before updating more roles.`,
    };
  }

  // Validate role
  const roleValidation = validateRole(newRole);
  if (!roleValidation.valid) {
    return { success: false, error: roleValidation.error };
  }
  const typedNewRole = roleValidation.value;

  // Prevent self-demotion lockout
  if (isSelfDemotion(actorId, userId, typedNewRole, actor.role)) {
    return {
      success: false,
      error: "Self-demotion is not allowed. An administrator cannot demote themselves to USER.",
    };
  }

  // Load target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    return { success: false, error: "Target user not found." };
  }

  if (targetUser.role === typedNewRole) {
    return { success: true };
  }

  // Collect request metadata for security event
  let ipHash: string | null = null;
  let userAgent: string | null = null;
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    ipHash = hashIp(rawIp);
    userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;
  } catch {
    // Non-blocking
  }

  // Atomic database transaction: update role, write admin AuditLog, and write user SecurityEvent
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { role: typedNewRole },
    }),
    prisma.auditLog.create({
      data: {
        actorId,
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: typedNewRole,
      },
    }),
    prisma.securityEvent.create({
      data: {
        userId,
        type: "ROLE_CHANGED",
        ipHash,
        userAgent,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/audit");

  return { success: true };
}

/**
 * Server action handler compatible with React 19 useActionState.
 */
export async function changeRoleFormAction(
  _prevState: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    const userId = formData.get("userId") as string;
    const newRole = formData.get("newRole") as string;
    return await changeRole(userId, newRole);
  } catch (error: unknown) {
    logError({ action: "changeRoleFormAction", error });
    return {
      success: false,
      error: "An unexpected error occurred while updating the role.",
    };
  }
}

/**
 * Suspends a user account with a mandatory reason (3 to 200 characters).
 * Rate limited to 30 requests per admin per minute.
 * Blocks self-suspension and suspending the last active administrator.
 * Immediately purges all active sessions for the target user.
 */
export async function suspendUser(
  userId: string,
  reason: string
): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();

  // Rate limiting: 30 requests per admin per minute
  const { allowed, retryAfterSeconds } = await checkAdminStatusRateLimit(actor.id);
  if (!allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before updating user status.`,
    };
  }

  // Reason validation: required, 3 to 200 characters
  const reasonValidation = validateSuspensionReason(reason);
  if (!reasonValidation.valid) {
    return { success: false, error: reasonValidation.error };
  }
  const cleanReason = reasonValidation.value;

  // Cannot suspend self
  if (actor.id === userId) {
    return {
      success: false,
      error: "Self-suspension is not allowed. You cannot suspend your own administrative account.",
    };
  }

  // Find target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  });

  if (!targetUser) {
    return { success: false, error: "Target user not found." };
  }

  if (targetUser.status === "SUSPENDED") {
    return { success: true };
  }

  // Reject if target is an ADMIN and suspending them leaves zero active admins
  if (targetUser.role === "ADMIN") {
    const activeAdminCount = await prisma.user.count({
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    if (activeAdminCount <= 1) {
      return {
        success: false,
        error: "Action rejected. Suspending this administrator would leave zero active administrators.",
      };
    }
  }

  // Request metadata for SecurityEvent
  let ipHash: string | null = null;
  let userAgent: string | null = null;
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    ipHash = hashIp(rawIp);
    userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;
  } catch {
    // Non-blocking
  }

  try {
    // Atomic transaction: update status, record event, delete sessions immediately
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: "SUSPENDED",
          suspendedAt: new Date(),
          suspendedReason: cleanReason,
        },
      }),
      prisma.session.deleteMany({
        where: { userId },
      }),
      prisma.securityEvent.create({
        data: {
          userId,
          type: "ACCOUNT_SUSPENDED",
          ipHash,
          userAgent,
        },
      }),
    ]);
  } catch (error: unknown) {
    logError({ action: "suspendUser", error });
    return {
      success: false,
      error: "An unexpected database error occurred while suspending the user.",
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true };
}

/**
 * Reactivates a suspended user account.
 * Rate limited to 30 requests per admin per minute.
 */
export async function reactivateUser(userId: string): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();

  // Rate limiting: 30 requests per admin per minute
  const { allowed, retryAfterSeconds } = await checkAdminStatusRateLimit(actor.id);
  if (!allowed) {
    return {
      success: false,
      error: `Rate limit exceeded. Please wait ${retryAfterSeconds} seconds before updating user status.`,
    };
  }

  if (actor.id === userId) {
    return {
      success: false,
      error: "Self-reactivation is not applicable to your own active account.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  });

  if (!targetUser) {
    return { success: false, error: "Target user not found." };
  }

  if (targetUser.status === "ACTIVE") {
    return { success: true };
  }

  let ipHash: string | null = null;
  let userAgent: string | null = null;
  try {
    const reqHeaders = await headers();
    const rawIp = getClientIp(reqHeaders);
    ipHash = hashIp(rawIp);
    userAgent = (reqHeaders.get("user-agent") || "").slice(0, 255) || null;
  } catch {
    // Non-blocking
  }

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: "ACTIVE",
          suspendedAt: null,
          suspendedReason: null,
        },
      }),
      prisma.securityEvent.create({
        data: {
          userId,
          type: "ACCOUNT_REACTIVATED",
          ipHash,
          userAgent,
        },
      }),
    ]);
  } catch (error: unknown) {
    logError({ action: "reactivateUser", error });
    return {
      success: false,
      error: "An unexpected database error occurred while reactivating the user.",
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true };
}
