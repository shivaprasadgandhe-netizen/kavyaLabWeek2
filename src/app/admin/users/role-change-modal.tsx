"use client";

import { useEffect, useRef } from "react";
import { Loader2, AlertTriangle, ShieldCheck } from "@/components/icons";
import { motion, AnimatePresence } from "motion/react";

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string | null;
  currentRole: string;
  newRole: string;
  isPending: boolean;
  formAction: (formData: FormData) => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function RoleChangeModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentRole,
  newRole,
  isPending,
  formAction,
  triggerRef,
}: RoleChangeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = (document.activeElement as HTMLElement) || null;
      // Focus cancel button on open
      setTimeout(() => cancelButtonRef.current?.focus(), 50);

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

      const triggerEl = triggerRef?.current;
      const prevEl = previousActiveElement.current;
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Return focus to trigger
        if (triggerEl) {
          triggerEl.focus();
        } else if (prevEl) {
          prevEl.focus();
        }
      };
    }
  }, [isOpen, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          aria-labelledby="confirm-dialog-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
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
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Confirm Change</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default RoleChangeModal;
