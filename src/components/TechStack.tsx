"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { SectionLabel } from "./SectionLabel";
import { Server, Zap, Database, Cloud, Layout, ChevronDown } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { WaveformStability } from "./GhostLayers";

const domains = [
  {
    label: "Backend Systems",
    description: "Designing APIs, handling concurrency, structuring services for real-world load.",
    tools: ["Node.js", "NestJS", "Express"],
    icon: Server,
    accentRgb: "245,158,11",
    primary: true,
  },
  {
    label: "Scalability & Performance",
    description: "Queue-based architectures, caching layers, and async background processing.",
    tools: ["Redis", "BullMQ", "Async Queues", "Caching"],
    icon: Zap,
    accentRgb: "94,234,212",
  },
  {
    label: "Databases",
    description: "Schema design, indexing strategies, query optimization under load.",
    tools: ["PostgreSQL", "MySQL", "Prisma", "SQL"],
    icon: Database,
    accentRgb: "56,189,248",
  },
  {
    label: "Infrastructure",
    description: "Deployment pipelines, environment isolation, and production reliability.",
    tools: ["AWS", "Docker", "Linux", "CI/CD"],
    icon: Cloud,
    accentRgb: "167,139,250",
  },
  {
    label: "Frontend (Supporting)",
    description: "Clean, high-performance interfaces when the product demands it.",
    tools: ["Next.js", "React", "Tailwind"],
    icon: Layout,
    accentRgb: "248,113,113",
  },
];

function DomainCard({ domain, index, isFirst }: { domain: typeof domains[0]; index: number; isFirst?: boolean }) {
  const Icon = domain.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative group p-6 sm:p-8 rounded-2xl border transition-all duration-400 overflow-hidden flex flex-col gap-4 ${isFirst ? "md:col-span-2 md:flex-row md:items-center md:justify-between md:gap-8" : ""}`}
      style={{
        borderColor: hovered ? `rgba(${domain.accentRgb},0.25)` : "var(--line)",
        background: hovered
          ? `linear-gradient(135deg, rgba(${domain.accentRgb},0.07) 0%, transparent 60%)`
          : "var(--panel-fill)",
        boxShadow: hovered
          ? `0 0 0 1px rgba(${domain.accentRgb},0.12), 0 8px 40px rgba(${domain.accentRgb},0.06), inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Background glow orb */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${domain.accentRgb},0.15), transparent 70%)`, filter: "blur(20px)" }}
      />

      {/* Icon + header */}
      <div className={`flex flex-col gap-3 ${isFirst ? "md:shrink-1 md:max-w-xl" : ""}`}>
        <div
          className="w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110"
          style={{
            borderColor: `rgba(${domain.accentRgb},0.3)`,
            background: `rgba(${domain.accentRgb},0.1)`,
            boxShadow: hovered ? `0 0 20px rgba(${domain.accentRgb},0.2)` : "none",
          }}
        >
          <Icon className="h-5 w-5" style={{ color: `rgb(${domain.accentRgb})` }} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-bold text-base sm:text-lg tracking-tight text-[var(--text)] mb-1.5">
            {domain.label}
          </h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{domain.description}</p>
        </div>
      </div>

      {/* Tools */}
      <div className={`flex flex-wrap gap-2 mt-auto ${isFirst ? "md:mt-0 md:shrink-0 md:justify-end" : ""}`}>
        {domain.tools.map((tool, ti) => (
          <motion.span
            key={tool}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 + ti * 0.05 }}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200 group-hover:border-current"
            style={{
              borderColor: hovered ? `rgba(${domain.accentRgb},0.3)` : "var(--line-strong)",
              background: hovered ? `rgba(${domain.accentRgb},0.08)` : "var(--surface-muted)",
              color: hovered ? `rgb(${domain.accentRgb})` : "var(--text)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: `rgba(${domain.accentRgb},0.7)` }}
            />
            {tool}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// Mobile accordion
function MobileAccordion() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="flex flex-col divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl overflow-hidden">
      {domains.map((domain, i) => {
        const Icon = domain.icon;
        const isOpen = open === i;
        return (
          <div key={domain.label}>
            <button
              onClick={() => { triggerHaptic("light"); setOpen(isOpen ? -1 : i); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-200 ${isOpen ? "bg-[var(--surface-muted)]" : "bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)]"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors duration-200"
                  style={{ background: isOpen ? `rgba(${domain.accentRgb},0.15)` : "var(--surface-muted)" }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: isOpen ? `rgb(${domain.accentRgb})` : "var(--soft)" }}
                    strokeWidth={2}
                  />
                </span>
                <span className={`text-sm font-semibold tracking-tight ${isOpen ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                  {domain.label}
                </span>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="h-4 w-4 text-[var(--soft)]" strokeWidth={2} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden bg-[var(--surface-soft)]"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-[var(--line)]">
                    <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">{domain.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {domain.tools.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-mono tracking-wide text-[var(--text)]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function TechStack() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="stack" ref={ref} className="relative py-12 sm:py-24 md:py-32 overflow-hidden">
      <WaveformStability />
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.022] pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* Header */}
      <motion.div
        className="relative z-10 mx-auto max-w-7xl text-center px-5 sm:px-8 mb-12 sm:mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-4">
          <SectionLabel>Capabilities</SectionLabel>
        </div>
        <h2 className="section-title mx-auto">
          What I use to build{" "}
          <span className="text-gradient-full italic">scalable systems.</span>
        </h2>
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8">
        {/* Mobile */}
        <div className="md:hidden">
          <MobileAccordion />
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-5">
          {domains.map((domain, i) => (
            <DomainCard key={domain.label} domain={domain} index={i} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

