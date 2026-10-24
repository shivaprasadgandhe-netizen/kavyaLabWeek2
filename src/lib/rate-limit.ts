import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Extracts client IP from headers, picking the first IP from x-forwarded-for if present,
 * or falling back to "unknown".
 */
export function getClientIp(headers: Headers | { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return "unknown";
}

/**
 * Hashes an IP address using SHA-256 to ensure raw IPs are never stored in database keys.
 */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

/**
 * Fixed-window rate limiter backed by the RateLimit table.
 * Uses a single atomic INSERT ... ON CONFLICT DO UPDATE RETURNING query in PostgreSQL
 * so concurrent requests cannot bypass the limit.
 *
 * Expired rows are cleaned up probabilistically (5% of requests) to prevent database bloat
 * without requiring external cron daemons.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // Probabilistic inline cleanup for expired rows (5% sample)
  if (Math.random() < 0.05) {
    prisma.rateLimit
      .deleteMany({
        where: { windowEndsAt: { lte: new Date() } },
      })
      .catch((err) => {
        // Non-blocking background cleanup error suppression
        console.error("Non-critical rate limit cleanup notice:", err);
      });
  }

  const now = new Date();
  const newWindowEndsAt = new Date(now.getTime() + windowSeconds * 1000);

  const result = await prisma.$queryRaw<Array<{ count: number; windowEndsAt: Date }>>`
    INSERT INTO "RateLimit" ("key", "count", "windowEndsAt")
    VALUES (${key}, 1, ${newWindowEndsAt})
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE
        WHEN "RateLimit"."windowEndsAt" <= NOW() THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowEndsAt" = CASE
        WHEN "RateLimit"."windowEndsAt" <= NOW() THEN ${newWindowEndsAt}
        ELSE "RateLimit"."windowEndsAt"
      END
    RETURNING "count", "windowEndsAt"
  `;

  const record = result[0];
  const count = Number(record?.count ?? 1);
  const windowEndsAt = record?.windowEndsAt ? new Date(record.windowEndsAt) : newWindowEndsAt;

  const allowed = count <= limit;
  const remainingMs = Math.max(0, windowEndsAt.getTime() - Date.now());
  const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  return { allowed, retryAfterSeconds };
}

// Preset Rate Limit Rules
// 1. Sign-in initiation (POST /api/auth/*): 20 requests per IP per 15 minutes (900s)
export async function checkSignInRateLimit(ip: string): Promise<RateLimitResult> {
  const ipHash = hashIp(ip);
  return checkRateLimit(`signin:${ipHash}`, 20, 15 * 60);
}

// 2. changeRole: 30 per admin per minute (60s)
export async function checkAdminRoleRateLimit(adminId: string): Promise<RateLimitResult> {
  return checkRateLimit(`admin:role:${adminId}`, 30, 60);
}

// 3. Suspend or reactivate: 30 per admin per minute (60s)
export async function checkAdminStatusRateLimit(adminId: string): Promise<RateLimitResult> {
  return checkRateLimit(`admin:status:${adminId}`, 30, 60);
}

// 4. Data export: 5 per user per hour (3600s)
export async function checkExportRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`user:export:${userId}`, 5, 60 * 60);
}

// 5. Account deletion attempts: 5 per user per hour (3600s)
export async function checkDeleteRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`user:delete:${userId}`, 5, 60 * 60);
}

// 6. Session revocation: 10 per user per hour (3600s)
export async function checkRevokeSessionsRateLimit(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(`user:sessions:${userId}`, 10, 60 * 60);
}
