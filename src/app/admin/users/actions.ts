"use server";

import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ChangeRoleResult {
  success: boolean;
  error?: string;
}

export async function changeRole(
  userId: string,
  newRole: string
): Promise<ChangeRoleResult> {
  // Start with requireAdmin(). Get the actor's ID from the session / db user.
  const { user: actor } = await requireAdmin();
  const actorId = actor.id;

  // Validate that newRole is exactly "USER" or "ADMIN". Reject everything else with a clear error.
  if (newRole !== "USER" && newRole !== "ADMIN") {
    return {
      success: false,
      error: 'Invalid role specified. Role must be exactly "USER" or "ADMIN".',
    };
  }

  const typedNewRole = newRole as Role;

  // If the actor is changing their own role from ADMIN to USER, reject it. This prevents lockout.
  if (actorId === userId && typedNewRole === "USER") {
    return {
      success: false,
      error: "Self-demotion is not allowed. An administrator cannot demote themselves to USER.",
    };
  }

  // Load the target user's current role.
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    return {
      success: false,
      error: "Target user not found.",
    };
  }

  // If it is unchanged, return without writing.
  if (targetUser.role === typedNewRole) {
    return {
      success: true,
    };
  }

  // Inside prisma.$transaction, update the role and create an AuditLog row with actorId, targetUserId, oldRole, and newRole.
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
  ]);

  // Call revalidatePath("/admin/users") and revalidatePath("/admin").
  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return {
    success: true,
  };
}
