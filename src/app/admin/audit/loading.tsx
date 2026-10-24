import { Loader2 } from "@/components/icons";

export default function AdminAuditLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-72 bg-slate-800/60 rounded" />
      <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-xs text-slate-400">Loading audit records...</span>
      </div>
    </div>
  );
}
