"use client";

import { useActionState, useState } from "react";
import { deleteOwnAccount, type DeleteAccountState } from "./actions";
import { Trash2, AlertTriangle, Loader2 } from "@/components/icons";

interface DeleteAccountSectionProps {
  userEmail: string;
}

export function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const [typedEmail, setTypedEmail] = useState("");
  const [state, formAction, isPending] = useActionState<DeleteAccountState, FormData>(
    deleteOwnAccount,
    {}
  );

  const isExactMatch = typedEmail.trim().toLowerCase() === userEmail.toLowerCase();

  return (
    <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-6 sm:p-8 backdrop-blur-sm mt-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-900/40 text-red-400 border border-red-800/60">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-200">
            Delete My Account
          </h2>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Permanently delete your user account. This will immediately cascade and delete your sessions and linked accounts. Audit logs will remain with your ID cleared. This action cannot be reversed.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="confirmationEmail" className="block text-xs sm:text-sm font-medium text-slate-300">
            To confirm, please type your account email (<span className="text-red-300 font-mono font-semibold">{userEmail}</span>):
          </label>
          <input
            id="confirmationEmail"
            name="confirmationEmail"
            type="email"
            value={typedEmail}
            onChange={(e) => setTypedEmail(e.target.value)}
            disabled={isPending}
            placeholder={userEmail}
            required
            className="mt-2 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
        </div>

        {state.error && (
          <div role="alert" className="text-xs sm:text-sm font-medium text-red-400 bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 max-w-md">
            {state.error}
          </div>
        )}

        {state.success && (
          <div role="status" className="text-xs sm:text-sm font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3.5 max-w-md">
            Account successfully deleted.
          </div>
        )}

        <button
          type="submit"
          id="confirm-delete-account-button"
          disabled={!isExactMatch || isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 active:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Deleting Account...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              <span>Delete My Account Permanently</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
