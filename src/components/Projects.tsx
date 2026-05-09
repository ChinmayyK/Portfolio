"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Github } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { SectionLabel } from "./SectionLabel";

const LineupDiagram = dynamic(() => import('./system-diagram/LineupDiagram').then(m => m.LineupDiagram), { ssr: false });
const BlockvaultDiagram = dynamic(() => import('./system-diagram/BlockvaultDiagram').then(m => m.BlockvaultDiagram), { ssr: false });
const SketchToImageDiagram = dynamic(() => import('./system-diagram/SketchToImageDiagram').then(m => m.SketchToImageDiagram), { ssr: false });
const DeployWatchDiagram = dynamic(() => import('./system-diagram/DeployWatchDiagram').then(m => m.DeployWatchDiagram), { ssr: false });

interface ScreenshotSlide { src: string; label: string; }
interface Decision { choice: string; reason: string; }
interface Project {
  name: string; type: string; year?: string; tagline: string; description: string; status?: string;
  metric: string; archKey: string; stack: string[];
  githubUrl?: string; websiteUrl?: string; diagramKey?: "lineup" | "blockvault" | "deploywatch" | "sketch";
  previewImages: ScreenshotSlide[]; isFlagship?: boolean; decisions: Decision[];
}

const allProjects: Project[] = [
  {
    name: "LINEUP", type: "Flagship SaaS", year: "2025-26",
    tagline: "Async workflows. Scalable systems. Reliable integrations.",
    description: "Multi-tenant recruitment platform processing 10k+ jobs daily through event-driven architecture with BullMQ queues, PostgreSQL persistence, and Zoho CRM sync.",
    metric: "10k+ jobs/day", archKey: "event-driven",
    stack: ["Next.js", "NestJS", "BullMQ", "PostgreSQL", "Zoho"],
    githubUrl: "https://github.com/ChinmayyK/TalentSync", diagramKey: "lineup", isFlagship: true,
    previewImages: [
      { src: "/projects/lineup-landing.png", label: "Landing" },
      { src: "/projects/lineup-login.png", label: "Login" },
      { src: "/projects/lineup-dashboard.png", label: "Dashboard" },
      { src: "/projects/lineup-candidates.png", label: "Candidates" },
      { src: "/projects/lineup-interviews.png", label: "Interviews" },
      { src: "/projects/lineup-reports.png", label: "Reports" },
    ],
    decisions: [
      { choice: "Queue vs Real-time", reason: "Isolate unpredictable external API latency." },
      { choice: "Tenant context at guard level", reason: "Avoid per-service duplication." },
      { choice: "Modular monolith", reason: "Prevent multi-tenant code drift." },
    ],
  },
  {
    name: "BLOCKVAULT", type: "Secure Systems", year: "2024",
    tagline: "Zero-knowledge verification. Client-side encryption.",
    description: "E2E encrypted document vault using ZK proofs for server-side rule enforcement without plaintext access, backed by IPFS.",
    metric: "100% Client-side", archKey: "zero-knowledge",
    stack: ["Flask", "React", "Web3"],
    githubUrl: "https://github.com/ChinmayyK/BlockVault", diagramKey: "blockvault",
    previewImages: [
      { src: "/projects/bv1.png", label: "Upload" },
      { src: "/projects/bv2.png", label: "Vault" },
      { src: "/projects/bv3.png", label: "Verify" },
      { src: "/projects/doc-redact-engine.png", label: "Redaction" },
    ],
    decisions: [
      { choice: "E2EE vs KMS", reason: "Eliminate host trust entirely." },
      { choice: "ZK Proofs", reason: "Server verifies rules without reading plaintext." },
      { choice: "IPFS over S3", reason: "Remove single point of failure." },
    ],
  },
  {
    name: "DEPLOYWATCH", type: "Infrastructure Monitoring", year: "2024",
    tagline: "High-frequency polling. Distributed task queues. Automated incident response.",
    description: "Uptime monitoring with sub-second polling, BullMQ-distributed health checks, and automated incident lifecycle management.",
    metric: "Sub-second polling", archKey: "distributed-queue",
    stack: ["Next.js", "Express", "BullMQ", "PostgreSQL", "Redis"],
    githubUrl: "https://github.com/ChinmayyK/DeployWatch", diagramKey: "deploywatch",
    previewImages: [],
    decisions: [
      { choice: "Decoupled scheduling", reason: "Dispatcher uses nextCheckAt instead of tight cron coupling." },
      { choice: "Event-driven incidents", reason: "Separate state from timeline history." },
    ],
  },
  {
    name: "SKETCH → IMAGE", type: "Creative AI", year: "2024",
    tagline: "Hybrid AI inference. Local-first GPU with cloud fallback.",
    description: "Sketch-to-image pipeline using ControlNet for structural adherence, with intelligent GPU routing.",
    metric: "GPU Offloading", archKey: "hybrid-inference",
    stack: ["React", "Stable Diffusion", "ControlNet"], diagramKey: "sketch",
    githubUrl: "https://github.com/chinmayyk/s2i",
    previewImages: [],
    decisions: [
      { choice: "Local vs Cloud", reason: "Probe local VRAM first; cloud on fail." },
      { choice: "ControlNet vs Img2Img", reason: "Structural adherence to input strokes." },
    ],
  },
];

// ── Screenshot Gallery ──────────────────────────

function Gallery({ slides }: { slides: ScreenshotSlide[] }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const autoplayDuration = 4000;

  // Preload all slide images so subsequent slides don't flash blank
  useEffect(() => {
    slides.forEach(sl => {
      const img = new window.Image();
      img.onload = () => setLoadedSrcs(prev => new Set(prev).add(sl.src));
      img.src = sl.src;
    });
  }, [slides]);

  const go = useCallback((i: number, d?: 1 | -1) => {
    setDir(d ?? (i > active ? 1 : -1)); 
    setActive(i);
    // Reset pause state when manually navigating
    pausedAtRef.current = 0;
  }, [active]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);

    if (slides.length <= 1) {
      setProgress(0);
      return;
    }

    if (hovered) {
      pausedAtRef.current = Date.now();
      return;
    }

    // Resume or start fresh
    const now = Date.now();
    const resumeOffset = pausedAtRef.current > 0 ? (pausedAtRef.current - startTimeRef.current) : 0;
    startTimeRef.current = now - resumeOffset;
    
    const remaining = autoplayDuration - resumeOffset;

    timer.current = setTimeout(() => {
      setDir(1);
      setActive(p => (p + 1) % slides.length);
      pausedAtRef.current = 0; // Clear pause for next slide
    }, remaining);

    progressTimer.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / autoplayDuration) * 100);
      setProgress(pct);
    }, 16);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [active, slides.length, hovered]);

  if (!slides.length) return null;
  const s = slides[active]!;
  const isLoaded = loadedSrcs.has(s.src);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-soft)] group"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`relative w-full aspect-video overflow-hidden bg-[var(--surface-muted)] [background-image:linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_50%,rgba(245,158,11,0.03)_100%)] transition-all duration-300 ${!isLoaded ? 'animate-pulse' : ''}`}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={active} custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 20, scale: 0.97 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) => ({ opacity: 0, x: d * -20, scale: 0.97 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0">
            <Image
              src={s.src}
              alt={s.label}
              fill
              sizes="(max-width:768px) 92vw, 50vw"
              className="object-contain"
              loading="eager"
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
        {slides.length > 1 && (
          <>
            {/* Top dark gradient to ensure progress bar contrast against bright images */}
            <div className="absolute left-0 top-0 z-10 h-16 w-full bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <div className="absolute left-0 top-0 z-20 h-[3px] w-full overflow-hidden bg-white/10">
              <div
                className="h-full w-full origin-left bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </>
        )}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 sm:bottom-3 sm:left-3 pointer-events-none">
          <span className="rounded-full border border-white/10 bg-black/60 px-2.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-md sm:text-[9px]">{s.label}</span>
          {slides.length > 1 && <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-[8px] text-white/50">{active + 1}/{slides.length}</span>}
        </div>
        {slides.length > 1 && (<>
          <button onClick={e => { e.stopPropagation(); triggerHaptic("medium"); go((active - 1 + slides.length) % slides.length, -1); }}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 active:scale-90 sm:h-8 sm:w-8"
            aria-label="Previous"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={e => { e.stopPropagation(); triggerHaptic("medium"); go((active + 1) % slides.length, 1); }}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 active:scale-90 sm:h-8 sm:w-8"
            aria-label="Next"><ChevronRight className="h-3.5 w-3.5" /></button>
        </>)}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-[inherit] pointer-events-none z-30" />
      </div>
      {slides.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto bg-black/30 scrollbar-hide sm:gap-3 sm:p-3 backdrop-blur-md">
          {slides.map((sl, i) => (
            <div key={i} role="button" onClick={e => { e.stopPropagation(); triggerHaptic("light"); go(i, i > active ? 1 : -1); }}
              className={`relative shrink-0 w-16 h-10 rounded-lg overflow-hidden transition-all duration-500 border sm:w-20 sm:h-12 cursor-pointer ${
                i === active 
                  ? "opacity-100 border-[var(--accent)] shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105" 
                  : "opacity-50 hover:opacity-100 border-white/10 hover:border-white/20"
              }`}
              aria-label={`Go to ${sl.label}`}>
              <Image 
                src={sl.src} 
                alt={sl.label} 
                fill 
                sizes="100px" 
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 backdrop-blur-sm flex justify-center items-center z-10">
                <span className="text-[6px] sm:text-[7px] font-mono uppercase tracking-widest text-white/90 text-center line-clamp-1 px-1">{sl.label}</span>
              </div>
              {i === active ? (
                <div className="absolute inset-0 ring-2 ring-inset ring-[var(--accent)] pointer-events-none z-20" />
              ) : (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none z-20" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Active Project Display ──────────────────────────

function ActiveProjectDisplay({ p }: { p: Project }) {
  const [view, setView] = useState<"ui" | "arch">(p.previewImages.length > 0 ? "ui" : "arch");

  useEffect(() => {
    setView(p.previewImages.length > 0 ? "ui" : "arch");
  }, [p]);

  return (
    <div className="panel relative overflow-hidden h-full rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-[var(--line-strong)]">
      {/* Background ambient glow based on project */}
      <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none blur-[80px]" />
      
      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col h-full">
        <div className="flex flex-col gap-6 md:gap-8 flex-1">
          {/* Header section */}
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] px-2.5 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 shadow-sm">{p.type}</span>
              {p.year && <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--soft)]">{p.year}</span>}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">{p.name}</h3>
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] text-[var(--soft)] hover:text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95" aria-label="GitHub">
                  <Github className="h-4 w-4" strokeWidth={2} />
                </a>
              )}
              {p.websiteUrl && (
                <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--soft)] hover:text-[var(--text)] transition-colors" aria-label="Website">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Website
                </a>
              )}
              {p.status && (
                <span className="ml-2 px-2 py-0.5 text-xs font-mono uppercase rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">{p.status}</span>
              )}
            </div>
            
            <p className="text-sm leading-relaxed text-[var(--muted)] max-w-[60ch] sm:text-[15px]">{p.description}</p>
          </div>

          {/* Badges / Meta */}
          <div className="flex flex-wrap items-center gap-3 opacity-90">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-50"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text)] font-semibold">{p.metric}</span>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text)] font-semibold">{p.archKey}</span>
            </div>
          </div>

          {/* Decisions */}
          {p.decisions.length > 0 && (
            <div className="pt-2">
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--soft)] mb-3 pl-1">Key Engineering Decisions</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.decisions.map(d => (
                  <div key={d.choice} className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)]">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">{d.choice}</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">{d.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stack */}
          <div className="flex flex-wrap gap-2 pt-2">
            {p.stack.map(t => (
              <span key={t} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--soft)] shadow-sm transition-all hover:text-[var(--text)] hover:border-[var(--line-strong)] cursor-default">{t}</span>
            ))}
          </div>

          {/* Visuals */}
          <div className="w-full mt-auto pt-6">
            {p.previewImages.length > 0 && p.diagramKey && (
              <div className="flex justify-start sm:justify-end mb-4">
                <div className="flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1 relative shadow-inner">
                  {/* Segmented Control Background */}
                  <div className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[var(--surface-muted)] border border-[var(--line-strong)] shadow-sm transition-all duration-300 ease-out" 
                       style={{ left: view === "ui" ? "4px" : "calc(50%)" }} />
                  
                  <button onClick={() => { setView("ui"); triggerHaptic("light"); }}
                    className={`relative z-10 rounded-full px-5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${view === "ui" ? "text-[var(--text)]" : "text-[var(--soft)] hover:text-[var(--text)]"}`}>
                    UI Preview
                  </button>
                  <button onClick={() => { setView("arch"); triggerHaptic("light"); }}
                    className={`relative z-10 rounded-full px-5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 ${view === "arch" ? "text-[var(--text)]" : "text-[var(--soft)] hover:text-[var(--text)]"}`}>
                    Architecture
                  </button>
                </div>
              </div>
            )}
            
            <div className={`relative rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 ${view === "ui" ? "border border-[var(--line-strong)] bg-[#080c12] shadow-2xl ring-1 ring-white/5" : ""}`}>
              {view === "ui" && p.previewImages.length > 0 ? (
                <Gallery slides={p.previewImages} />
              ) : (
                <div className="relative w-full overflow-y-auto sm:overflow-visible">
                  {p.diagramKey === "lineup" && <LineupDiagram compact mode="normal" />}
                  {p.diagramKey === "blockvault" && <BlockvaultDiagram compact mode="normal" />}
                  {p.diagramKey === "deploywatch" && <DeployWatchDiagram compact mode="normal" />}
                  {p.diagramKey === "sketch" && <SketchToImageDiagram compact mode="normal" />}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// ── Mobile project visuals (gallery or diagram) ─────────────────

function MobileProjectVisuals({ p }: { p: Project }) {
  const defaultView: "ui" | "arch" = p.previewImages.length > 0 ? "ui" : "arch";
  const [view, setView] = useState<"ui" | "arch">(defaultView);

  return (
    <div className="flex flex-col gap-3">
      {p.previewImages.length > 0 && p.diagramKey && (
        <div className="flex rounded-full border border-[var(--line)] bg-[var(--surface-soft)] p-1 relative shadow-inner w-fit">
          <div className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[var(--surface-muted)] border border-[var(--line-strong)] shadow-sm transition-all duration-300 ease-out"
               style={{ left: view === "ui" ? "4px" : "calc(50%)" }} />
          <button onClick={() => { setView("ui"); triggerHaptic("light"); }}
            className={`relative z-10 rounded-full px-4 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider transition-colors duration-300 ${view === "ui" ? "text-[var(--text)]" : "text-[var(--soft)]"}`}>
            UI Preview
          </button>
          <button onClick={() => { setView("arch"); triggerHaptic("light"); }}
            className={`relative z-10 rounded-full px-4 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider transition-colors duration-300 ${view === "arch" ? "text-[var(--text)]" : "text-[var(--soft)]"}`}>
            Architecture
          </button>
        </div>
      )}
      <div className={`relative rounded-xl overflow-hidden transition-all duration-500 ${view === "ui" ? "border border-[var(--line-strong)] bg-[#080c12] shadow-xl ring-1 ring-white/5" : ""}`}>
        {view === "ui" && p.previewImages.length > 0 ? (
          <Gallery slides={p.previewImages} />
        ) : (
          <div className="relative w-full overflow-x-auto">
            {p.diagramKey === "lineup" && <LineupDiagram compact mode="normal" />}
            {p.diagramKey === "blockvault" && <BlockvaultDiagram compact mode="normal" />}
            {p.diagramKey === "deploywatch" && <DeployWatchDiagram compact mode="normal" />}
            {p.diagramKey === "sketch" && <SketchToImageDiagram compact mode="normal" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Section ────────────────────────────────

export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="projects" ref={ref} className="relative py-12 sm:py-24 md:py-32 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_20%_0%,rgba(245,158,11,0.04),transparent),radial-gradient(ellipse_50%_50%_at_80%_100%,rgba(94,234,212,0.03),transparent)]" aria-hidden />

      <motion.div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-12 sm:mb-16 md:mb-20"
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* ── Header ── */}
        <div className="mb-8 lg:mb-10">
          <SectionLabel color="var(--accent)">Selected Work</SectionLabel>
          <h2 className="section-title drop-shadow-sm">Core Systems.</h2>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-[40ch]">Production-grade architectures engineered with real constraints — not just toy demos.</p>
        </div>

        {/* ── Mobile: Accordion ── */}
        <div className="lg:hidden flex flex-col divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl overflow-hidden">
          {allProjects.map((p, i) => {
            const isOpen = activeIndex === i;
            return (
              <div key={p.name}>
                <button
                  onClick={() => { triggerHaptic("light"); setActiveIndex(isOpen ? -1 : i); }}
                  className={`w-full flex items-start justify-between gap-3 px-4 py-4 text-left transition-colors duration-200 ${isOpen ? "bg-[var(--surface-muted)]" : "bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)]"}`}
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`font-mono text-[9px] uppercase tracking-[0.18em] font-semibold transition-colors duration-200 ${isOpen ? "text-[var(--accent)]" : "text-[var(--soft)]"}`}>{p.type}</span>
                    <span className={`text-base font-bold tracking-tight transition-colors duration-200 ${isOpen ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>{p.name}</span>
                    {!isOpen && <span className="text-xs text-[var(--soft)] leading-snug line-clamp-1 mt-0.5">{p.tagline}</span>}
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 mt-1"
                  >
                    <ChevronRight className={`h-4 w-4 rotate-90 transition-colors duration-200 ${isOpen ? "text-[var(--accent)]" : "text-[var(--soft)]"}`} strokeWidth={2} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden bg-[var(--surface-soft)]"
                    >
                      <div className="px-4 pb-5 pt-3 border-t border-[var(--line)] flex flex-col gap-4">
                        {/* Description */}
                        <p className="text-sm leading-relaxed text-[var(--muted)]">{p.description}</p>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--text)] font-semibold">
                            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-50" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]" /></span>
                            {p.metric}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--text)] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shadow-[0_0_6px_rgba(45,212,191,0.5)]" />
                            {p.archKey}
                          </div>
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--soft)] hover:text-[var(--text)] transition-colors" aria-label="GitHub">
                              <Github className="h-3 w-3" strokeWidth={2} /> GitHub
                            </a>
                          )}
                          {p.websiteUrl && (
                            <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--soft)] hover:text-[var(--text)] transition-colors" aria-label="Website">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                              Website
                            </a>
                          )}
                          {p.status && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-mono uppercase rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">{p.status}</span>
                          )}
                        </div>

                        {/* Stack */}
                        <div className="flex flex-wrap gap-1.5">
                          {p.stack.map(t => (
                            <span key={t} className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--soft)]">{t}</span>
                          ))}
                        </div>

                        {/* Decisions */}
                        {p.decisions.length > 0 && (
                          <div>
                            <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--soft)] mb-2">Key Decisions</span>
                            <div className="flex flex-col gap-2">
                              {p.decisions.map(d => (
                                <div key={d.choice} className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--line)]">
                                  <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">{d.choice}</span>
                                  <span className="text-[11px] text-[var(--muted)] leading-snug">{d.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Preview / Diagram */}
                        {(p.previewImages.length > 0 || p.diagramKey) && (
                          <MobileProjectVisuals p={p} />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Desktop: Sidebar + Detail panel ── */}
        <div className="hidden lg:flex flex-row items-start gap-16">
          {/* Navigation Sidebar */}
          <div className="lg:w-[32%] lg:shrink-0 flex flex-col">
            <div className="flex lg:flex-col gap-2.5">
              {allProjects.map((p, i) => {
                const isActive = activeIndex === i;
                return (
                  <button
                    key={p.name}
                    onClick={() => { setActiveIndex(i); triggerHaptic("light"); }}
                    className={`group relative flex flex-col items-start p-6 rounded-2xl text-left transition-all duration-400 ease-out overflow-hidden ${
                      isActive 
                        ? "bg-[var(--surface-soft)] shadow-md border-[var(--line-strong)] lg:translate-x-2" 
                        : "bg-[var(--surface)] hover:bg-[var(--surface-soft)] border-[var(--line)] opacity-70 hover:opacity-100 hover:shadow-sm"
                    } border`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-50 pointer-events-none" />
                    )}
                    <span className={`relative z-10 font-mono text-[10px] uppercase tracking-[0.15em] font-semibold mb-2 transition-colors duration-300 ${isActive ? "text-[var(--accent)]" : "text-[var(--soft)] group-hover:text-[var(--text)]"}`}>{p.type}</span>
                    <span className={`relative z-10 text-xl font-bold tracking-tight mb-2 transition-colors duration-300 ${isActive ? "text-[var(--text)]" : "text-[var(--muted)] group-hover:text-[var(--text)]"}`}>{p.name}</span>
                    <span className={`relative z-10 text-sm leading-relaxed line-clamp-2 transition-colors duration-300 ${isActive ? "text-[var(--muted)]" : "text-[var(--soft)] group-hover:text-[var(--muted)]"}`}>{p.tagline}</span>
                    {isActive && (
                      <motion.div layoutId="activeIndicatorDesktop" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Project Details */}
          <div className="flex-1 min-w-0 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <ActiveProjectDisplay p={allProjects[activeIndex]!} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
