"use client";

import { useEffect } from "react";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex items-center justify-center gap-2.5 font-bold text-2xl tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Kavya Labs
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-5">
              <AlertTriangle className="h-8 w-8" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Critical Error
            </h1>

            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              A critical error occurred while initializing the application. You can attempt to reload the application.
            </p>

            {error.digest && (
              <div className="mt-4 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-500 font-mono">
                Error Reference: {error.digest}
              </div>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={() => reset()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
