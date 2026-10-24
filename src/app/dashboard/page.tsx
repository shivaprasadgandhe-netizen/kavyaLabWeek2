import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, LogOut, ArrowLeft, Shield, User as UserIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Kavya Labs",
  description: "User dashboard and account management.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, image, role } = session.user;
  const userRole = (role as string) || "USER";
  const isAdmin = userRole.toUpperCase() === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl sm:text-2xl tracking-tight text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-lg py-1 px-1.5 transition-colors hover:text-indigo-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Kavya Labs
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-2 py-1 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Landing Page
            </Link>

            {/* Server Action Sign Out Button */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                id="sign-out-button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              User Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Welcome back to your Kavya Labs account portal.
            </p>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-slate-800/80">
              {/* User Avatar */}
              <div className="relative">
                {image ? (
                  <Image
                    src={image}
                    alt={name ? `${name}'s avatar` : "User avatar"}
                    width={80}
                    height={80}
                    priority
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/50 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-indigo-500/50 shadow-md">
                    {name?.charAt(0) || email?.charAt(0) || "U"}
                  </div>
                )}
                {isAdmin && (
                  <span
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 ring-2 ring-slate-900"
                    title="Admin Account"
                  >
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white truncate">
                    {name || "User"}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isAdmin
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {isAdmin ? (
                      <Shield className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <UserIcon className="h-3 w-3" aria-hidden="true" />
                    )}
                    Role: {userRole}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400 truncate">
                  {email}
                </p>
              </div>
            </div>

            {/* Profile Details Grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Full Name
                </dt>
                <dd className="mt-1 text-base font-medium text-white">
                  {name || "Not provided"}
                </dd>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Email Address
                </dt>
                <dd className="mt-1 text-base font-medium text-white truncate">
                  {email || "Not provided"}
                </dd>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Assigned Role
                </dt>
                <dd className="mt-1 text-base font-medium text-white flex items-center gap-2">
                  <span>{userRole}</span>
                  {isAdmin && (
                    <span className="text-xs text-amber-400 font-normal">
                      (Administrator privileges enabled)
                    </span>
                  )}
                </dd>
              </div>

              <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Authentication Provider
                </dt>
                <dd className="mt-1 text-base font-medium text-white">
                  Google OAuth
                </dd>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Session verified via server-side Auth.js and Next.js middleware protection.
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600/90 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 active:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
