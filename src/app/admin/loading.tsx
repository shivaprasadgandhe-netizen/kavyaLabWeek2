import { Loader2 } from "@/components/icons";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-4 w-72 bg-slate-800/60 rounded" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-xl bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-slate-800 rounded" />
              <div className="h-6 w-12 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Loading admin data...</span>
      </div>
    </div>
  );
}
