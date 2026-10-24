import { Loader2 } from "@/components/icons";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading your dashboard...</span>
      </div>
    </div>
  );
}
