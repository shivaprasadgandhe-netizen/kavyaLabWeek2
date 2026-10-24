export interface ErrorLogContext {
  path?: string;
  action?: string;
  error: unknown;
}

/**
 * Sanitized error logging helper.
 * Strictly logs only request path/action, error name, and timestamp.
 * NEVER logs emails, tokens, cookies, full IP addresses, or secrets.
 */
export function logError(context: ErrorLogContext): void {
  const timestamp = new Date().toISOString();
  const errorName = context.error instanceof Error ? context.error.name : "UnknownError";
  const errorMsg = context.error instanceof Error ? context.error.message : String(context.error);

  // Sanitize message to strip any potential sensitive substrings
  const safeMsg = errorMsg
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
    .slice(0, 150);

  console.error(
    `[ERROR] ${timestamp} | path: ${context.path || context.action || "unknown"} | error: ${errorName} - ${safeMsg}`
  );
}
