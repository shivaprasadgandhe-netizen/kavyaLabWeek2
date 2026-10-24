"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountFormProps {
  userEmail: string;
}

export default function DeleteAccountForm({ userEmail }: DeleteAccountFormProps) {
  const [typedEmail, setTypedEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (typedEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
      setErrorMessage("The email address you typed does not match your account email.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteAccount(typedEmail);
        if (res && !res.success) {
          setErrorMessage(res.error || "Failed to delete account.");
        }
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "An unexpected error occurred during deletion."
        );
      }
    });
  };

  const isMatch = typedEmail.trim().toLowerCase() === userEmail.toLowerCase();

  return (
    <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-900/40 text-red-400 border border-red-800/60">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-red-200">
            Danger Zone: Delete Account
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Permanently delete your user profile and all associated data. Your accounts, sessions, and security history will be permanently erased. This action cannot be undone.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="confirm-email-input" className="block text-xs font-medium text-slate-300">
            To confirm, please type your email address (<span className="text-red-300 font-mono font-semibold">{userEmail}</span>):
          </label>
          <input
            id="confirm-email-input"
            type="email"
            value={typedEmail}
            onChange={(e) => setTypedEmail(e.target.value)}
            disabled={isPending}
            placeholder={userEmail}
            className="mt-2 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        {errorMessage && (
          <div role="alert" className="text-xs font-medium text-red-400 bg-red-950/60 border border-red-800/80 rounded-xl p-3 max-w-md">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          id="delete-account-button"
          disabled={!isMatch || isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Deleting Account...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Delete My Account Permanently</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
