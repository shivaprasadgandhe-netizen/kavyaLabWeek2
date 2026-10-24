/**
 * Input validation helpers.
 * Pure logic module with NO Prisma or Next.js dependencies.
 */

export type Role = "USER" | "ADMIN";

export interface ValidationResult<T> {
  valid: boolean;
  value: T;
  error?: string;
}

/**
 * Validates user role. Strictly "USER" or "ADMIN" only.
 * Rejects empty roles, "SUPERADMIN", or arbitrary strings.
 */
export function validateRole(role: unknown): ValidationResult<Role> {
  if (typeof role !== "string" || !role.trim()) {
    return {
      valid: false,
      value: "USER",
      error: "Role cannot be empty. Must be strictly USER or ADMIN.",
    };
  }

  const trimmed = role.trim();
  if (trimmed !== "USER" && trimmed !== "ADMIN") {
    return {
      valid: false,
      value: "USER",
      error: `Invalid role "${trimmed}". Role must be strictly "USER" or "ADMIN".`,
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validates and parses page numbers.
 * Rejects non-numeric, negative, or zero pages, defaulting fallback to 1.
 */
export function validatePage(page: unknown): ValidationResult<number> {
  if (typeof page === "number") {
    if (Number.isInteger(page) && page > 0) {
      return { valid: true, value: page };
    }
    return {
      valid: false,
      value: 1,
      error: "Page must be a positive integer greater than 0.",
    };
  }

  if (typeof page === "string") {
    const trimmed = page.trim();
    if (!/^\d+$/.test(trimmed)) {
      return {
        valid: false,
        value: 1,
        error: "Page must be a numeric integer.",
      };
    }
    const parsed = parseInt(trimmed, 10);
    if (parsed <= 0) {
      return {
        valid: false,
        value: 1,
        error: "Page must be greater than 0.",
      };
    }
    return { valid: true, value: parsed };
  }

  return {
    valid: false,
    value: 1,
    error: "Invalid page parameter provided.",
  };
}

/**
 * Convenience helper returning the sanitized page number directly (defaults to 1).
 */
export function validatePageNumber(page: unknown): number {
  return validatePage(page).value;
}

/**
 * Validates search query strings.
 * Trims input and enforces a strict 100 character maximum limit.
 */
export function validateSearchQuery(q: unknown): ValidationResult<string> {
  if (typeof q !== "string") {
    return { valid: true, value: "" };
  }

  const trimmed = q.trim();
  if (trimmed.length > 100) {
    return {
      valid: false,
      value: trimmed.slice(0, 100),
      error: "Search query exceeds maximum length of 100 characters.",
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Default allowed sort keys for user management.
 */
export const ALLOWED_USER_SORT_KEYS = ["name", "createdAt", "lastSignedInAt"] as const;
export type UserSortKey = (typeof ALLOWED_USER_SORT_KEYS)[number];

export const ALLOWED_SORT_DIRS = ["asc", "desc"] as const;
export type SortDir = (typeof ALLOWED_SORT_DIRS)[number];

/**
 * Validates sort keys against an explicit allowlist.
 * Rejects unknown or unapproved keys.
 */
export function validateSortKey(
  key: unknown,
  allowed: readonly string[] = ALLOWED_USER_SORT_KEYS
): ValidationResult<string> {
  if (typeof key !== "string" || !key.trim()) {
    return {
      valid: false,
      value: allowed[0] || "createdAt",
      error: "Sort key is required.",
    };
  }

  const trimmed = key.trim();
  if (!allowed.includes(trimmed)) {
    return {
      valid: false,
      value: allowed[0] || "createdAt",
      error: `Unknown sort key "${trimmed}". Allowed keys: ${allowed.join(", ")}.`,
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Validates sort direction ("asc" or "desc", defaulting to "desc").
 */
export function validateSortDir(dir: unknown): SortDir {
  if (dir === "asc" || dir === "desc") {
    return dir;
  }
  return "desc";
}

/**
 * Validates and normalizes email addresses.
 */
export function validateEmail(email: unknown): ValidationResult<string> {
  if (typeof email !== "string") {
    return { valid: false, value: "", error: "Email must be a string." };
  }
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, value: "", error: "Email address is required." };
  }
  if (trimmed.length > 254) {
    return { valid: false, value: "", error: "Email address exceeds maximum length." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, value: "", error: "Invalid email address format." };
  }
  return { valid: true, value: trimmed };
}

/**
 * Validates suspension reasons: required on suspend, between 3 and 200 characters.
 */
export function validateSuspensionReason(reason: unknown): ValidationResult<string> {
  if (typeof reason !== "string") {
    return { valid: false, value: "", error: "Suspension reason must be provided as text." };
  }
  const trimmed = reason.trim();
  if (trimmed.length < 3) {
    return { valid: false, value: "", error: "Reason must be at least 3 characters long." };
  }
  if (trimmed.length > 200) {
    return { valid: false, value: "", error: "Reason cannot exceed 200 characters." };
  }
  return { valid: true, value: trimmed };
}
