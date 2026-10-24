import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowLeft, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Kavya Labs",
  description: "Sign in to your Kavya Labs account with Google.",
};

function getAuthErrorMessage(errorCode?: string): { title: string; description: string } | null {
  if (!errorCode) return null;

  if (errorCode.toLowerCase() === "suspended") {
    return {
      title: "Account Suspended",
      description: "Your account has been suspended. Please contact an administrator or support if you believe this is an error.",
    };
  }

  return {
    title: "Sign-In Failed",
    description: "An error occurred while signing in. Please verify your credentials and try again.",
  };
}

interface LoginPageProps {
  searchParams?: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const authError = getAuthErrorMessage(resolvedParams?.error);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-600/25 via-violet-600/15 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-1.5 py-1"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {/* Brand Wordmark */}
          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white mb-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Kavya Labs
              </span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in with your Google account to access your dashboard
            </p>
          </div>

          {/* User-friendly Error Alert */}
          {authError && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 text-sm">
                  <h2 className="font-semibold text-rose-300">{authError.title}</h2>
                  <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                    {authError.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <div className="mt-8">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                id="sign-in-google-button"
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200 active:scale-[0.99]"
              >
                {/* Official Google 'G' icon */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </form>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to Kavya Labs&apos; Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
