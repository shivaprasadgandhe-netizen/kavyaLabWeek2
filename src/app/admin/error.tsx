"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/60 text-red-400 border border-red-900/60 shadow-lg mb-6">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        An error occurred while loading administrative data. Please try again or return to the dashboard.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
