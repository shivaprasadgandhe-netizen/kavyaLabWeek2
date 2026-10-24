"use client";

import { motion } from "motion/react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Kavya Labs cut our enterprise model deployment time from six weeks to under four days.",
    author: "Aditi Rao",
    role: "VP of Engineering",
    company: "FinScale India",
  },
  {
    quote: "The reliability and latency optimizations are unmatched. Our customer inference pipelines run flawlessly.",
    author: "Rohan Mehta",
    role: "Head of AI",
    company: "Nexus Health",
  },
  {
    quote: "Enterprise-grade security and zero-retention by design gave our security compliance team full confidence.",
    author: "Sarah Chen",
    role: "Chief Architect",
    company: "CloudVantage APAC",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-slate-900/30 border-y border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Trusted by AI teams scaling globally
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Hear from engineering leaders building real-world AI applications with Kavya Labs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 sm:p-7 shadow-lg backdrop-blur-sm"
            >
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <div className="text-sm font-semibold text-white">{t.author}</div>
                <div className="text-xs text-indigo-400 mt-0.5">
                  {t.role} &bull; {t.company}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
