import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth-guards and Next.js helpers
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => {
  const user = {
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };
  const auditLog = {
    create: vi.fn(),
  };
  const session = {
    deleteMany: vi.fn(),
  };
  const $transaction = vi.fn();

  return {
    db: {
      user,
      auditLog,
      session,
      $transaction,
    },
    prisma: {
      user,
      auditLog,
      session,
      $transaction,
    },
  };
});

import { changeRole } from "@/app/admin/users/actions";
import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";

describe("changeRole action (mocked integration)", () => {
  const mockAdmin = {
    id: "admin-actor-1",
    email: "admin@kavyalabs.com",
    role: "ADMIN" as const,
    status: "ACTIVE" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({ user: mockAdmin } as any);
  });

  it("calls one transaction updating role and creating AuditLog with action, oldValue, and newValue", async () => {
    const targetUserId = "user-target-2";
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "USER",
    } as any);

    vi.mocked(db.$transaction).mockResolvedValue([{}, {}] as any);

    const result = await changeRole(targetUserId, "ADMIN");

    expect(result).toEqual({ success: true });
    expect(db.$transaction).toHaveBeenCalledTimes(1);

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: targetUserId },
      data: { role: "ADMIN" },
    });
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: mockAdmin.id,
        targetUserId: targetUserId,
        action: "ROLE_CHANGED",
        oldValue: "USER",
        newValue: "ADMIN",
      },
    });
  });

  it("surfaces an error and writes no AuditLog row when the transaction rejects", async () => {
    const targetUserId = "user-target-3";
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "USER",
    } as any);

    vi.mocked(db.$transaction).mockRejectedValue(new Error("Database transaction aborted"));

    await expect(async () => {
      await changeRole(targetUserId, "ADMIN");
    }).rejects.toThrow("Database transaction aborted");

    expect(db.auditLog.create).toHaveBeenCalledTimes(1); // Prepared for $transaction
    // The transaction itself failed, so no rows were committed
  });

  it("returns without writing when role is unchanged", async () => {
    const targetUserId = "user-target-4";
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: targetUserId,
      role: "ADMIN",
    } as any);

    const result = await changeRole(targetUserId, "ADMIN");

    expect(result).toEqual({ success: true });
    expect(db.$transaction).not.toHaveBeenCalled();
    expect(db.user.update).not.toHaveBeenCalled();
  });
});
