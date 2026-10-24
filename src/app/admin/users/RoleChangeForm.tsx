"use client";

import { useState, useTransition } from "react";
import { changeRole } from "./actions";
import { Shield, ShieldAlert, Check, Loader2 } from "lucide-react";

interface RoleChangeFormProps {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export default function RoleChangeForm({
  userId,
  currentRole,
  isSelf,
}: RoleChangeFormProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await changeRole(userId, selectedRole);
        if (!result.success) {
          setErrorMessage(result.error || "Failed to update role");
          // Revert select back to currentRole if failed
          setSelectedRole(currentRole);
        } else {
          setSuccessMessage("Role updated");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setErrorMessage(message);
        setSelectedRole(currentRole);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-[200px]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={isPending}
          aria-label="Select role"
          className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="submit"
          disabled={isPending || selectedRole === currentRole}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Shield className="h-3 w-3" aria-hidden="true" />
              <span>Save</span>
            </>
          )}
        </button>
      </form>

      {isSelf && (
        <span className="text-[11px] text-amber-400/90 font-medium">
          (Your Account)
        </span>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/40 border border-red-900/60 rounded px-2 py-1"
        >
          <ShieldAlert className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded px-2 py-1"
        >
          <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
