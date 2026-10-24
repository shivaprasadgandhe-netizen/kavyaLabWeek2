"use server";

import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { isSelfDemotion } from "@/lib/admin/self-demotion";
import { validateRole, validateSuspensionReason } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

export async function changeRole(
  userId: string,
  newRole: string
): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();
  const actorId = actor.id;

  const roleValidation = validateRole(newRole);
  if (!roleValidation.valid) {
    return { success: false, error: roleValidation.error };
  }
  const typedNewRole = roleValidation.value;

  if (isSelfDemotion(actorId, userId, typedNewRole, actor.role)) {
    return {
      success: false,
      error: "Self-demotion is not allowed. An administrator cannot demote themselves to USER.",
    };
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    return { success: false, error: "Target user not found." };
  }

  if (targetUser.role === typedNewRole) {
    return { success: true };
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { role: typedNewRole },
    }),
    db.auditLog.create({
      data: {
        actorId,
        targetUserId: userId,
        action: "ROLE_CHANGED",
        oldValue: targetUser.role,
        newValue: typedNewRole,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/audit");

  return { success: true };
}

export async function changeRoleFormAction(
  _prevState: AdminActionResult,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    const userId = formData.get("userId");
    const newRole = formData.get("newRole");
    if (typeof userId !== "string" || typeof newRole !== "string") {
      return { success: false, error: "Missing required fields." };
    }
    return await changeRole(userId, newRole);
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role.",
    };
  }
}

export async function suspendUser(
  userId: string,
  reason: string
): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();

  const reasonValidation = validateSuspensionReason(reason);
  if (!reasonValidation.valid) {
    return { success: false, error: reasonValidation.error };
  }
  const cleanReason = reasonValidation.value;

  if (actor.id === userId) {
    return {
      success: false,
      error: "Self-suspension is not allowed. You cannot suspend your own administrative account.",
    };
  }

  const targetUser = await db.user.findUnique({
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
    const activeAdminCount = await db.user.count({
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    if (activeAdminCount <= 1) {
      return {
        success: false,
        error: "Action rejected. Suspending this administrator would leave zero active administrators.",
      };
    }
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
        suspendedReason: cleanReason,
      },
    }),
    db.session.deleteMany({
      where: { userId },
    }),
    db.auditLog.create({
      data: {
        actorId: actor.id,
        targetUserId: userId,
        action: "SUSPENDED",
        oldValue: targetUser.status,
        newValue: cleanReason,
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/audit");

  return { success: true };
}

export async function reactivateUser(userId: string): Promise<AdminActionResult> {
  const { user: actor } = await requireAdmin();

  if (actor.id === userId) {
    return {
      success: false,
      error: "Self-reactivation is not applicable to your own active account.",
    };
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true },
  });

  if (!targetUser) {
    return { success: false, error: "Target user not found." };
  }

  if (targetUser.status === "ACTIVE") {
    return { success: true };
  }

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        suspendedReason: null,
      },
    }),
    db.auditLog.create({
      data: {
        actorId: actor.id,
        targetUserId: userId,
        action: "REACTIVATED",
        oldValue: targetUser.status,
        newValue: "ACTIVE",
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/audit");

  return { success: true };
}
