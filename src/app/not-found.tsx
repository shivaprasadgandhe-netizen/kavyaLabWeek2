import Link from "next/link";
import { Sparkles, Home, ArrowLeft } from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Kavya Labs",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center">
        {/* Brand Wordmark */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-lg p-1 transition-colors hover:text-indigo-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Kavya Labs
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-5">
            <span className="text-2xl font-black">404</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Page Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Return to Home
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go to Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Need assistance? Contact our engineering team at Kavya Labs.
        </p>
      </div>
    </div>
  );
}
