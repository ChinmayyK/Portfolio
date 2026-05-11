"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScrollScramble } from "./TextScramble";

const systemSteps = [
  {
    number: "01",
    label: "Start with real constraints",
    note: "I begin with real failure points — load, bottlenecks, and edge cases — before thinking about polish or UI.",
    accent: "var(--accent)",
    accentRaw: "245,158,11",
    tag: "ARCHITECTURE",
  },
  {
    number: "02",
    label: "Design for failure, not success",
    note: "Retries, queues, fallbacks, and observability are designed early so systems remain stable under pressure.",
    accent: "var(--teal)",
    accentRaw: "94,234,212",
    tag: "RESILIENCE",
  },
  {
    number: "03",
    label: "Ship the smallest reliable system",
    note: "I prioritize simplicity and iteration — building systems that are easy to extend, debug, and scale over time.",
    accent: "rgba(56,189,248,1)",
    accentRaw: "56,189,248",
    tag: "DELIVERY",
  },
] as const;

export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-14 sm:py-28 md:py-36 sm:px-8">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 sm:mb-24 text-center"
        >
          <p className="eyebrow mx-auto mb-4">Engineering Process</p>
          <h2 className="section-title mx-auto max-w-2xl">
            <ScrollScramble
              text="How I build systems"
              as="span"
              duration={720}
            />{" "}
            <span className="italic text-[var(--accent-soft)] ink-underline">that scale</span>
          </h2>
        </motion.div>

        <div className="relative flex flex-col gap-6 sm:gap-8">
          {/* Vertical connector line */}
          <div className="absolute left-[2.25rem] top-8 bottom-8 w-px hidden sm:block overflow-hidden rounded-full">
            <motion.div
              className="w-full"
              style={{
                background: "linear-gradient(to bottom, #f59e0b, #5eead4, rgba(56,189,248,0.8))",
                height: "100%",
              }}
              initial={{ scaleY: 0, transformOrigin: "top" }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {systemSteps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 0, y: i % 2 === 1 ? 20 : 0 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.58 + i * 0.04, delay: 0.18 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col sm:flex-row gap-6 sm:gap-10 items-start"
          >
              {/* Number badge */}
              <div className="relative z-10 shrink-0">
                <div
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110"
                  style={{
                    borderColor: `rgba(${step.accentRaw},0.3)`,
                    background: `radial-gradient(circle, rgba(${step.accentRaw},0.15), transparent 70%)`,
                    boxShadow: `0 0 30px rgba(${step.accentRaw},0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  <span
                    className="font-mono text-2xl font-bold tracking-tighter stamp-number"
                    style={{ color: step.accent, textShadow: `0 0 24px rgba(${step.accentRaw},0.5)` }}
                    data-index={i}
                  >
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content card */}
              <div
                className="flex-1 relative p-6 sm:p-8 rounded-2xl border transition-all duration-500 group-hover:-translate-y-1"
                style={{
                  borderColor: `rgba(${step.accentRaw},0.12)`,
                  background: `linear-gradient(135deg, rgba(${step.accentRaw},0.06) 0%, transparent 50%)`,
                  backdropFilter: "blur(8px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <span
                  className="block font-mono text-[10px] uppercase tracking-[0.28em] mb-3 font-semibold"
                  style={{ color: step.accent, opacity: 0.8 }}
                >
                  {step.tag}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)] mb-3 leading-tight">
                  {step.label}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-[var(--muted)] max-w-prose">
                  {step.note}
                </p>
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, rgba(${step.accentRaw},0.12), transparent 70%)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
