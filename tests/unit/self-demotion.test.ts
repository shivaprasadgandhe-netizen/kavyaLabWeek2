import { describe, it, expect } from "vitest";
import { isSelfDemotion } from "@/lib/admin/self-demotion";

describe("isSelfDemotion", () => {
  it("blocks an ADMIN from demoting themselves to USER", () => {
    // Current ADMIN changing own role to USER
    expect(isSelfDemotion("admin-123", "admin-123", "USER", "ADMIN")).toBe(true);
    expect(
      isSelfDemotion({
        actorId: "admin-123",
        targetUserId: "admin-123",
        actorRole: "ADMIN",
        newRole: "USER",
      })
    ).toBe(true);
  });

  it("allows promoting self to ADMIN or keeping ADMIN", () => {
    // Current USER promoting self to ADMIN
    expect(isSelfDemotion("user-123", "user-123", "ADMIN", "USER")).toBe(false);
    // Current ADMIN keeping ADMIN
    expect(isSelfDemotion("admin-123", "admin-123", "ADMIN", "ADMIN")).toBe(false);
  });

  it("allows changing other users' roles", () => {
    // Admin changing another user's role to USER
    expect(isSelfDemotion("admin-123", "other-user-456", "USER", "ADMIN")).toBe(false);
    // Admin changing another user's role to ADMIN
    expect(isSelfDemotion("admin-123", "other-user-456", "ADMIN", "ADMIN")).toBe(false);
  });
});
