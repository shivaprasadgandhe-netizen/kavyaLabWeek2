import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand & Tagline */}
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight text-white focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-lg transition-colors hover:text-indigo-300"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shadow-indigo-500/20">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Kavya Labs</span>
            </Link>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Empowering developers and engineering teams to build, deploy, and scale intelligent AI applications from Bengaluru to the world.
            </p>
          </div>

          {/* Links: Features, Contact, Privacy */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-medium text-slate-300">
              <li>
                <Link
                  href="#features"
                  className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-1 py-0.5"
                >
                  Features
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-1 py-0.5"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-md px-1 py-0.5"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright notice */}
        <div className="mt-10 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; 2026 Kavya Labs. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Headquartered in Bengaluru &bull; Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
