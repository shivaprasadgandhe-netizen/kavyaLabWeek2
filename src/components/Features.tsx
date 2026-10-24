import { Zap, ShieldCheck, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureCardProps[] = [
  {
    icon: Zap,
    title: "Fast Integration",
    description:
      "Plug AI models into your existing stack in days. Developer-friendly APIs and comprehensive SDKs remove complexity so your team can deploy faster.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Default",
    description:
      "Data handling designed for enterprise teams. Built-in compliance standards, zero-retention architecture, and end-to-end encryption safeguard every request.",
  },
  {
    icon: TrendingUp,
    title: "Built for Scale",
    description:
      "Infrastructure that grows with your users. Handle exponential workload surges seamlessly with high-throughput routing and automated edge scaling.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28 lg:py-32 scroll-mt-16 sm:scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why teams choose Kavya Labs
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Engineered to remove friction from AI development, providing the speed, security, and scalability modern teams demand.
          </p>
        </div>

        {/* Responsive Grid of 3 Cards */}
        <div className="mt-14 sm:mt-16 lg:mt-20 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/40 p-7 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                <div>
                  {/* Icon Box */}
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-all duration-300">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <span className="text-xs font-medium uppercase tracking-wider text-indigo-400/80 group-hover:text-indigo-300 transition-colors">
                    Enterprise Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
