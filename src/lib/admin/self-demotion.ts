/**
 * Self-demotion guard logic for administrative role management.
 * Pure logic module with NO Prisma or Next.js dependencies.
 */

export interface SelfDemotionParams {
  actorId: string;
  targetUserId: string;
  actorRole?: string;
  newRole: string;
}

/**
 * Returns true when an actor is an ADMIN attempting to change their own role to USER.
 *
 * Rules:
 * - Blocks ADMIN to USER on self (returns true).
 * - Allows promoting self to ADMIN (returns false).
 * - Allows changing other users (returns false).
 */
export function isSelfDemotion(
  actorIdOrParams: string | SelfDemotionParams,
  targetUserId?: string,
  newRole?: string,
  actorRole: string = "ADMIN"
): boolean {
  let actorId: string;
  let targetId: string;
  let effectiveActorRole: string;
  let requestedNewRole: string;

  if (typeof actorIdOrParams === "object" && actorIdOrParams !== null) {
    actorId = actorIdOrParams.actorId;
    targetId = actorIdOrParams.targetUserId;
    effectiveActorRole = actorIdOrParams.actorRole ?? "ADMIN";
    requestedNewRole = actorIdOrParams.newRole;
  } else {
    actorId = actorIdOrParams;
    targetId = targetUserId ?? "";
    effectiveActorRole = actorRole;
    requestedNewRole = newRole ?? "";
  }

  // Self modification where current role is ADMIN and target role is USER
  if (actorId === targetId && effectiveActorRole === "ADMIN" && requestedNewRole === "USER") {
    return true;
  }

  return false;
}
