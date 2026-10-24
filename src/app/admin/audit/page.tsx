import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Shield, RotateCcw, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Audit Trail | Kavya Labs",
  description: "Administrative action history and role change audit logs.",
};

interface AdminAuditPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  // Call requireAdmin() at the top of every /admin page
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

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

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
            <Shield className="h-7 w-7 text-amber-400" aria-hidden="true" />
            Administrative Audit Trail
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Immutable log of role changes and administrative actions. User sessions and sign-in histories are never exposed here.
          </p>
        </div>

        {/* Search Bar */}
        <form
          action="/admin/audit"
          method="GET"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Filter by actor or target..."
              maxLength={100}
              aria-label="Search audit log"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
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
                <th scope="col" className="px-6 py-4">Role Transition</th>
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
                            <Shield className="h-3 w-3" aria-hidden="true" />
                          </span>
                          <span>{actorDisplay}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {targetDisplay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {log.oldRole}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {log.newRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 flex items-center gap-1.5 mt-2 sm:mt-0">
                        <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                        {formattedTime}
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
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Previous
                </Link>
              ) : (
                <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-xl border border-slate-900 px-3 py-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
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
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-xl border border-slate-900 px-3 py-1.5">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
