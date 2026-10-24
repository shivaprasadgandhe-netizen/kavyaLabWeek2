import { requireUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import SessionManagementClient from "./SessionManagementClient";
import DeleteAccountForm from "./DeleteAccountForm";
import {
  ShieldCheck,
  History,
  Laptop,
  Download,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Security & Privacy | Kavya Labs",
  description: "Manage your active sessions, security audit history, data export, and account deletion.",
};

interface SecurityPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function SecurityPage({ searchParams }: SecurityPageProps) {
  const { user } = await requireUser();

  const resolvedParams = searchParams ? await searchParams : undefined;
  const rawPage = resolvedParams?.page;
  let page = 1;
  if (typeof rawPage === "string") {
    const parsed = parseInt(rawPage, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  // 1. Identify current session token via cookies
  const cookieStore = await cookies();
  const currentToken =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value;

  const currentSessionRow = currentToken
    ? await prisma.session.findUnique({
        where: { sessionToken: currentToken },
        select: { id: true },
      })
    : null;

  // 2. Load active sessions for this user (never expose token)
  const activeSessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      expires: true,
      userAgent: true,
    },
  });

  const hasOtherSessions = activeSessions.some(
    (s) => !currentSessionRow || s.id !== currentSessionRow.id
  );

  // 3. Security events with pagination (20 per page)
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [totalEvents, events] = await Promise.all([
    prisma.securityEvent.count({ where: { userId: user.id } }),
    prisma.securityEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        type: true,
        createdAt: true,
        userAgent: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalEvents / pageSize));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-1.5 py-1"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-semibold text-white">Security & Controls</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              user.status === "ACTIVE"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/15 text-red-300 border border-red-500/30"
            }`}
          >
            <Radio className="h-3 w-3" aria-hidden="true" />
            Status: {user.status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section: Overview */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-400" aria-hidden="true" />
              Account Security & Privacy
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Manage your active login sessions, inspect your personal security audit history, download your data export, or manage account lifecycle.
            </p>
          </div>

          {/* Section: Active Sessions */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Laptop className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
              </div>
              <span className="text-xs text-slate-400">
                {activeSessions.length} active session{activeSessions.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="space-y-3">
              {activeSessions.map((session) => {
                const isCurrent = currentSessionRow && session.id === currentSessionRow.id;
                const formattedStart = session.createdAt.toISOString().slice(0, 16).replace("T", " ") + " UTC";
                const userAgentDisplay = session.userAgent
                  ? session.userAgent.slice(0, 75)
                  : "Browser session";

                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isCurrent
                        ? "border-indigo-500/40 bg-indigo-950/20 shadow-md"
                        : "border-slate-800 bg-slate-950/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                        <Laptop className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{userAgentDisplay}</p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          Started: {formattedStart}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Session Management Buttons */}
            <div className="pt-2">
              <SessionManagementClient hasOtherSessions={hasOtherSessions} />
            </div>
          </div>

          {/* Section: Data Export */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Download className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Export Your Data</h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
                Download a complete, machine-readable JSON archive of your personal profile, connected accounts, session logs, and security events. Tokens are never included.
              </p>
            </div>

            <a
              href="/api/account/export"
              download
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Archive
            </a>
          </div>

          {/* Section: Security Event History */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <History className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-white">Security Event Log</h2>
              </div>
              <span className="text-xs text-slate-400">
                Most recent activity ({totalEvents} total logged)
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-800/80 text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="py-3 px-4">Event Type</th>
                    <th scope="col" className="py-3 px-4">Timestamp (UTC)</th>
                    <th scope="col" className="py-3 px-4">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">
                        No security events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => {
                      const formattedTime = ev.createdAt.toISOString().slice(0, 16).replace("T", " ") + " UTC";
                      return (
                        <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                              {ev.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-400">
                            {formattedTime}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400 truncate max-w-xs">
                            {ev.userAgent || "Unknown device"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/dashboard/security?page=${page - 1}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-slate-800"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Previous
                    </Link>
                  ) : (
                    <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-lg border border-slate-900 px-2.5 py-1">
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Previous
                    </span>
                  )}
                  {page < totalPages ? (
                    <Link
                      href={`/dashboard/security?page=${page + 1}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:bg-slate-800"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="opacity-40 cursor-not-allowed inline-flex items-center gap-1 rounded-lg border border-slate-900 px-2.5 py-1">
                      Next
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section: Account Deletion (Danger Zone) */}
          <DeleteAccountForm userEmail={user.email || ""} />
        </div>
      </main>
    </div>
  );
}
