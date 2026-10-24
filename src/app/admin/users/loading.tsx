import { Loader2 } from "@/components/icons";

export default function AdminUsersLoading() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="text-sm font-medium">Loading users list...</span>
    </div>
  );
}
