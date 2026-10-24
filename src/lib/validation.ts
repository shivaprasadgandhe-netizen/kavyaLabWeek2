import { Role } from "@prisma/client";

/**
 * Validates and normalizes email addresses.
 */
export function validateEmail(email: unknown): { valid: boolean; value: string; error?: string } {
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
 * Validates user role. Must be strictly "USER" or "ADMIN".
 */
export function validateRole(role: unknown): { valid: boolean; value: Role; error?: string } {
  if (role !== "USER" && role !== "ADMIN") {
    return {
      valid: false,
      value: "USER" as Role,
      error: 'Invalid role specified. Role must be exactly "USER" or "ADMIN".',
    };
  }
  return { valid: true, value: role as Role };
}

/**
 * Validates suspension reason: required on suspend, between 3 and 200 characters.
 */
export function validateSuspensionReason(reason: unknown): {
  valid: boolean;
  value: string;
  error?: string;
} {
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

/**
 * Validates and parses positive integer page numbers, defaulting to 1 for invalid values.
 */
export function validatePageNumber(page: unknown): number {
  if (typeof page === "string") {
    const parsed = parseInt(page, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  } else if (typeof page === "number" && page > 0 && Number.isInteger(page)) {
    return page;
  }
  return 1;
}

/**
 * Validates search query strings, trimming and capping at 100 characters.
 */
export function validateSearchQuery(q: unknown): string {
  if (typeof q === "string") {
    return q.trim().slice(0, 100);
  }
  return "";
}
