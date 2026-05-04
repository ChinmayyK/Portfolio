/* eslint-disable react/no-unescaped-entities */
"use client";

// lightweight: avoid importing framer-motion here to reduce initial bundle size
import dynamic from "next/dynamic";
import { ArrowRight, User, Code2, FileText } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ThemeToggle } from "./ThemeToggle";
const TopographicMap = dynamic(() => import("./TopographicMap").then((m) => m.TopographicMap), { ssr: false, loading: () => null });
const NeuralMesh = dynamic(() => import("./NeuralMesh").then((m) => m.NeuralMesh), { ssr: false, loading: () => null });
const BackgroundLogs = dynamic(() => import("./BackgroundLogs").then((m) => m.BackgroundLogs), { ssr: false, loading: () => null });
import { useTheme } from "../hooks/useTheme";
import { useDesktopEffects } from "../hooks/useDesktopEffects";
import { useScrollVelocity } from "../hooks/useScrollVelocity";
import { MagneticButton } from "./MagneticButton";
import { TiltCard } from "./TiltCard";
import { triggerHaptic } from "@/lib/haptics";
import { emitSystemStatus } from "@/lib/systemEvents";
import { RESUME_URL } from "@/lib/resume";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";


function SystemStatusHeader({ className }: { className?: string }) {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = ["BUILDING", "AVAILABLE", "RUNNING"];
  const currentStatus = statuses[statusIndex];
  const statusRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!statusRef.current) return;

    gsap.fromTo(statusRef.current, 
      { opacity: 0, x: -5 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, { dependencies: [currentStatus] });

  const handleCycle = () => {
    triggerHaptic("light");
    setStatusIndex((prev) => (prev + 1) % statuses.length);
  };

  return (
    <div className={`flex flex-col items-start gap-1 cursor-pointer transition-all duration-300 w-fit group ${className || "mb-4 sm:mb-6"}`} onClick={handleCycle} title="Click to cycle status">
      {/* Line 1: Status */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase">
        {/* Blinking Dot */}
        <div className="relative flex items-center justify-center w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0">
          <span className="absolute inset-0 rounded-full bg-[#22c55e] animate-ping opacity-60" />
          <div className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        </div>
        <span className="text-[var(--muted)] opacity-80">STATUS:</span>
        <span ref={statusRef} className="text-[var(--success)] font-medium">{currentStatus}</span>
      </div>

      {/* Line 2: Role */}
      <div className="font-mono text-[12px] sm:text-[13px] tracking-[0.1em] text-[var(--text)] font-semibold uppercase">
        FULL-STACK ENGINEER
      </div>
    </div>
  );
}

export function Hero() {
  const [isMounted, setIsMounted] = useState(false);
  const [isCTAHovered, setIsCTAHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const desktopEffects = useDesktopEffects();
  const scrollVelocity = useScrollVelocity();
  const blurClass = scrollVelocity > 900 ? "scroll-blur-lg" : scrollVelocity > 450 ? "scroll-blur-md" : scrollVelocity > 200 ? "scroll-blur-sm" : "scroll-blur-none";
  const [mouseXPos, setMouseXPos] = useState<number | null>(null);
  const [mouseYPos, setMouseYPos] = useState<number | null>(null);
  // Ref to the guarded focus function exposed by HiddenPhotoWidget
  const terminalFocusRef = useRef<(() => void) | null>(null);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
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

      {/* Neural Mesh particle canvas — desktop only (heavy canvas loop) */}
      {desktopEffects && <NeuralMesh />}

      {/* Topographic Map Background — desktop only */}
      {desktopEffects && <TopographicMap />}

      {/* Background Faint Logs — desktop only */}
      {desktopEffects && <BackgroundLogs />}

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
            <h1 className={`text-[1.7rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-tight text-[var(--text)] sm:leading-[1.05] max-w-4xl ${blurClass}`}
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
            </div>

          </div>
        </div>

      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg)] to-transparent z-10 pointer-events-none" />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hidden Photo Widget (Sliding Doors & Interactive Terminal)

interface CommandEntry {
  cmd: string;
  output: React.ReactNode;
}

const getCommandOutput = (cmd: string): React.ReactNode => {
  const normalized = cmd.trim().toLowerCase();

  // Prefix commands
  if (normalized.startsWith("echo ")) {
    return <div className="text-[var(--text)] mt-1">{cmd.substring(5)}</div>;
  }
  if (normalized.startsWith("open ")) {
    const target = normalized.substring(5);
    if (target === "profile") return <div className="text-[var(--success)] mt-1">[✓] Access granted. Revealing identity protocol...</div>;
    return <div className="text-[var(--success)] mt-1">[✓] Opening {target}...</div>;
  }
  if (normalized === "sudo hire chinmay") {
    return (
      <div className="mt-1">
        <div className="text-[var(--muted)]">[sudo] password for recruiter: ********</div>
        <div className="text-[var(--success)] mt-1 animate-pulse">Access granted.</div>
        <div className="text-[var(--teal)] mt-1">→ Redirecting to contact...</div>
      </div>
    );
  }
  if (normalized === "sudo reveal identity") {
    return (
      <div className="mt-1">
        <div className="text-[var(--muted)]">[sudo] password for admin: ********</div>
        <div className="text-[var(--success)] mt-1">Access granted. Decrypting visual buffer...</div>
        <div className="text-[var(--teal)] mt-1 animate-pulse">[!] Identity Revealed</div>
      </div>
    );
  }

  // Strict matches
  switch (normalized) {
    case "help":
      return (
        <div className="text-[var(--muted)] leading-relaxed mt-1 flex flex-col gap-1">
          <div className="text-[var(--text)] font-semibold mb-1">Available commands:</div>
          <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[85px_1fr_85px_1fr] gap-x-2 gap-y-1 mt-0.5 opacity-90">
            <span className="text-[var(--teal)]">whoami</span><span>→ identity</span>
            <span className="text-[var(--teal)]">projects</span><span>→ view work</span>
            <span className="text-[var(--teal)]">architecture</span><span>→ how I build</span>
            <span className="text-[var(--teal)]">about</span><span>→ back story</span>
            <span className="text-[var(--teal)]">skills</span><span>→ tech stack</span>
            <span className="text-[var(--teal)]">experience</span><span>→ work history</span>
            <span className="text-[var(--teal)]">resume</span><span>→ download CV</span>
            <span className="text-[var(--teal)]">open</span><span>→ open file/dir</span>
            <span className="text-[var(--teal)]">contact</span><span>→ connect</span>
            <span className="text-[var(--teal)]">status</span><span>→ system monitor</span>
            <span className="text-[var(--teal)]">uptime</span><span>→ instance uptime</span>
            <span className="text-[var(--teal)]">env</span><span>→ display env</span>
            <span className="text-[var(--teal)]">theme</span><span>→ ui mode</span>
            <span className="text-[var(--teal)]">clear</span><span>→ reset terminal</span>
            <span className="text-[var(--teal)]">sudo</span><span>→ elevated privileges</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--line)]">
            <span className="text-[var(--soft)] italic text-[10px]">Hidden executables: neofetch, ping, logs, coffee, hack system, matrix, date</span>
          </div>
        </div>
      );
    case "whoami":
      return (
        <div className="pl-4 sm:pl-6 flex flex-col gap-1 border-l border-[var(--line)] ml-1.5 my-1 sm:my-1.5 py-0.5 sm:py-1">
          <div><span className="text-[var(--accent)]">"name"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Chinmay Kudalkar"</span><span className="text-[var(--text)]">,</span></div>
          <div><span className="text-[var(--accent)]">"role"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Full-Stack Engineer"</span><span className="text-[var(--text)]">,</span></div>
          <div><span className="text-[var(--accent)]">"focus"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Full-Stack & AI/ML"</span><span className="text-[var(--text)]">,</span></div>
          <div>
            <span className="text-[var(--accent)]">"stack"</span><span className="text-[var(--text)]">: [</span>
            <span className="text-[var(--teal)]">"TypeScript"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"Next.js"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"Node.js"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"PostgreSQL"</span>
            <span className="text-[var(--text)]">],</span>
          </div>
          <div><span className="text-[var(--accent)]">"status"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)] animate-pulse">"Visible on request"</span></div>
        </div>
      );
    case "projects":
    case "ls":
    case "ls projects":
    case "ls projects/":
      return (
        <div className="mt-1">
          <div className="text-[var(--teal)] mb-1">lineup/</div>
          <div className="text-[var(--teal)] mb-1">deploywatch/</div>
          <div className="text-[var(--teal)] mb-1">blockvault/</div>
          <div className="text-[var(--teal)]">sketchtoimage/</div>
        </div>
      );
    case "architecture":
      return <div className="text-[var(--teal)] mt-1">Routing to architecture overview...</div>;
    case "about":
      return <div className="text-[var(--muted)] mt-1">I build robust, scalable systems that solve real problems. I love diving deep into backend architecture while keeping a sharp eye on frontend polish.</div>;
    case "skills":
      return (
        <div className="text-[var(--muted)] mt-1 flex flex-col gap-1">
          <div className="grid grid-cols-[80px_1fr] gap-x-2">
            <span className="text-[var(--accent)]">Frontend:</span><span className="text-[var(--text)]">React, Next.js, Tailwind</span>
            <span className="text-[var(--accent)]">Backend:</span><span className="text-[var(--text)]">Node.js, Express</span>
            <span className="text-[var(--accent)]">Systems:</span><span className="text-[var(--text)]">Redis, BullMQ, PostgreSQL</span>
            <span className="text-[var(--accent)]">DevOps:</span><span className="text-[var(--text)]">Docker, AWS, CI/CD</span>
          </div>
        </div>
      );
    case "experience":
      return (
        <div className="text-[var(--muted)] mt-1">
          <div className="text-[var(--accent)]">2025-26</div>
          <div className="text-[var(--text)]">Mintskill HR Solutions</div>
          <div className="text-[var(--teal)] opacity-80 mt-0.5">Led system design & SaaS delivery</div>
        </div>
      );
    case "status":
      return (
        <div className="text-[var(--muted)] mt-2 flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--teal)]"></span>
            </span>
            <span className="font-bold tracking-tight text-[11px] uppercase">System Monitor v2.4.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-l border-[var(--line)] pl-4 ml-1">
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] uppercase text-[var(--soft)] tracking-widest mb-1">Infrastructure</div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">Core Engine</span>
                <span className="text-[var(--success)]">Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">API Gateway</span>
                <span className="text-[var(--success)]">Stable</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">Database Cluster</span>
                <span className="text-[var(--success)]">Synced</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] uppercase text-[var(--soft)] tracking-widest mb-1">Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>CPU Load</span>
                  <span>14%</span>
                </div>
                <div className="h-1 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                  <div className="h-full w-[14%] bg-[var(--teal)]" />
                </div>
              </div>
              <div className="space-y-1 mt-1">
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>Memory</span>
                  <span>1.2GB / 8GB</span>
                </div>
                <div className="h-1 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-[var(--soft)] italic">
            &gt; All systems nominal. Next scan in 3.4s
          </div>
        </div>
      );
    case "uptime":
      return <div className="text-[var(--text)] mt-1">up 3 years, 21 days, 4 hours, 12 minutes</div>;
    case "env":
      return (
        <div className="text-[var(--muted)] mt-1">
          USER=chinmay<br/>
          ROLE="Full-Stack Engineer"<br/>
          ENV=production<br/>
          PASSION=true
        </div>
      );
    case "neofetch":
      return (
        <div className="text-[var(--muted)] mt-1 flex flex-col gap-1">
          <div className="grid grid-cols-[80px_1fr] gap-x-2">
            <span className="text-[var(--accent)]">OS:</span><span className="text-[var(--text)]">ChinmayOS v1.0</span>
            <span className="text-[var(--accent)]">Kernel:</span><span className="text-[var(--text)]">Backend</span>
            <span className="text-[var(--accent)]">Uptime:</span><span className="text-[var(--text)]">3+ Years</span>
            <span className="text-[var(--accent)]">Packages:</span><span className="text-[var(--text)]">React, Node, Systems Design</span>
            <span className="text-[var(--accent)]">Theme:</span><span className="text-[var(--text)]">Dark/Light</span>
          </div>
        </div>
      );
    case "ping":
      return (
        <div className="text-[var(--muted)] mt-1">
          PING 127.0.0.1 (127.0.0.1): 56 data bytes<br/>
          64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms<br/>
          64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms<br/>
          --- 127.0.0.1 ping statistics ---<br/>
          2 packets transmitted, 2 packets received, 0.0% packet loss
        </div>
      );
    case "logs":
      return (
        <div className="text-[var(--muted)] mt-1 opacity-70">
          [INFO] System initialized successfully.<br/>
          [WARN] Coffee levels running low.<br/>
          [INFO] User connection established.<br/>
          [DEBUG] Rendering portfolio interface...
        </div>
      );
    case "coffee":
      return <div className="text-[var(--warning)] mt-1 animate-pulse">Brewing... ☕</div>;
    case "hack system":
      return <div className="text-[var(--error)] mt-1 font-bold animate-[ping_0.5s_infinite]">ACCESS DENIED</div>;
    case "matrix":
      return <div className="text-[var(--success)] mt-1 break-all">1010110001010101110010101001010101...</div>;
    case "contact":
      return (
        <div className="text-[var(--muted)] mt-1">
          Email: chinmayy.kudalkar@gmail.com<br/>
          GitHub: github.com/ChinmayyK<br/>
          LinkedIn: linkedin.com/in/chinmayyk<br/>
          <span className="text-[var(--teal)] mt-1 block">Redirecting to mail client...</span>
        </div>
      );
    case "resume":
      return <div className="text-[var(--teal)] mt-1">Downloading resume...</div>;
    case "date":
      return <div className="text-[var(--text)] mt-1">{new Date().toDateString()}</div>;
    case "close profile":
      return <div className="text-[var(--success)] mt-1">[✓] Identity secured.</div>;
    case "theme":
    case "theme toggle":
      return <div className="text-[var(--success)] mt-1">[✓] UI Theme updated.</div>;
    case "clear":
      return null;
    case "":
      return null;
    default:
      return <div className="text-[var(--error)] mt-1">command not found: {cmd}. Type 'help' for available commands.</div>;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

function HiddenPhotoWidget({
  isCTAHovered,
  focusRef,
}: {
  isCTAHovered?: boolean;
  focusRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<CommandEntry[]>([
    { cmd: "whoami", output: getCommandOutput("whoami") }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInteractedRef = useRef(false);
  const { toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronization refs for the two doors
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const syncScroll = useCallback((scrollTop: number, source: 'left' | 'right') => {
    const target = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (target && Math.abs(target.scrollTop - scrollTop) > 1) {
      target.scrollTop = scrollTop;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanOpen(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInteractive(true);
  }, [mounted]);

  // Expose a focus function to the parent (Hero)
  useEffect(() => {
    if (!focusRef) return;
    focusRef.current = () => {
      setIsHovered(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    return () => {
      if (focusRef) focusRef.current = null;
    };
  }, [focusRef]);

  const getSuggestion = (input: string) => {
    if (!input) return "";
    const commands = [
      "help", "whoami", "projects", "open", "clear", "contact", 
      "theme", "about", "skills", "experience", "resume", "architecture",
      "status", "uptime", "logs", "ping", "env", "echo",
      "neofetch", "date", "matrix", "sudo reveal identity"
    ];
    const normalized = input.toLowerCase();
    if (normalized.startsWith("open ") || normalized.startsWith("echo ")) return "";
    const match = commands.find(c => c.startsWith(normalized));
    return match ? match.substring(input.length) : "";
  };

  const suggestion = getSuggestion(inputValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    hasInteractedRef.current = true;
    
    if (e.key === "Tab" || e.key === "ArrowRight") {
      e.preventDefault();
      if (suggestion) setInputValue(inputValue + suggestion);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex === -1) setTempInput(inputValue);
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        if (nextIndex === -1) {
          setInputValue(tempInput);
        } else {
          setInputValue(commandHistory[commandHistory.length - 1 - nextIndex]);
        }
      }
      return;
    }

    if (e.key === "Enter") {
      if (inputValue.trim()) {
        setCommandHistory(prev => {
          if (prev[prev.length - 1] === inputValue) return prev;
          return [...prev, inputValue];
        });
      }
      setHistoryIndex(-1);
      setTempInput("");

      const cmd = inputValue.trim().toLowerCase();
      if (cmd === "clear") {
        setHistory([{ cmd: "whoami", output: getCommandOutput("whoami") }]);
      } else {
        const output = getCommandOutput(cmd);
        setHistory(prev => [...prev, { cmd: inputValue, output }]);
        
        if (cmd === "open profile" || cmd === "reveal --identity" || cmd === "sudo reveal identity") {
          setIsHovered(true);
        } else if (cmd === "close profile") {
          setIsHovered(false);
        } else if (cmd === "theme" || cmd === "theme toggle") {
          toggleTheme();
        } 
        if (cmd === "contact" || cmd === "sudo hire chinmay") {
          setTimeout(() => {
            window.location.href = "mailto:chinmayy.kudalkar@gmail.com";
          }, 1500);
        } else if (cmd === "resume") {
          setTimeout(() => {
            window.open("/resume.pdf", "_blank");
          }, 800);
        } else if (cmd === "projects" || cmd === "ls" || cmd.startsWith("open ")) {
          setTimeout(() => {
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          }, 800);
        } else if (cmd === "architecture") {
          setTimeout(() => {
            document.getElementById("principles")?.scrollIntoView({ behavior: "smooth" });
          }, 800);
        } else if (cmd === "status") {
          emitSystemStatus();
          setTimeout(() => {
            document.getElementById("system-footer")?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 1200);
        }
      }
      setInputValue("");
    }
  };

  if (!mounted) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1.15] bg-[var(--bg)] rounded-xl border border-[var(--line)]" />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col w-full max-w-full rounded-xl transition-all duration-500 bg-[var(--bg)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${isCTAHovered ? 'shadow-[0_30px_70px_rgba(0,0,0,0.12)]' : ''}`}
    >
      
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 z-[60]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] shadow-[0_0_10px_rgba(255,95,86,0.3)]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_10px_rgba(255,189,46,0.3)]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] shadow-[0_0_10px_rgba(39,201,63,0.3)]" />
        </div>

        {canOpen && (
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-medium tracking-wide cursor-pointer transition-all duration-200 active:scale-95 border backdrop-blur-md ${
              isHovered
                ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "bg-[var(--surface-soft)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-accent)] shadow-sm"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic("medium");
              setIsHovered(prev => !prev);
            }}
            aria-label={isHovered ? "Switch to terminal view" : "View developer profile photo"}
          >
            {isHovered ? (
              <>
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Terminal</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>View Profile</span>
              </>
            )}
          </button>
        )}
      </div>

      <div
        className="relative w-full max-w-full overflow-hidden aspect-[4/5] sm:aspect-[1/1.15] bg-[var(--bg)] cursor-text"
        onClick={(e) => {
          e.stopPropagation();
          hasInteractedRef.current = true;
          if (canOpen) {
            triggerHaptic("light"); 
            inputRef.current?.focus();
          }
        }}
        style={{ transform: "translateZ(0)", pointerEvents: "auto" }}
      >
        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          aria-hidden="true"
          readOnly={!isInteractive}
          onChange={(e) => {
            if (!isInteractive) return;
            hasInteractedRef.current = true;
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (!isInteractive) return;
            handleKeyDown(e);
          }}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none z-[-1]"
          spellCheck={false}
          autoComplete="off"
        />

        <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src="/chinmay-photo.png"
            alt=""
            fill
            sizes="(max-width: 768px) 250px, 450px"
            priority
            className="object-cover object-top opacity-90 scale-105 transition-transform duration-700 ease-out group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>

        {/* Invisible Master Scroll Layer - Spans the whole width to capture all gestures */}
        <div 
          className="absolute inset-0 z-20 overflow-y-auto scrollbar-hide"
          onScroll={(e) => {
            const st = e.currentTarget.scrollTop;
            if (leftScrollRef.current) leftScrollRef.current.scrollTop = st;
            if (rightScrollRef.current) rightScrollRef.current.scrollTop = st;
          }}
          onClick={(e) => {
            // Forward clicks to the input
            e.stopPropagation();
            inputRef.current?.focus();
            triggerHaptic("light");
          }}
        >
          {/* We render a hidden version of the content here just to get the correct scroll height */}
          <div className="invisible pointer-events-none">
            <FakeUIContent 
              history={history} 
              inputValue={inputValue} 
              suggestion={suggestion}
              scrollRef={null}
              onScroll={() => {}}
              isCTAHovered={isCTAHovered}
            />
          </div>
        </div>

        {/* Left Door - Visual Only */}
        <div
          style={{ transform: isHovered ? "translateX(-100%)" : "translateX(0%)", transition: "transform .45s cubic-bezier(.22,1,.36,1)" , clipPath: "polygon(0 0, 50.5% 0, 50.5% 100%, 0 100%)" } as any}
          className="absolute inset-0 bg-[var(--bg)] z-10 pointer-events-none"
        >
          <FakeUIContent
            scrollRef={leftScrollRef}
            onScroll={() => {}}
            history={history}
            inputValue={inputValue}
            suggestion={suggestion}
            isCTAHovered={isCTAHovered}
          />
        </div>

        {/* Right Door - Visual Only */}
        <div
          style={{ transform: isHovered ? "translateX(100%)" : "translateX(0%)", transition: "transform .45s cubic-bezier(.22,1,.36,1)" , clipPath: "polygon(49.5% 0, 100% 0, 100% 100%, 49.5% 100%)" } as any}
          className="absolute inset-0 bg-[var(--bg)] z-10 pointer-events-none"
        >
          <FakeUIContent 
            scrollRef={rightScrollRef}
            onScroll={() => {}}
            history={history} 
            inputValue={inputValue} 
            suggestion={suggestion}
            isCTAHovered={isCTAHovered}
          />
        </div>

        {canOpen && (
          <div className="absolute bottom-3 right-4 z-[60] pointer-events-none text-[9px] sm:text-[10px] font-mono text-[var(--muted)] opacity-40 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            {"> interactive"}
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalEntry({ entry, index }: { entry: CommandEntry; index: number }) {
  const entryRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!entryRef.current) return;
    gsap.fromTo(
      entryRef.current,
      { opacity: 0, y: 12, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
        delay: index === 0 ? 0 : 0,
      }
    );
  }, { scope: entryRef });

  const renderCmd = (cmd: string) => {
    const parts = cmd.split(" ");
    return (
      <>
        <span className="text-[var(--accent-soft)]">{parts[0]}</span>
        {cmd.substring(parts[0].length)}
      </>
    );
  };

  return (
    <div ref={entryRef} className="mb-4 sm:mb-5" style={{ opacity: 0 }}>
      <div className="flex items-center flex-nowrap font-mono">
        <span className="text-[var(--teal)] font-medium shrink-0">chinmayk@sys</span><span className="text-[var(--soft)]">:</span><span className="text-[var(--accent)]">~</span><span className="text-[var(--soft)] mr-1">$</span>
        <span className="text-[var(--text)] truncate">{renderCmd(entry.cmd)}</span>
      </div>
      {entry.output && (
        <div className="mt-1.5 sm:mt-2">{entry.output}</div>
      )}
    </div>
  );
}

function FakeUIContent({
  history = [],
  inputValue = "",
  suggestion = "",
  scrollRef,
  onScroll,
  isCTAHovered,
}: {
  history?: CommandEntry[];
  inputValue?: string;
  suggestion?: string;
  scrollRef: React.RefObject<HTMLDivElement | null> | null;
  onScroll: (scrollTop: number) => void;
  isCTAHovered?: boolean;
}) {
  const historyLen = history.length;
  const [showGhost, setShowGhost] = useState(false);

  // Auto-scroll to bottom whenever history grows, but avoid jumping on first render
  useEffect(() => {
    if (scrollRef && scrollRef.current && historyLen > 1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyLen, inputValue, scrollRef]);

  // Ghost text timeout logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!inputValue) {
      timeout = setTimeout(() => setShowGhost(true), 3500);
    } else {
      setShowGhost(false);
    }
    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <div className="absolute inset-0 w-full h-full px-4 pb-4 pt-20 sm:px-6 sm:pb-5 sm:pt-24 flex flex-col text-left font-mono bg-transparent rounded-xl overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

      <div
        ref={scrollRef}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onScroll={(e) => onScroll(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide flex flex-col text-[11px] sm:text-sm text-[var(--muted)] leading-[1.4] sm:leading-relaxed relative z-10 whitespace-pre-wrap break-all"
      >
        <div className="flex flex-col">
          {history.map((entry, idx) => (
            <TerminalEntry key={idx} entry={entry} index={idx} />
          ))}
          <div className="flex items-center mt-1 relative pr-16 sm:pr-0 flex-nowrap font-mono">
            <span className="text-[var(--teal)] font-medium shrink-0">chinmayk@sys</span><span className="text-[var(--soft)]">:</span><span className="text-[var(--accent)]">~</span><span className="text-[var(--soft)] mr-0.5">$</span>
            <span className="text-[var(--text)] relative min-h-[20px] min-w-[2px] inline-flex items-center">
              {inputValue}
              {showGhost && !inputValue && (
                 <span className="absolute left-4 sm:left-5 text-[var(--muted)] whitespace-nowrap pointer-events-none opacity-40">
                   Type &quot;help&quot; to explore
                 </span>
              )}
              {suggestion && (
                <span className="absolute left-full text-[var(--muted)] opacity-40 whitespace-pre">
                  {suggestion}
                </span>
              )}
              <span className={`w-1.5 h-3.5 sm:w-2 sm:h-[18px] ml-[2px] bg-gradient-to-b from-[var(--text)] to-[var(--soft)] rounded-[1px] ${isCTAHovered ? 'animate-none opacity-100 shadow-[0_0_8px_var(--text)]' : 'animate-terminal-cursor terminal-cursor-glow'}`} />
            </span>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

// Background logs moved to `src/components/BackgroundLogs.tsx` and lazy-loaded.
