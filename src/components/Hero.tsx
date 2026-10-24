import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
      {/* Background CSS Gradients & Abstract Shapes (No external images) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Top-center radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] max-w-[100vw] rounded-full bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-sky-500/10 blur-3xl" />

        {/* Ambient secondary glows */}
        <div className="absolute top-1/4 -left-32 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px]" />

        {/* Abstract geometric grid overlay using pure CSS */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-indigo-300 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" aria-hidden="true" />
              Next-Gen AI Platform &bull; Bengaluru, India
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Build smarter with AI,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
              built in Bengaluru
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300">
            Kavya Labs helps teams ship AI-powered products faster. Deploy production-ready models with robust infrastructure, enterprise security, and seamless developer workflows.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/60 px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-md hover:bg-slate-800 hover:text-white hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200"
            >
              See Features
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
