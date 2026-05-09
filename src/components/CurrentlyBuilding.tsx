"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github } from "lucide-react";
import dynamic from "next/dynamic";
import { SectionLabel } from "./SectionLabel";

const ClipRelayDiagram = dynamic(() => import('./system-diagram/ClipRelayDiagram').then(m => m.ClipRelayDiagram), { ssr: false });

export function CurrentlyBuilding() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="currently-building" ref={ref} className="relative py-12 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(45,212,191,0.04),transparent)]" aria-hidden />

      <motion.div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* ── Header ── */}
        <div className="mb-8 lg:mb-10">
          <SectionLabel color="var(--teal)">Currently Building</SectionLabel>
          <h2 className="section-title drop-shadow-sm">ClipRelay.</h2>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-[50ch]">
            A decentralized alternative to Apple's Universal Clipboard. Seamlessly syncs clipboard state and files across macOS, Windows, Linux, and Android over local mDNS without cloud dependencies.
          </p>
        </div>

        {/* ── Content ── */}
        <div className="panel relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--line-strong)] shadow-2xl">
          <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.06),transparent_60%)] pointer-events-none blur-[80px]" />
          
          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row gap-10">
            <div className="flex-1 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--teal)] px-2.5 py-1 rounded-full bg-[var(--teal)]/10 border border-[var(--teal)]/20 shadow-sm">Continuity Infrastructure</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--soft)]">2026</span>
                  <span className="ml-auto px-2 py-0.5 text-xs font-mono uppercase rounded bg-[var(--teal)]/10 text-[var(--teal)] border border-[var(--teal)]/30">In Progress</span>
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text)] mb-3">Local-first mesh routing. Rust core. E2E Encrypted.</h3>
                
                <div className="flex items-center gap-3 mt-5">
                  <a href="https://github.com/ChinmayyK/cliprelay" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                  <a href="https://cliprelay.chinmaykudalkar.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Website
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 opacity-90">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal)] opacity-50"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--teal)]"></span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text)] font-semibold">100% Local Mesh</span>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text)] font-semibold">p2p-encryption</span>
                </div>
              </div>

              <div>
                <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--soft)] mb-3 pl-1">Key Engineering Decisions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)]">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">mDNS over Cloud</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Zero latency and absolute privacy on local network.</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)]">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">Rust Core vs Electron</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Tiny memory footprint and native OS integrations.</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)] sm:col-span-2">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">X25519 Handshake</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Trust-on-first-use authentication without central accounts.</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {["Rust", "Tokio", "React", "ChaCha20"].map(t => (
                  <span key={t} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text)] font-medium shadow-sm">{t}</span>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full h-full p-4 md:p-6 overflow-x-auto flex items-center justify-center">
                <ClipRelayDiagram compact mode="normal" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
