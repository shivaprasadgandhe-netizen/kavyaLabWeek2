export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl animate-pulse">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-slate-800 mb-4" />
          <div className="h-6 w-48 rounded bg-slate-800 mb-2" />
          <div className="h-4 w-64 rounded bg-slate-800" />
        </div>
        <div className="h-12 w-full rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}
