import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "@/components/icons";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-900/60 shadow-lg mb-6">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Admin Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The requested administrative route or resource does not exist.
      </p>

      <div className="mt-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Admin Overview
        </Link>
      </div>
    </div>
  );
}
