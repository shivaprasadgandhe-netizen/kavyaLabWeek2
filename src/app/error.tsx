"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, Home, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service or console in dev
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-rose-600/15 via-indigo-600/10 to-transparent blur-3xl" />
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-5">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            We encountered an unexpected error while processing your request. Please try again or return to the main dashboard.
          </p>

          {error.digest && (
            <div className="mt-4 rounded-lg bg-slate-950/60 border border-slate-800/80 px-3 py-2 text-xs text-slate-500 font-mono">
              Error Reference ID: {error.digest}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Return to Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          If this issue persists, please reach out to our team at{" "}
          <span className="text-slate-400">support@kavyalabs.ai</span>
        </p>
      </div>
    </div>
  );
}
