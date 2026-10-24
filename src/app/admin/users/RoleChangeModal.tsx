"use client";

import { useEffect, useRef } from "react";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string | null;
  currentRole: string;
  newRole: string;
  isPending: boolean;
  formAction: (formData: FormData) => void;
}

export default function RoleChangeModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentRole,
  newRole,
  isPending,
  formAction,
}: RoleChangeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button initially
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      aria-labelledby="confirm-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-base font-semibold text-white">
              Confirm Role Change
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Are you sure you want to change the role for{" "}
              <span className="text-white font-medium">{userName || "this user"}</span> from{" "}
              <span className="font-semibold text-slate-200">{currentRole}</span> to{" "}
              <span className="font-semibold text-indigo-400">{newRole}</span>?
            </p>
          </div>
        </div>

        <form
          action={(formData) => {
            formAction(formData);
            onClose();
          }}
          className="flex justify-end gap-3 pt-2"
        >
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="newRole" value={newRole} />

          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Confirm Change</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
