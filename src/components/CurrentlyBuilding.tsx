"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Github, Network, Image, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { SectionLabel } from "./SectionLabel";
import { triggerHaptic } from "@/lib/haptics";

const DeskdropDiagram = dynamic(() => import('./system-diagram/DeskdropDiagram').then(m => m.DeskdropDiagram), { ssr: false });

const screenshots = [
  { url: "/projects/deskdrop-macos-dashboard.png", caption: "macOS Continuity Dashboard" },
  { url: "/projects/deskdrop-mobile-dashboard.jpg", caption: "Android Companion App Dashboard" },
  { url: "/projects/deskdrop-camera-macos.png", caption: "Camera Continuity macOS Viewer" },
  { url: "/projects/deskdrop-camera-mobile.jpg", caption: "Camera Continuity Android Streamer" },
  { url: "/projects/deskdrop-phone-mobile.jpg", caption: "Phone Continuity Android Settings" },
  { url: "/projects/deskdrop-call-banner.png", caption: "macOS Incoming Call Alert Banner" },
  { url: "/projects/deskdrop-activity-feed.jpg", caption: "Timeline-First Mobile Activity Feed" },
  { url: "/projects/deskdrop-mobile-pairing.jpg", caption: "mDNS Subnet Pairing Request Dialog" },
];

export function CurrentlyBuilding() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"arch" | "ss">("ss");
  const [screenshotIndex, setScreenshotIndex] = useState(0);

  const nextScreenshot = () => {
    triggerHaptic("light");
    setScreenshotIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevScreenshot = () => {
    triggerHaptic("light");
    setScreenshotIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const selectScreenshot = (index: number) => {
    triggerHaptic("light");
    setScreenshotIndex(index);
  };

  const switchTab = (tab: "arch" | "ss") => {
    triggerHaptic("medium");
    setActiveTab(tab);
  };

  return (
    <section id="currently-building" ref={ref} className="relative py-12 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(45,212,191,0.04),transparent)]" aria-hidden />

      <motion.div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>

        {/* ── Header ── */}
        <div className="mb-8 lg:mb-10">
          <SectionLabel color="var(--teal)">Currently Building</SectionLabel>
          <h2 className="section-title drop-shadow-sm">Deskdrop.</h2>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-[50ch]">
            A decentralized alternative to Apple's Universal Clipboard and Continuity suite. Seamlessly syncs clipboard state, streams real-time mobile camera lens, relays active call notifications, and transfers files across macOS, Windows, Linux, and Android over local subnets without cloud dependencies.
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
                  <a href="https://github.com/ChinmayyK/Deskdrop" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                  <a href="https://deskdrop.chinmaykudalkar.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-soft)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm">
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
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text)] font-semibold">100% Local Subnet Mesh</span>
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
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">mDNS over Cloud Relay</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Zero latency and absolute privacy on local Wi-Fi or mobile hotspots.</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)]">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">Rust Core daemon</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Tiny memory footprint, native OS hook bindings, and blazing speed.</span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] transition-colors hover:border-[var(--line-strong)] sm:col-span-2">
                    <span className="font-mono text-[11px] font-semibold text-[var(--text)] tracking-tight">X25519 Cryptographic Trust</span>
                    <span className="text-[12px] text-[var(--muted)] leading-snug">Permanent cryptographically signed device pairings without central account databases.</span>
                  </div>
                </div>
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--soft)] mb-3 pl-1 mt-6">Download Platform Clients (v1.1.1)</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <a href="https://github.com/ChinmayyK/Deskdrop/releases/download/v1.1.1/Deskdrop.dmg" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm hover:border-[var(--teal)]/40 hover:text-[var(--teal)]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.16.65-2.88 1.49-.63.73-1.18 1.87-1.03 2.99 1.12.09 2.22-.61 2.92-1.42z"/></svg>
                      macOS
                    </a>
                    <a href="https://github.com/ChinmayyK/Deskdrop/releases/download/v1.1.1/Deskdrop.exe" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm hover:border-[var(--teal)]/40 hover:text-[var(--teal)]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.101zM10.95 1.939L24 0v11.6 h-13.05V1.939zM24 12.45v11.55l-13.05-1.8v-9.75H24z"/></svg>
                      Windows
                    </a>
                    <a href="https://github.com/ChinmayyK/Deskdrop/releases/download/v1.1.1/app-release.apk" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] transition-all hover:scale-105 active:scale-95 shadow-sm hover:border-[var(--teal)]/40 hover:text-[var(--teal)]">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h2v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V8H6v10zM12 2C9.24 2 7 4.24 7 7h10c0-2.76-2.24-5-5-5zM2 8c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V9c0-.55-.45-1-1-1zm20 0c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V9c0-.55-.45-1-1-1z"/></svg>
                      Android
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {["Rust", "Tokio", "SwiftUI", "Kotlin", "ChaCha20", "Next.js"].map(t => (
                  <span key={t} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--text)] font-medium shadow-sm">{t}</span>
                ))}
              </div>
            </div>

            {/* Interactive Showcase Panel */}
            <div className="lg:w-1/2 rounded-xl flex flex-col items-center justify-start min-h-[420px] bg-[var(--surface-soft)] border border-[var(--line)] p-4 sm:p-6 relative overflow-hidden">
              
              {/* Tab Selector */}
              <div className="flex gap-2 p-1 bg-[var(--surface-muted)] border border-[var(--line)] rounded-xl mb-6 relative z-10">
                <button
                  onClick={() => switchTab("arch")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg font-mono tracking-tight transition-all duration-300 relative ${
                    activeTab === "arch" ? "text-[var(--teal)] bg-[var(--surface)] shadow-md border border-[var(--line-strong)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Network className="h-3.5 w-3.5" /> ARCHITECTURE
                </button>
                <button
                  onClick={() => switchTab("ss")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg font-mono tracking-tight transition-all duration-300 relative ${
                    activeTab === "ss" ? "text-[var(--teal)] bg-[var(--surface)] shadow-md border border-[var(--line-strong)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Image className="h-3.5 w-3.5" /> UI SHOWCASE
                </button>
              </div>

              {/* Dynamic Viewport */}
              <div className="w-full flex-1 flex items-center justify-center relative min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === "arch" ? (
                    <motion.div
                      key="architecture"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-full h-full flex items-center justify-center overflow-x-auto"
                    >
                      <DeskdropDiagram compact mode="normal" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="showcase"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-full flex flex-col items-center justify-center"
                    >
                      {/* Image Viewer */}
                      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-xl overflow-hidden border border-[var(--line-strong)] bg-zinc-950/40 shadow-xl group">
                        <NextImage
                          src={screenshots[screenshotIndex].url}
                          alt={screenshots[screenshotIndex].caption}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-contain"
                        />
                        
                        {/* Slide Navigation Overlay */}
                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <button
                            onClick={(e) => { e.stopPropagation(); prevScreenshot(); }}
                            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-md"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); nextScreenshot(); }}
                            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-md"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image Caption & Dots */}
                      <div className="w-full mt-4 flex flex-col items-center gap-3">
                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--text)] text-center h-5">
                          {screenshots[screenshotIndex].caption}
                        </span>

                        {/* Slide Dots Indicator */}
                        <div className="flex gap-1.5 mt-1">
                          {screenshots.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => selectScreenshot(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                i === screenshotIndex ? "w-4 bg-[var(--teal)]" : "bg-[var(--line-strong)] hover:bg-[var(--soft)]"
                              }`}
                              aria-label={`Show screenshot ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
