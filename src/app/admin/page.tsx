import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import SignupsChart from "./SignupsChart";
import { Users, Shield, UserPlus, LogIn, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Analytics | Kavya Labs",
  description: "Administrative analytics dashboard and platform metrics.",
};

export default async function AdminAnalyticsPage() {
  // Call requireAdmin() at the top of every /admin page
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 30-day UTC window for daily signups chart
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const thirtyDaysAgoUTC = new Date(todayUTC);
  thirtyDaysAgoUTC.setUTCDate(thirtyDaysAgoUTC.getUTCDate() - 29);

  // Parallel database queries with Promise.all
  const [
    totalUsers,
    adminCount,
    newUsers7Days,
    signIns24Hours,
    suspendedUsers,
    rawDailySignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { lastSignedInAt: { gte: twentyFourHoursAgo } } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT 
        DATE_TRUNC('day', "createdAt") AT TIME ZONE 'UTC' AS day,
        COUNT(*)::int AS count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgoUTC}
      GROUP BY DATE_TRUNC('day', "createdAt") AT TIME ZONE 'UTC'
      ORDER BY day ASC
    `,
  ]);

  // Build map of counts by UTC date 'YYYY-MM-DD'
  const countsByDate = new Map<string, number>();
  for (const row of rawDailySignups) {
    const d = new Date(row.day);
    const key = d.toISOString().slice(0, 10);
    countsByDate.set(key, Number(row.count));
  }

  // Construct exact 30-day series in JavaScript, filling missing days with 0
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgoUTC);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = `${monthNames[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
    chartData.push({
      date: label,
      count: countsByDate.get(key) ?? 0,
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Platform Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time metrics, platform usage summary, account security statuses, and UTC signup trends.
        </p>
      </div>

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Users
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {totalUsers}
            </p>
          </div>
        </div>

        {/* Admins */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
            <Shield className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Admins
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {adminCount}
            </p>
          </div>
        </div>

        {/* New Users (7 Days) */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              New (7 Days)
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {newUsers7Days}
            </p>
          </div>
        </div>

        {/* Sign-ins (24 Hours) */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <LogIn className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Sign-Ins (24h)
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {signIns24Hours}
            </p>
          </div>
        </div>

        {/* Suspended Users */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm shadow-lg flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <Shield className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Suspended
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {suspendedUsers}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-6 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-indigo-400" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Daily Signups (Last 30 Days)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            All calculations grouped by UTC calendar day
          </span>
        </div>

        {totalUsers === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No data yet
          </div>
        ) : (
          <SignupsChart data={chartData} />
        )}
      </div>
    </div>
  );
}
