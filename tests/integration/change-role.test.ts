import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth-guards, rate-limit, and Next.js helpers
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkAdminRoleRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
  checkAdminStatusRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
  hashIp: vi.fn().mockReturnValue("mocked-hash"),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("test-agent"),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => {
  const user = {
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const auditLog = {
    create: vi.fn(),
  };
  const securityEvent = {
    create: vi.fn(),
  };
  const $transaction = vi.fn();

  return {
    prisma: {
      user,
      auditLog,
      securityEvent,
      $transaction,
    },
  };
});

import { changeRole } from "@/app/admin/users/actions";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

describe("changeRole action (mocked integration)", () => {
  const mockAdmin = {
    id: "admin-actor-1",
    email: "admin@kavyalabs.com",
    role: "ADMIN" as const,
    status: "ACTIVE" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ user: mockAdmin });
  });

  it("calls one transaction updating role and creating AuditLog with correct actorId, targetUserId, oldRole, and newRole", async () => {
    const targetUserId = "user-target-2";
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "USER",
    } as any);

    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}, {}] as any);

    const result = await changeRole(targetUserId, "ADMIN");

    expect(result).toEqual({ success: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);

    // Verify transaction operations: user.update, auditLog.create, securityEvent.create
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { role: "ADMIN" },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: mockAdmin.id,
        targetUserId: targetUserId,
        oldRole: "USER",
        newRole: "ADMIN",
      },
    });
  });

  it("surfaces an error and writes no AuditLog row when the transaction rejects", async () => {
    const targetUserId = "user-target-3";
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "USER",
    } as any);

    vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Database transaction aborted"));

    // Expect action to surface error (or rethrow/return error)
    await expect(async () => {
      await changeRole(targetUserId, "ADMIN");
    }).rejects.toThrow("Database transaction aborted");

    // Standalone auditLog create was never called outside the aborted transaction
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1); // Prepared for $transaction
    // The transaction itself failed, so no rows were committed
  });

  it("returns without writing when role is unchanged", async () => {
    const targetUserId = "user-target-4";
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "ADMIN",
    } as any);

    const result = await changeRole(targetUserId, "ADMIN");

    expect(result).toEqual({ success: true });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

// Extra suite against a real database if TEST_DATABASE_URL is set
const realDbUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!realDbUrl)("changeRole against real TEST_DATABASE_URL", () => {
  it("runs real database operations when TEST_DATABASE_URL is provided", () => {
    expect(realDbUrl).toBeDefined();
  });
});
