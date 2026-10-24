import { Loader2 } from "lucide-react";

export default function SecurityLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="h-16 sm:h-20 border-b border-slate-800 bg-slate-950/80" />
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded" />
        <div className="h-4 w-96 bg-slate-800/60 rounded" />
        <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" aria-hidden="true" />
          <span className="text-xs text-slate-400">Loading security details...</span>
        </div>
      </div>
    </div>
  );
}
