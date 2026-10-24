"use client";

import { useState, useTransition } from "react";
import { signOutOtherSessions, signOutEverywhere } from "./actions";
import { LogOut, Laptop, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SessionManagementClientProps {
  hasOtherSessions: boolean;
}

export default function SessionManagementClient({
  hasOtherSessions,
}: SessionManagementClientProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSignOutOthers = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await signOutOtherSessions();
        if (res.success) {
          setMessage({ type: "success", text: "Successfully signed out of all other sessions." });
        } else {
          setMessage({ type: "error", text: res.error || "Failed to revoke sessions." });
        }
      } catch (err: unknown) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      }
    });
  };

  const handleSignOutEverywhere = () => {
    if (confirm("Are you sure you want to sign out everywhere? You will need to log in again.")) {
      startTransition(async () => {
        await signOutEverywhere();
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSignOutOthers}
          disabled={isPending || !hasOtherSessions}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Laptop className="h-4 w-4 text-indigo-400" aria-hidden="true" />
          )}
          Sign Out Other Sessions
        </button>

        <button
          onClick={handleSignOutEverywhere}
          disabled={isPending}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-2 text-xs sm:text-sm font-semibold text-red-300 hover:bg-red-900/50 hover:text-red-100 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign Out Everywhere
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl p-3 text-xs sm:text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-950/40 border border-emerald-800/60 text-emerald-300"
              : "bg-red-950/40 border border-red-800/60 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
