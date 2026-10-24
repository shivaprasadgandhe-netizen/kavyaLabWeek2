import { requireAdmin } from "@/lib/auth-guards";
import { db, withRetry } from "@/lib/db";
import Link from "next/link";
import { UserAdminActions } from "./user-admin-actions";
import {
  validateSearchQuery,
  validatePageNumber,
  validateSortKey,
  validateSortDir,
  ALLOWED_USER_SORT_KEYS,
} from "@/lib/validation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Shield,
  RotateCcw,
  AlertTriangle,
} from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Kavya Labs Admin",
  description: "Manage users, change roles, and view user details.",
};

interface AdminUsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { user: actor } = await requireAdmin();
  const resolvedSearchParams = await searchParams;

  // Validate search query (trimmed, max 100 characters)
  const qValidation = validateSearchQuery(resolvedSearchParams.q);
  const q = qValidation.value;

  // Validate page number (positive integer, otherwise 1)
  const page = validatePageNumber(resolvedSearchParams.page);

  // Validate sort key (name, createdAt, lastSignedInAt allowlist)
  const sortValidation = validateSortKey(resolvedSearchParams.sort, ALLOWED_USER_SORT_KEYS);
  const sort = sortValidation.value;

  // Validate sort direction (asc or desc, defaults to desc)
  const dir = validateSortDir(resolvedSearchParams.dir);

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [totalCount, users] = await withRetry(() =>
    Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sort]: dir },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          lastSignedInAt: true,
          suspendedReason: true,
        },
      }),
    ])
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Build query string helper for pagination
  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (dir) params.set("dir", dir);
    params.set("page", String(targetPage));
    return `/admin/users?${params.toString()}`;
  };

  // Build query string helper for column sorting
  const getSortUrl = (columnKey: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("sort", columnKey);

    if (sort === columnKey) {
      params.set("dir", dir === "asc" ? "desc" : "asc");
    } else {
      params.set("dir", columnKey === "name" ? "asc" : "desc");
    }
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View registered accounts, search users, manage roles, and review account suspension states.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form
            action="/admin/users"
            method="GET"
            className="flex items-center gap-2 flex-1 sm:w-auto"
          >
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="dir" value={dir} />
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by name or email..."
                maxLength={100}
                aria-label="Search users by name or email"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
            >
              Search
            </button>
            {q && (
              <Link
                href={`/admin/users?sort=${sort}&dir=${dir}`}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Users Table Container with responsive horizontal scroll */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" className="px-5 py-4">
                  <Link
                    href={getSortUrl("name")}
                    className="inline-flex items-center gap-1.5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -mx-1 transition-colors"
                    aria-label={`Sort by name, currently ${sort === "name" ? dir : "unsorted"}`}
                  >
                    <span>User</span>
                    <span className="text-slate-600 font-mono text-[10px]">{sort === "name" ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
                  </Link>
                </th>

                <th scope="col" className="px-5 py-4">Email</th>
                <th scope="col" className="px-5 py-4">Role</th>
                <th scope="col" className="px-5 py-4">Status</th>

                <th scope="col" className="px-5 py-4">
                  <Link
                    href={getSortUrl("createdAt")}
                    className="inline-flex items-center gap-1.5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -mx-1 transition-colors"
                    aria-label={`Sort by joined date, currently ${sort === "createdAt" ? dir : "unsorted"}`}
                  >
                    <span>Joined (UTC)</span>
                    <span className="text-slate-600 font-mono text-[10px]">{sort === "createdAt" ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
                  </Link>
                </th>

                <th scope="col" className="px-5 py-4">
                  <Link
                    href={getSortUrl("lastSignedInAt")}
                    className="inline-flex items-center gap-1.5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1 -mx-1 transition-colors"
                    aria-label={`Sort by last sign-in, currently ${sort === "lastSignedInAt" ? dir : "unsorted"}`}
                  >
                    <span>Last Sign-In (UTC)</span>
                    <span className="text-slate-600 font-mono text-[10px]">{sort === "lastSignedInAt" ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
                  </Link>
                </th>

                <th scope="col" className="px-5 py-4">Suspension Reason</th>
                <th scope="col" className="px-5 py-4">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-transparent text-slate-300">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    {q ? (
                      <div className="space-y-2">
                        <p className="text-base text-slate-300 font-medium">
                          No users match your search
                        </p>
                        <p className="text-xs text-slate-500">
                          Try searching for another keyword or clear the search filter.
                        </p>
                        <div className="pt-2">
                          <Link
                            href={`/admin/users?sort=${sort}&dir=${dir}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Clear search</span>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      "No registered users found."
                    )}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === actor.id;
                  const joinedDate = u.createdAt.toISOString().slice(0, 10);
                  const lastSignIn = u.lastSignedInAt
                    ? u.lastSignedInAt.toISOString().slice(0, 16).replace("T", " ") + " UTC"
                    : "Never";

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/30 transition-colors animate-in fade-in duration-200 ${
                        isSelf ? "bg-indigo-950/15" : ""
                      }`}
                    >
                      {/* Name with "You" badge */}
                      <td className="px-5 py-4 font-medium text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-semibold text-xs ring-1 ring-slate-700">
                            {u.name?.charAt(0) || u.email?.charAt(0) || "U"}
                          </span>
                          <span className="font-semibold">{u.name || "Anonymous"}</span>
                          {isSelf && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                        {u.email || "No email"}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {u.role === "ADMIN" ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/15 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {joinedDate}
                      </td>

                      <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                        {lastSignIn}
                      </td>

                      <td className="px-5 py-4 text-slate-400 max-w-xs truncate text-xs">
                        {u.suspendedReason ? (
                          <span className="flex items-center gap-1 text-red-300 font-medium">
                            <AlertTriangle className="h-3 w-3 shrink-0 text-red-400" />
                            <span className="truncate">{u.suspendedReason}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <UserAdminActions
                          userId={u.id}
                          userName={u.name}
                          currentRole={u.role}
                          currentStatus={u.status}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pager Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{users.length > 0 ? skip + 1 : 0}</span> to{" "}
            <span className="font-semibold text-white">{Math.min(skip + pageSize, totalCount)}</span> of{" "}
            <span className="font-semibold text-white">{totalCount}</span> users
            {q && ` (filtered for "${q}")`}
          </div>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={getPageUrl(page - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-900 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-600 cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </span>
            )}

            <span className="px-2 text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={getPageUrl(page + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-900 bg-slate-950/40 px-3 py-1.5 text-xs font-medium text-slate-600 cursor-not-allowed">
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
