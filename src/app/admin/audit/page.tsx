import { requireAdmin } from "@/lib/auth-guards";
import { db, withRetry } from "@/lib/db";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Shield, RotateCcw, Clock, ArrowRight } from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Audit Trail | Kavya Labs",
  description: "Administrative action history and audit logs.",
};

interface AdminAuditPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  await requireAdmin();

  const resolvedParams = searchParams ? await searchParams : undefined;
  const rawQ = resolvedParams?.q;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 100) : "";

  const rawPage = resolvedParams?.page;
  let page = 1;
  if (typeof rawPage === "string") {
    const parsed = parseInt(rawPage, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  const where = q
    ? {
        OR: [
          { actor: { name: { contains: q, mode: "insensitive" as const } } },
          { actor: { email: { contains: q, mode: "insensitive" as const } } },
          { targetUser: { name: { contains: q, mode: "insensitive" as const } } },
          { targetUser: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [totalCount, logs] = await withRetry(() =>
    Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { id: true, name: true, email: true } },
          targetUser: { select: { id: true, name: true, email: true } },
        },
      }),
    ])
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(targetPage));
    return `/admin/audit?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-amber-400" />
            Administrative Audit Trail
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Immutable log of role changes and administrative actions. Target user links are retained even if user is deleted.
          </p>
        </div>

        {/* Search Bar */}
        <form
          action="/admin/audit"
          method="GET"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Filter by actor or target..."
              maxLength={100}
              aria-label="Search audit log"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Search
          </button>
          {q && (
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Link>
          )}
        </form>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4">Actor (Admin)</th>
                <th scope="col" className="px-6 py-4">Target User</th>
                <th scope="col" className="px-6 py-4">Action &amp; Details</th>
                <th scope="col" className="px-6 py-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {q ? `No audit records found matching "${q}".` : "No administrative audit records logged yet."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actorDisplay = log.actor ? `${log.actor.name || log.actor.email}` : "System / Deleted Admin";
                  const targetDisplay = log.targetUser ? `${log.targetUser.name || log.targetUser.email}` : "Deleted User";
                  const formattedTime = log.createdAt.toISOString().slice(0, 16).replace("T", " ") + " UTC";

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-300 font-semibold text-xs border border-amber-500/20">
                            <Shield className="h-3 w-3" />
                          </span>
                          <span>{actorDisplay}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {targetDisplay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              log.action === "ROLE_CHANGED"
                                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                                : log.action === "SUSPENDED"
                                ? "bg-red-500/15 text-red-300 border border-red-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {log.action}
                          </span>
                          {log.oldValue && log.newValue && (
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                              <span className="text-slate-400">{log.oldValue}</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <span className="text-white font-medium">{log.newValue}</span>
                            </div>
                          )}
                          {!log.oldValue && log.newValue && (
                            <span className="text-xs text-slate-400">({log.newValue})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {formattedTime}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
            <div>
              Showing {logs.length > 0 ? skip + 1 : 0} to {Math.min(skip + pageSize, totalCount)} of {totalCount} records
            </div>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={getPageUrl(page - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-xl border border-slate-900 px-3 py-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </span>
              )}
              <span>Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link
                  href={getPageUrl(page + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-xl border border-slate-900 px-3 py-1.5">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
