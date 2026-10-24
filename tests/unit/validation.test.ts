import { describe, it, expect } from "vitest";
import {
  validateRole,
  validatePage,
  validatePageNumber,
  validateSearchQuery,
  validateSortKey,
} from "@/lib/validation";

describe("Validation helpers", () => {
  describe("validateRole", () => {
    it("accepts valid roles USER and ADMIN", () => {
      expect(validateRole("USER")).toEqual({ valid: true, value: "USER" });
      expect(validateRole("ADMIN")).toEqual({ valid: true, value: "ADMIN" });
    });

    it("rejects 'SUPERADMIN'", () => {
      const result = validateRole("SUPERADMIN");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects empty or whitespace-only role", () => {
      expect(validateRole("").valid).toBe(false);
      expect(validateRole("   ").valid).toBe(false);
      expect(validateRole(null).valid).toBe(false);
      expect(validateRole(undefined).valid).toBe(false);
    });
  });

  describe("validatePage", () => {
    it("accepts positive integer page numbers", () => {
      expect(validatePage(1)).toEqual({ valid: true, value: 1 });
      expect(validatePage(5)).toEqual({ valid: true, value: 5 });
      expect(validatePage("3")).toEqual({ valid: true, value: 3 });
    });

    it("rejects non-numeric pages and defaults to 1", () => {
      expect(validatePage("abc").valid).toBe(false);
      expect(validatePageNumber("abc")).toBe(1);
      expect(validatePage({}).valid).toBe(false);
      expect(validatePageNumber({})).toBe(1);
    });

    it("rejects negative and zero pages and defaults to 1", () => {
      expect(validatePage(-5).valid).toBe(false);
      expect(validatePageNumber(-5)).toBe(1);
      expect(validatePage(0).valid).toBe(false);
      expect(validatePageNumber(0)).toBe(1);
      expect(validatePage("-10").valid).toBe(false);
      expect(validatePageNumber("-10")).toBe(1);
    });
  });

  describe("validateSearchQuery", () => {
    it("accepts queries under or equal to 100 characters and trims them", () => {
      const query = "  alice smith  ";
      const result = validateSearchQuery(query);
      expect(result.valid).toBe(true);
      expect(result.value).toBe("alice smith");
    });

    it("rejects queries exceeding 100 characters", () => {
      const longQuery = "a".repeat(101);
      const result = validateSearchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.value).toHaveLength(100);
    });
  });

  describe("validateSortKey", () => {
    it("accepts valid sort keys in the allowlist", () => {
      expect(validateSortKey("name").valid).toBe(true);
      expect(validateSortKey("createdAt").valid).toBe(true);
      expect(validateSortKey("lastSignedInAt").valid).toBe(true);
    });

    it("rejects unknown sort keys", () => {
      const result = validateSortKey("password");
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unknown sort key "password"');
    });

    it("rejects empty or arbitrary sort keys", () => {
      expect(validateSortKey("").valid).toBe(false);
      expect(validateSortKey("DROP TABLE").valid).toBe(false);
    });
  });
});
