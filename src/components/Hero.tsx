/* eslint-disable react/no-unescaped-entities */
"use client";

// lightweight: avoid importing framer-motion here to reduce initial bundle size
import dynamic from "next/dynamic";
import { ArrowRight, User, Code2, FileText, Github } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";
import { MagneticButton } from "./MagneticButton";
import { TiltCard } from "./TiltCard";
import { triggerHaptic } from "@/lib/haptics";
import { emitSystemStatus } from "@/lib/systemEvents";
import { RESUME_URL } from "@/lib/resume";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";


import { SystemStatusHeader } from "./SystemStatusHeader";
import { HiddenPhotoWidget } from "./HiddenPhotoWidget";

export function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [isCTAHovered, setIsCTAHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mouseXPos, setMouseXPos] = useState<number | null>(null);
  const [mouseYPos, setMouseYPos] = useState<number | null>(null);
  // Ref to the guarded focus function exposed by HiddenPhotoWidget
  const terminalFocusRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Parallax and opacity fallbacks (map scrollY 0-1000 -> y:0-200, opacity 300-1000 -> 1-0)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || window.pageYOffset || 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const map = (v: number, a1: number, a2: number, b1: number, b2: number) => {
    const t = (v - a1) / (a2 - a1);
    return b1 + Math.max(0, Math.min(1, t)) * (b2 - b1);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const y = isMobile ? 0 : map(scrollY, 0, 1000, 0, 200);
  const opacity = isMobile ? 1 : 1 - map(scrollY, 300, 1000, 0, 1);

  const handleMouseMove = useCallback(({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    setMouseXPos(Math.round(clientX - left));
    setMouseYPos(Math.round(clientY - top));
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full flex flex-col overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Radial Glow (fallback) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 md:group-hover:opacity-100 z-0"
        style={{
          background: mouseXPos != null && mouseYPos != null
            ? `radial-gradient(600px circle at ${mouseXPos}px ${mouseYPos}px, var(--surface-accent), transparent 80%)`
            : undefined
        }}
      />



      {/* Aurora blobs — cursor-reactive parallax at different speeds */}
      <div className="hero-aurora">
        <div
          className="hero-aurora-blob hero-aurora-1"
          style={mouseXPos != null && mouseYPos != null ? {
            transform: `translate(${(mouseXPos - 500) * 0.012}px, ${(mouseYPos - 400) * 0.009}px)`,
            transition: "transform 1.2s cubic-bezier(0.16,1,0.3,1)",
          } : undefined}
        />
        <div
          className="hero-aurora-blob hero-aurora-2"
          style={mouseXPos != null && mouseYPos != null ? {
            transform: `translate(${(mouseXPos - 500) * -0.018}px, ${(mouseYPos - 400) * 0.013}px)`,
            transition: "transform 1.8s cubic-bezier(0.16,1,0.3,1)",
          } : undefined}
        />
        <div
          className="hero-aurora-blob hero-aurora-3"
          style={mouseXPos != null && mouseYPos != null ? {
            transform: `translate(${(mouseXPos - 500) * 0.008}px, ${(mouseYPos - 400) * -0.015}px)`,
            transition: "transform 2.2s cubic-bezier(0.16,1,0.3,1)",
          } : undefined}
        />
        <div className="hero-aurora-blob hero-aurora-4" />
      </div>

      {/* Mobile Header (Strictly minimal) */}

      {/* Desktop Header (Original) */}
      <header className="hidden lg:flex absolute top-0 left-0 w-full p-6 sm:p-8 items-center justify-between z-50">
        <a
          href="#top"
          onClick={() => triggerHaptic("light")}
          className="flex min-h-[40px] md:min-h-[44px] items-center gap-3 rounded-full border border-[var(--line-strong)] bg-[var(--surface-soft)] p-2 md:px-4 md:py-2.5 text-left text-[var(--text)] shadow-[var(--shadow-elevated)] backdrop-blur-xl hover:bg-[var(--surface-accent)] transition-all cursor-pointer group"
        >
          <div className="relative flex h-8 w-8 md:h-9 md:w-9 items-center justify-center shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface-muted)] overflow-hidden shadow-inner group-hover:scale-110 group-hover:rotate-[12deg] transition-all duration-500 ease-out">
            <Image src="/lightLogo.png" alt="Logo" fill sizes="(max-width: 768px) 32px, 36px" priority className="theme-logo-light object-cover" />
            <Image src="/logo.png" alt="Logo" fill sizes="(max-width: 768px) 32px, 36px" priority className="theme-logo-dark object-cover" />
            
            {/* Glass Bubble Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {/* Top Highlight (Main Shine) */}
              <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
              
              {/* Secondary Highlight (Bottom Reflection) */}
              <div className="absolute bottom-[5%] left-[20%] right-[20%] h-[20%] bg-white/10 rounded-full blur-[1px]" />
              
              <div className="absolute top-[15%] left-[20%] w-[25%] h-[25%] bg-white/40 rounded-full blur-[2px]" />
            </div>
            
            {/* Outer Glass Rim */}
            <div className="absolute inset-0 z-20 rounded-full border border-white/20 pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]" />
          </div>
          <div className="flex flex-col items-start justify-center hidden md:flex">
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-soft)]">Portfolio 2026</span>
            <span className="block text-sm font-medium text-[var(--text)]">Chinmay Kudalkar</span>
          </div>
        </a>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-4 sm:pt-16 lg:pt-28 pb-10 lg:pb-24 min-h-[80vh]">

        {/* System Status + Theme Toggle — mobile only */}
        <div className="flex lg:hidden items-center w-full mb-4 px-4 py-2.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded-xl backdrop-blur-md shadow-sm gap-3">
          <div className="flex-1 overflow-hidden">
            {isMounted && <SystemStatusHeader className="mb-0" />}
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>



        {/* Unified Layout (Responsive) */}
        <div className="relative w-full grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-12 items-center">

          {/* Terminal Widget (Right on Desktop, Below headline on Mobile) */}
          {/* Glow ring behind terminal */}
          <div className="absolute lg:col-span-5 lg:col-start-8 -inset-2 pointer-events-none rounded-2xl opacity-30 blur-2xl z-20 hidden lg:block" style={{ background: "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.18), rgba(94,234,212,0.1) 40%, transparent 70%)" }} />

          <div
            id="terminal-container"
            style={isMounted ? { transform: `translateY(${y}px)`, opacity } : {}}
            className={`relative w-full max-w-[480px] lg:max-w-[560px] xl:max-w-[640px] lg:col-span-5 lg:col-start-8 shrink-0 z-40 mx-auto lg:mx-0 mb-4 lg:mb-0 lg:translate-x-8 xl:translate-x-12 2xl:translate-x-16 rounded-xl transition-all duration-500 order-1 lg:order-2 ${
              isCTAHovered 
                ? 'scale-[1.01]' 
                : 'scale-100'
            }`}
          >
            <TiltCard tiltStrength={15} glareEnabled={false} className="w-full h-full rounded-xl z-20 hover:z-30 relative group/terminal">
              <div className="w-full h-full transition-transform">
                <HiddenPhotoWidget isCTAHovered={isCTAHovered} focusRef={terminalFocusRef} />
              </div>
            </TiltCard>

          </div>

          {/* Text & Actions (Left on Desktop, Second on Mobile) */}
          <div
            style={isMounted ? { transform: `translateY(${y}px)`, opacity } : {}}
            className="flex flex-col items-start text-left w-full lg:col-span-7 lg:col-start-1 lg:row-start-1 z-10 pb-0 order-2 lg:order-1 lg:order-none"
          >
            {/* System Status Micro Header (Desktop Only here) */}
            {isMounted && <SystemStatusHeader className="hidden lg:flex" />}

            {/* Headline */}
            <h1 className="text-[1.7rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-tight text-[var(--text)] sm:leading-[1.05] max-w-4xl"
            >
              Building systems that <span className="inline-block text-gradient-amber italic pr-2 drop-shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:scale-[1.04] transition-all duration-300 cursor-default origin-bottom-left">scale</span> <br className="hidden sm:block" /> and interfaces that <span className="relative inline-block text-[var(--teal)] italic drop-shadow-[0_0_15px_rgba(94,234,212,0.25)] hover:scale-[1.04] hover:drop-shadow-[0_0_25px_rgba(94,234,212,0.6)] transition-all duration-300 cursor-default origin-bottom-left group">feel alive.<span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--teal)] group-hover:w-full transition-all duration-500 ease-out shadow-[0_0_8px_var(--teal)] rounded-full"></span></span>
            </h1>

            {/* Subheadline */}
            <p className="hidden sm:block mt-6 lg:mt-8 text-sm sm:text-lg lg:text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
              Turning complex backend architectures into elegant, <br className="hidden lg:block" />
              highly-interactive user experiences.
            </p>

            {/* Actions */}
            <div className="flex mt-5 sm:mt-8 flex-wrap items-center justify-start gap-3 sm:gap-4 w-full">
              <div
                onMouseEnter={() => setIsCTAHovered(true)}
                onMouseLeave={() => setIsCTAHovered(false)}
              >
                <MagneticButton
                  as="button"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    triggerHaptic("medium");
                    const terminal = document.getElementById("terminal-container");
                    
                    if (terminal) {
                      terminal.style.transform = "scale(1.02)";
                      setTimeout(() => {
                        terminal.style.transform = "";
                      }, 150);
                    }

                    // Use the guarded focus function from HiddenPhotoWidget which
                    // blocks onChange for 200ms to prevent stray characters (the
                    // browser's Quick Find "/" shortcut or IME auto-insert on mobile)
                    // from leaking into the terminal after a programmatic focus().
                    terminalFocusRef.current?.();

                    // On mobile, scroll to 'start' so the keyboard has room.
                    // On desktop, 'center' is fine.
                    const isMobile = window.innerWidth < 768;
                    setTimeout(() => {
                      document.getElementById("terminal-container")
                        ?.scrollIntoView({ 
                          behavior: "smooth", 
                          block: isMobile ? "start" : "center" 
                        });
                    }, 300);

                    if (terminal) {
                      terminal.classList.add("ring-2", "ring-[var(--accent)]", "ring-offset-2", "ring-offset-[var(--bg)]", "transition-all", "duration-300");
                      setTimeout(() => {
                        terminal.classList.remove("ring-2", "ring-[var(--accent)]", "ring-offset-2", "ring-offset-[var(--bg)]");
                      }, 1500);
                    }
                  }}
                  className="hero-cta-primary flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-[var(--text)] text-[var(--bg)] font-semibold text-[13px] sm:text-sm transition-all hover:-translate-y-[2px] active:scale-95 shadow-[0_0_15px_rgba(var(--text-rgb),0.2)] hover:shadow-[0_4px_20px_rgba(var(--text-rgb),0.4)] w-full sm:w-auto cta-shimmer"
                >
                  Run a command
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </MagneticButton>
              </div>
              <MagneticButton
                as="a"
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic("light")}
                className="hero-cta-secondary flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full border border-[var(--line-strong)] bg-[var(--surface-soft)] text-[var(--text)] font-medium text-[13px] sm:text-sm transition-all hover:bg-[var(--surface-muted)] flex-1 sm:flex-none"
              >
                Resume <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </MagneticButton>
              <MagneticButton
                as="a"
                href="#contact"
                onClick={() => triggerHaptic("light")}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] font-medium text-[13px] sm:text-sm transition-colors flex-1 sm:flex-none"
              >
                Get in Touch
              </MagneticButton>
              <MagneticButton
                as="a"
                href="https://github.com/ChinmayyK"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => triggerHaptic("light")}
                className="flex flex-none items-center justify-center w-11 h-11 rounded-full bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors border border-[var(--line-strong)] hover:border-[var(--line)]"
                aria-label="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </MagneticButton>
            </div>

          </div>
        </div>

      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-10 pointer-events-none" />
    </section>
  );
}

