"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { onSystemStatus } from "@/lib/systemEvents";
import { triggerHaptic } from "@/lib/haptics";
import { FooterTopology } from "./GhostLayers";

const stackItems = [
  "Next.js (App Router)",
  "TypeScript",
  "Three.js + R3F",
  "Framer Motion",
  "Lenis",
  "Tailwind CSS",
  "Vercel",
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [requests, setRequests] = useState(128000);
  const [latency, setLatency] = useState(42);
  const [pulse, setPulse] = useState(false);
  const [currentYear, setCurrentYear] = useState<string | number>("");

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  // Consolidated timer — single interval drives all live metrics
  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      // Uptime — every second
      setUptime((u) => u + 1);
      // Requests — random increment every ~2 ticks
      if (tick % 2 === 0 || Math.random() > 0.5) {
        setRequests((r) => r + Math.floor(Math.random() * 5) + 1);
      }
      // Latency — jitter every 2 ticks
      if (tick % 2 === 0) {
        setLatency(28 + Math.floor(Math.random() * 37));
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Listen for system status events from terminal
  useEffect(() => {
    return onSystemStatus(() => {
      setPulse(true);
      setIsOpen(true);
      setTimeout(() => setPulse(false), 2000);
    });
  }, []);

  const formatUptime = useCallback((seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  }, []);

  return (
    <footer id="system-footer" ref={ref} className={`relative overflow-hidden px-6 pb-24 pt-12 sm:pb-12 sm:pt-16 sm:px-8 lg:px-8 bg-[var(--bg)] transition-all duration-500 ${pulse ? "ring-1 ring-[var(--accent)]/30" : ""}`}>
      <FooterTopology />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(245,158,11,0.06),transparent_100%)] pointer-events-none blur-3xl" />
      {/* Animated gradient divider */}
      <div className="mx-auto max-w-5xl">
        <div className="relative h-px">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--line-strong)] to-transparent"
            style={{ scaleX: lineScale, transformOrigin: "center" }}
          />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-5xl">
        {/* Main status grid */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">

          {/* LEFT — System Status */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="relative flex h-2 w-2">
              {pulse && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
              )}
              <motion.span
                animate={pulse 
                  ? { opacity: 1, scale: [1, 1.3, 1] } 
                  : { opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }
                }
                transition={pulse 
                  ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } 
                  : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]"
              />
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text)]">
              System Status: Nominal
            </span>
          </div>

          {/* CENTER — Live Metrics */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-widest text-[var(--soft)]">
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--muted)]">Uptime</span>
              <span className="text-[var(--text)] tabular-nums">{formatUptime(uptime)}</span>
            </div>
            <span className="hidden text-[var(--line-strong)] sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--muted)]">Requests</span>
              <span className="text-[var(--text)] tabular-nums">
                {mounted ? requests.toLocaleString() : "128,000"}
              </span>
            </div>
            <span className="hidden text-[var(--line-strong)] sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--muted)]">Latency</span>
              <span className={`tabular-nums ${latency < 40 ? "text-[var(--success)]" : latency < 55 ? "text-[var(--warning)]" : "text-[var(--text)]"}`}>
                {latency}ms
              </span>
            </div>
            <span className="hidden text-[var(--line-strong)] sm:inline">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--muted)]">Region</span>
              <span className="text-[var(--text)]">Mumbai, IN</span>
            </div>
          </div>

          {/* RIGHT — Build Info Toggle */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => { triggerHaptic("light"); setIsOpen(!isOpen); }}
              className="group flex items-center gap-1.5 cursor-pointer"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--soft)] group-hover:text-[var(--muted)] transition-colors duration-200">
                Build Info
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="h-3 w-3 text-[var(--soft)] group-hover:text-[var(--muted)] transition-colors duration-200" strokeWidth={2} />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Collapsible Build Info */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--soft)] mb-3">
                  System Info: Portfolio Build
                </p>
                <p className="font-mono text-[10px] text-[var(--muted)] leading-relaxed mb-4">
                  Interface engineered for performance, motion, and interactivity.
                </p>
                <div className="flex flex-wrap gap-2">
                  {stackItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded bg-[var(--surface-muted)] border border-[var(--line)] px-2.5 py-1 font-mono text-[9px] tracking-wider text-[var(--soft)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom row: copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:gap-4">
          <span className="font-mono text-[10px] font-bold tracking-widest text-[var(--text)] uppercase">
            Chinmay Kudalkar
          </span>
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/ChinmayyK/Portfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest text-[var(--soft)] hover:text-[var(--accent)] transition-colors duration-200"
            >
              Source Code
            </a>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              © {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

