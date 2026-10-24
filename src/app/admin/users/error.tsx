"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "@/components/icons";

interface AdminUsersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminUsersError({ error, reset }: AdminUsersErrorProps) {
  useEffect(() => {
    console.error("Admin users error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-sm text-center max-w-lg mx-auto my-12">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-white">Error Loading Users</h2>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        An error occurred while retrieving user accounts. Please try reloading the user list.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
