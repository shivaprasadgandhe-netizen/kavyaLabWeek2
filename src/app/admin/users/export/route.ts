import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { checkAdminUserCsvExportRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  validateSearchQuery,
  validateSortKey,
  validateSortDir,
  ALLOWED_USER_SORT_KEYS,
} from "@/lib/validation";

/**
 * Sanitizes and escapes a CSV cell value.
 * - Prevents CSV formula injection by prefixing any cell starting with =, +, -, or @ with a single quote.
 * - Quotes fields containing commas, double quotes, or newlines.
 */
function sanitizeCsvCell(raw: string | null | undefined): string {
  if (raw == null) return "";
  let str = String(raw);

  // Prevent CSV formula injection (Excel / Google Sheets execution vulnerability)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // Quote field if it contains commas, double quotes, or newlines
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function GET(request: Request) {
  try {
    const { user: admin } = await requireAdmin();

    // Rate limiting: 10 export requests per admin per hour
    const { allowed, retryAfterSeconds } = await checkAdminUserCsvExportRateLimit(admin.id);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Rate limit exceeded. Export is limited to 10 requests per hour.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const qValidation = validateSearchQuery(searchParams.get("q"));
    const q = qValidation.value;

    const sortValidation = validateSortKey(
      searchParams.get("sort"),
      ALLOWED_USER_SORT_KEYS
    );
    const sortKey = sortValidation.value;
    const sortDir = validateSortDir(searchParams.get("dir"));

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortKey]: sortDir },
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastSignedInAt: true,
      },
    });

    // Generate CSV content with exactly the allowed columns:
    // name, email, role, status, joined date, last sign-in
    const headers = ["Name", "Email", "Role", "Status", "Joined Date", "Last Sign-In"];
    const rows = users.map((u) => [
      sanitizeCsvCell(u.name || "Anonymous"),
      sanitizeCsvCell(u.email || ""),
      sanitizeCsvCell(u.role),
      sanitizeCsvCell(u.status),
      sanitizeCsvCell(u.createdAt.toISOString().slice(0, 10)),
      sanitizeCsvCell(
        u.lastSignedInAt
          ? u.lastSignedInAt.toISOString().slice(0, 19).replace("T", " ") + " UTC"
          : "Never"
      ),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="users-export.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    logError({ path: "/admin/users/export", error });
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate CSV export." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
