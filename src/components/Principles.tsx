"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Layers3, ShieldCheck, TimerReset } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { ScrollScramble } from "./TextScramble";
import { SectionLabel } from "./SectionLabel";
import { WaveformStability } from "./GhostLayers";

const principles = [
  {
    step: "01",
    title: "Map real flows",
    summary: "I start with the actual handoff points, bottlenecks, and messy edge cases before I touch UI polish.",
    signal: "Users, events, queue boundaries",
    icon: Layers3,
    tone: "from-[var(--accent)] to-[var(--accent-soft)]",
  },
  {
    step: "02",
    title: "Design for failure",
    summary: "Retries, isolation, and fallback behavior get designed early so systems stay calm under pressure.",
    signal: "Backoff, tenant safety, observability",
    icon: ShieldCheck,
    tone: "from-[var(--teal)] to-[#2dd4bf]",
  },
  {
    step: "03",
    title: "Ship smallest version",
    summary: "I cut extra ceremony, keep the architecture readable, and optimize where it meaningfully changes outcomes.",
    signal: "Fast iteration, fewer moving parts",
    icon: TimerReset,
    tone: "from-[#a78bfa] to-[#8b5cf6]",
  },
];

const outcomes = [
  { text: "Clean interfaces", highlight: "Clean", icon: <Layers3 className="w-4 h-4 text-[var(--accent)] opacity-80" /> },
  { text: "Reliable under pressure", highlight: "Reliable", icon: <ShieldCheck className="w-4 h-4 text-[var(--teal)] opacity-80" /> },
  { text: "Readable, maintainable systems", highlight: "Readable, maintainable", icon: <TimerReset className="w-4 h-4 text-[#a78bfa] opacity-80" /> },
];

function SystemFlow() {
  return (
    <div className="mt-6 sm:mt-8 mb-2 relative w-full h-20 sm:h-24 opacity-90 select-none pointer-events-none flex flex-col justify-center">
      {/* SVG Path */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--line-strong)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--success)" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Main Line */}
        <path 
          d="M 20 50 L 100 50 C 130 50 150 20 180 20 C 210 20 230 80 260 80 C 290 80 310 50 340 50 L 380 50" 
          fill="none" 
          stroke="url(#flow-gradient)" 
          strokeWidth="2"
          strokeDasharray="4 4"
          className="opacity-100"
        />

        {/* Nodes */}
        {/* Input */}
        <circle cx="20" cy="50" r="3" fill="var(--text)" opacity="0.9" />
        <text x="20" y="70" fill="var(--text)" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8" letterSpacing="1">INPUT</text>

        {/* Constraints */}
        <circle cx="180" cy="20" r="3" fill="var(--accent)" opacity="1" filter="url(#glow)" />
        <text x="180" y="10" fill="var(--text)" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8" letterSpacing="1">CONSTRAINTS</text>

        {/* Failure Handling */}
        <circle cx="260" cy="80" r="3" fill="var(--teal)" opacity="1" filter="url(#glow)" />
        <text x="260" y="94" fill="var(--text)" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8" letterSpacing="1">FALLBACK</text>

        {/* Output */}
        <circle cx="380" cy="50" r="4" fill="var(--success)" opacity="1" filter="url(#glow)" />
        <text x="380" y="70" fill="var(--text)" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8" letterSpacing="1">SYSTEM</text>
      </svg>

      {/* Moving Pulse Overlay */}
      <motion.div
        animate={{ left: ["0%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(var(--text-rgb), 0.15), transparent)" }}
      />
    </div>
  );
}

export function Principles() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [16, -16]);

  return (
    <section id="principles" ref={sectionRef} className="relative py-8 sm:py-16 md:py-32">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ y: reduceMotion ? 0 : bgY }}
      >
        <WaveformStability />
        <div className="absolute inset-0 opacity-[0.04] [background:radial-gradient(ellipse_60%_38%_at_50%_38%,rgba(94,234,212,0.18),transparent_65%)]" />
      </motion.div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-stretch lg:gap-12">
        <ScrollReveal direction="up" distance={26} className="flex flex-col h-full">
          <div className="mb-12">
            <SectionLabel>How I build</SectionLabel>
            <h2 className="section-title max-w-xl">
              <ScrollScramble
                text="Systems that stay calm under pressure."
                as="span"
                duration={800}
              />
            </h2>
          </div>
          <p className="mt-3 text-[13px] sm:text-[15px] leading-6 sm:leading-7 text-[var(--muted)] sm:text-base">
            The goal is not just shipping features. It is making the product feel simple on the surface while the system underneath stays resilient.
          </p>

          <div className="mt-6 sm:mt-8 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-4 sm:p-5 lg:p-6 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[var(--soft)]">
              What this usually leads to
            </p>
            <div className="mt-4 space-y-4">
              {outcomes.map((item) => {
                const parts = item.text.split(item.highlight);
                return (
                  <div key={item.text} className="flex items-center gap-3.5">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[rgba(255,255,255,0.03)] border border-[var(--line-strong)] shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-[12px] sm:text-[14px] sm:text-[15px] leading-5 sm:leading-6 text-[var(--text)]">
                      {parts[0]}
                      <span className="font-medium text-[var(--text)]">{item.highlight}</span>
                      {parts[1]}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <SystemFlow />
          </div>
        </ScrollReveal>

        <div className="flex flex-col h-full gap-4">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <ScrollReveal
                key={principle.step}
                direction="up"
                distance={22}
                delay={index * 0.06}
                className="flex-1 flex flex-col"
              >
                <motion.article
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="group relative flex-1 overflow-hidden rounded-[1.6rem] border border-[var(--line-strong)] bg-[var(--surface-soft)] p-4 sm:p-5 lg:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)] hover:bg-[var(--surface-muted)] backdrop-blur-xl transition-colors duration-500"
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${principle.tone} opacity-70`}
                  />

                  <div className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-strong)] bg-[rgba(255,255,255,0.03)] text-[var(--text)]">
                        <Icon className="h-5 w-5 sm:h-[1.1rem] sm:w-[1.1rem]" strokeWidth={1.7} />
                      </div>
                      <div>
                        <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-[var(--muted)] opacity-50">
                          STEP {principle.step}
                        </p>
                        <h3 className="mt-2 text-base sm:text-xl font-bold tracking-tight text-[var(--text)] brightness-110">
                          {principle.title}
                        </h3>
                        <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-[var(--muted)] opacity-80 sm:text-[15px]">
                          {principle.summary}
                        </p>
                      </div>
                    </div>

                    <div className="sm:max-w-[15rem] mt-3 sm:mt-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-[var(--muted)] opacity-50">
                        Focus
                      </p>
                      <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-5 sm:leading-6 text-[var(--text)] opacity-90">
                        {principle.signal}
                      </p>
                    </div>
                  </div>
                </motion.article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
