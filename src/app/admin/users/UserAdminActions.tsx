"use client";

import { useState, useTransition } from "react";
import { changeRole, suspendUser, reactivateUser } from "./actions";
import { Shield, ShieldAlert, Check, Loader2, Ban, UserCheck } from "lucide-react";

interface UserAdminActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
  isSelf: boolean;
}

export default function UserAdminActions({
  userId,
  currentRole,
  currentStatus,
  isSelf,
}: UserAdminActionsProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Suspension modal/inline state
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const handleRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await changeRole(userId, selectedRole);
        if (!result.success) {
          setErrorMessage(result.error || "Failed to update role");
          setSelectedRole(currentRole);
        } else {
          setSuccessMessage("Role updated successfully.");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "An error occurred.");
        setSelectedRole(currentRole);
      }
    });
  };

  const handleSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await suspendUser(userId, suspendReason);
        if (!result.success) {
          setErrorMessage(result.error || "Failed to suspend user.");
        } else {
          setSuccessMessage("User has been suspended.");
          setIsSuspending(false);
          setSuspendReason("");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handleReactivate = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await reactivateUser(userId);
        if (!result.success) {
          setErrorMessage(result.error || "Failed to reactivate user.");
        } else {
          setSuccessMessage("User reactivated successfully.");
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[260px]">
      {/* Role selector and save button */}
      <form onSubmit={handleRoleChange} className="flex items-center gap-2">
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
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Shield className="h-3 w-3" aria-hidden="true" />
          )}
          <span>Role</span>
        </button>

        {/* Suspend or Reactivate button */}
        {currentStatus === "ACTIVE" ? (
          <button
            type="button"
            onClick={() => {
              setIsSuspending(!isSuspending);
              setErrorMessage(null);
            }}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-red-800/80 bg-red-950/40 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-colors disabled:opacity-40"
          >
            <Ban className="h-3 w-3" aria-hidden="true" />
            <span>Suspend</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/80 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <UserCheck className="h-3 w-3" aria-hidden="true" />
            )}
            <span>Reactivate</span>
          </button>
        )}
      </form>

      {/* Inline reason field when Suspend is clicked */}
      {isSuspending && (
        <form onSubmit={handleSuspend} className="mt-1 space-y-2 rounded-lg border border-red-900/60 bg-red-950/30 p-2.5">
          <label htmlFor={`suspend-reason-${userId}`} className="block text-[11px] font-medium text-red-200">
            Suspension Reason (required, 3-200 chars):
          </label>
          <input
            id={`suspend-reason-${userId}`}
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="e.g. Violation of Acceptable Use Policy"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending || suspendReason.trim().length < 3}
              className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
              Confirm Suspend
            </button>
            <button
              type="button"
              onClick={() => setIsSuspending(false)}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isSelf && (
        <span className="text-[11px] text-amber-400/90 font-medium">
          (Your Account)
        </span>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/60 border border-red-900/80 rounded px-2 py-1"
        >
          <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 rounded px-2 py-1"
        >
          <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
