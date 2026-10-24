import { requireAdmin } from "@/lib/auth-guards";
import { signOut } from "@/auth";
import Link from "next/link";
import { Sparkles, BarChart3, Users, LayoutDashboard, LogOut, Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 font-bold text-xl sm:text-2xl tracking-tight text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-lg py-1 px-1.5 transition-colors hover:text-indigo-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Kavya Labs
              </span>
            </Link>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Admin Portal
            </span>
          </div>

          {/* Navigation Links & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                <BarChart3 className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                <Users className="h-4 w-4 text-indigo-400" aria-hidden="true" />
                <span>Users</span>
              </Link>
            </nav>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-2 py-1"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">Dashboard</span>
            </Link>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
