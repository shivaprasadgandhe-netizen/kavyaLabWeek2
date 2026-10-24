"use client";

import { useState, useTransition, useActionState, useEffect, useRef } from "react";
import { changeRoleFormAction, suspendUser, reactivateUser, type AdminActionResult } from "./actions";
import { RoleChangeModal } from "./role-change-modal";
import { Shield, ShieldAlert, Check, Loader2, Ban, UserCheck } from "@/components/icons";

interface UserAdminActionsProps {
  userId: string;
  userName?: string | null;
  currentRole: string;
  currentStatus: string;
  isSelf: boolean;
}

const initialActionState: AdminActionResult = { success: false };

export function UserAdminActions({
  userId,
  userName,
  currentRole,
  currentStatus,
  isSelf,
}: UserAdminActionsProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const roleButtonRef = useRef<HTMLButtonElement>(null);

  // useActionState for role change form action
  const [roleState, formAction, isRolePending] = useActionState(
    changeRoleFormAction,
    initialActionState
  );

  // Transitions for suspend/reactivate actions
  const [isStatusPending, startTransition] = useTransition();
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(null);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // Suspension modal/inline state
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  // Dismiss success messages after a delay
  const [visibleRoleSuccess, setVisibleRoleSuccess] = useState(false);
  useEffect(() => {
    if (roleState.success) {
      setVisibleRoleSuccess(true);
      const timer = setTimeout(() => setVisibleRoleSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [roleState]);

  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === currentRole) return;
    setIsConfirmModalOpen(true);
  };

  const handleSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusErrorMessage(null);
    setStatusSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await suspendUser(userId, suspendReason);
        if (!result.success) {
          setStatusErrorMessage(result.error || "Failed to suspend user.");
        } else {
          setStatusSuccessMessage("User has been suspended.");
          setIsSuspending(false);
          setSuspendReason("");
          setTimeout(() => setStatusSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        setStatusErrorMessage(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const handleReactivate = () => {
    setStatusErrorMessage(null);
    setStatusSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await reactivateUser(userId);
        if (!result.success) {
          setStatusErrorMessage(result.error || "Failed to reactivate user.");
        } else {
          setStatusSuccessMessage("User reactivated successfully.");
          setTimeout(() => setStatusSuccessMessage(null), 3000);
        }
      } catch (err: unknown) {
        setStatusErrorMessage(err instanceof Error ? err.message : "An error occurred.");
      }
    });
  };

  const isPending = isRolePending || isStatusPending;

  return (
    <div className="flex flex-col gap-2 min-w-[260px]">
      {/* Role selector and save button */}
      <form onSubmit={handleOpenConfirmation} className="flex items-center gap-2">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={isPending}
          aria-label={`Select role for ${userName || "user"}`}
          className="rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          ref={roleButtonRef}
          type="submit"
          disabled={isPending || selectedRole === currentRole || (isSelf && selectedRole === "USER")}
          title={isSelf && selectedRole === "USER" ? "You cannot demote yourself" : undefined}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
        >
          {isRolePending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Shield className="h-3 w-3" />
          )}
          <span>Role</span>
        </button>

        {/* Suspend or Reactivate button */}
        {currentStatus === "ACTIVE" ? (
          <button
            type="button"
            onClick={() => {
              if (isSelf) return;
              setIsSuspending(!isSuspending);
              setStatusErrorMessage(null);
            }}
            disabled={isPending || isSelf}
            title={isSelf ? "You cannot suspend yourself" : undefined}
            className="inline-flex items-center gap-1 rounded-lg border border-red-800/80 bg-red-950/40 px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <Ban className="h-3 w-3" />
            <span>Suspend</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/80 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isStatusPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserCheck className="h-3 w-3" />
            )}
            <span>Reactivate</span>
          </button>
        )}
      </form>

      {/* Confirmation Modal with focus return to roleButtonRef */}
      <RoleChangeModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        userId={userId}
        userName={userName}
        currentRole={currentRole}
        newRole={selectedRole}
        isPending={isRolePending}
        formAction={formAction}
        triggerRef={roleButtonRef}
      />

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
              className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
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

      {/* Feedback Messages */}
      {roleState.error && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/60 border border-red-900/80 rounded px-2 py-1"
        >
          <ShieldAlert className="h-3 w-3 shrink-0" />
          <span>{roleState.error}</span>
        </div>
      )}

      {statusErrorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-950/60 border border-red-900/80 rounded px-2 py-1"
        >
          <ShieldAlert className="h-3 w-3 shrink-0" />
          <span>{statusErrorMessage}</span>
        </div>
      )}

      {visibleRoleSuccess && (
        <div
          role="status"
          className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 rounded px-2 py-1"
        >
          <Check className="h-3 w-3 shrink-0" />
          <span>Role updated successfully.</span>
        </div>
      )}

      {statusSuccessMessage && (
        <div
          role="status"
          className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 rounded px-2 py-1"
        >
          <Check className="h-3 w-3 shrink-0" />
          <span>{statusSuccessMessage}</span>
        </div>
      )}
    </div>
  );
}

export default UserAdminActions;
