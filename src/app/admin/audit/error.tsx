"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "@/components/icons";
import Link from "next/link";

export default function AdminAuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin audit error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/60 text-red-400 border border-red-900/60 shadow-lg mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Failed to load audit records
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        An error occurred while loading the administrative audit trail.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => reset()}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try again</span>
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Back to Overview
        </Link>
      </div>
    </div>
  );
}
