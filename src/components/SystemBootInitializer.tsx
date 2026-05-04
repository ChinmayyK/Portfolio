
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { triggerHaptic } from "@/lib/haptics";

/* ─────────────────────────────────────────────────────────────
   SYSTEM BOOT v5.0 — Premium Cinematic Reveal
   Removed kernel logs. Focused on a high-end identity reveal
   with glitch optics, geometric sweeps, and depth.
   ─────────────────────────────────────────────────────────── */

const NAME = "Chinmay Kudalkar";
const TITLE_LINES = ["Performance", "Maintainability", "Scalability"];
const LINKS = ["github.com/ChinmayyK", "linkedin.com/in/chinmayyk"];
const CHIP_LABEL = "SYSTEM v2.4.0";

export function SystemBootInitializer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const chipLabelRef = useRef<HTMLSpanElement>(null);
  const onlineRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const barDotRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [done, setDone] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [currentYear, setCurrentYear] = useState<string | number>("");
  const deadRef = useRef(false);

  const skip = useCallback(() => {
    if (deadRef.current) return;
    deadRef.current = true;

    if (!containerRef.current) {
      setDone(true);
      return;
    }

    containerRef.current.classList.add("ck-exit");

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "expo.inOut",
      onComplete: () => {
        setDone(true);
      }
    });

    setTimeout(() => setDone(true), 1200);
  }, []);

  useGSAP(() => {
    if (deadRef.current) return;

    let timeline: gsap.core.Timeline | undefined;
    let cancelled = false;

    const start = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {}

      if (cancelled || deadRef.current) return;

      // Initial States
      gsap.set(".ck-sweep", { scaleY: 0, transformOrigin: "top left" });
      gsap.set(".ck-chip", { opacity: 0, y: 15 });
      gsap.set(".ck-name-wrap", { opacity: 1 });
      gsap.set(".ck-progress-row", { opacity: 0 });
      gsap.set(".ck-link", { opacity: 0, y: 8 });
      gsap.set(".ck-title", { opacity: 0, y: 10, filter: "blur(4px)" });
      gsap.set(".ck-name-rule", { scaleX: 0, transformOrigin: "center" });
      gsap.set(".ck-hline", { scaleX: 0, transformOrigin: "center" });
      gsap.set(".ck-bar-fill", { scaleX: 0, transformOrigin: "left" });
      
      const nameChars = gsap.utils.toArray(nameRef.current ? nameRef.current.querySelectorAll(".ck-name-char") : []);
      if (nameChars.length) {
        gsap.set(nameChars, {
          y: 60,
          opacity: 0,
          rotateX: -90,
          scale: 0.5,
          filter: "blur(20px)",
          transformOrigin: "50% 50% -100px"
        });
      }

      timeline = gsap.timeline({ onComplete: skip });

      const isMobile = window.innerWidth < 768;
      timeline.timeScale(isMobile ? 1.4 : 1);

      // Phase 1: High-Speed Intro
      timeline.to(".ck-sweep", { scaleY: 1, duration: 0.8, ease: "expo.inOut" })
        .to(".ck-hline", { scaleX: 1, duration: 1.0, ease: "power4.inOut" }, "<0.2");

      // Phase 2: The Core Identity Reveal (Glitch + Stagger)
      timeline.to(".ck-chip", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.4");
      
      if (nameChars.length) {
        timeline.to(nameChars, {
          y: 0,
          opacity: 1,
          rotateX: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.5,
          stagger: {
            each: 0.04,
            from: "center"
          },
          ease: "expo.out"
        }, "<");

        // Subtle Glitch Effect during reveal
        timeline.to(nameChars, {
          x: () => (Math.random() - 0.5) * 10,
          opacity: () => 0.5 + Math.random() * 0.5,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          stagger: 0.02,
          ease: "none"
        }, "<0.2");
      }

      timeline.to(".ck-progress-row", { opacity: 1, duration: 0.6 }, "-=0.8");

      // Progress Bar
      const progData = { val: 0 };
      timeline.to(progData, {
        val: 100,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
          const p = progData.val;
          setProgressPct(Math.round(p));
          if (barFillRef.current) {
            barFillRef.current.style.transform = `scaleX(${p / 100})`;
          }
          if (barDotRef.current) gsap.set(barDotRef.current, { left: `${p}%` });
        }
      }, "<");

      timeline.to(".ck-name-rule", { scaleX: 1, duration: 2.0, ease: "power2.inOut" }, "<");

      // Phase 3: Secondary Elements
      timeline.to(".ck-title", { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)", 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power3.out" 
      }, "-=1.2");

      timeline.to(".ck-link", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.8");

      // Conclusion
      timeline.to(".ck-init", { opacity: 0, display: "none", duration: 0.1 }, "-=0.4")
        .to(".ck-online", { opacity: 1, display: "inline-block", duration: 0.3 }, "<")
        .to(".ck-stage", { 
          filter: "brightness(1.8) contrast(1.2)", 
          scale: 1.02, 
          duration: 0.2, 
          yoyo: true, 
          repeat: 1 
        }, "<");

      timeline.call(() => { triggerHaptic("success"); }, [], "<");
      timeline.to({}, { duration: 0.8 });
    };

    void start();

    return () => {
      cancelled = true;
      timeline?.kill();
    };
  }, { scope: containerRef });

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") skip(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [skip]);

  return (
    <>
      {!done && (
        <div
          ref={containerRef}
          className="ck-boot"
          onClick={() => { triggerHaptic("light"); skip(); }}
          aria-hidden
        >
          <style suppressHydrationWarning>{STYLES}</style>
          <div className="ck-scanlines" />
          <div className="ck-aurora" />
          <div className="ck-grid" />
          <div className="ck-sweep" />
          <div className="ck-vignette" />

          <div className="ck-stage">
            <div className="ck-chip">
              <span className="ck-chip-dot" />
              <span ref={chipLabelRef} className="ck-chip-label">{CHIP_LABEL}</span>
            </div>

            <div className="ck-name-wrap">
              <h1 ref={nameRef} className="ck-name">
                {NAME.split("").map((char, i) => (
                  <span key={i} className="ck-name-char ck-glitch-char" data-text={char === " " ? "\u00A0" : char} style={{ display: "inline-block" }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
              <div className="ck-name-rule" />
            </div>

            <div className="ck-titles">
              {TITLE_LINES.map((t, i) => (
                <span key={t} className="ck-title">
                  {t}
                  {i < TITLE_LINES.length - 1 && <span className="ck-sep" />}
                </span>
              ))}
            </div>

            <div className="ck-progress-row">
              <div className="ck-bar">
                <div ref={barFillRef} className="ck-bar-fill" />
                <div ref={barDotRef} className="ck-bar-dot" />
              </div>
              <span className="ck-pct">{String(progressPct).padStart(3, "0")}%</span>
            </div>

            <div className="ck-links">
              {LINKS.map((l, index) => (
                <span key={l} ref={(el) => { linkRefs.current[index] = el; }} className="ck-link">
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="ck-corner ck-tl">PORTFOLIO PROTOCOL</div>
          <div className="ck-corner ck-tr">{currentYear}</div>
          <div className="ck-corner ck-bl">
            <span className="ck-init">INITIALIZING<span className="ck-ellipsis" /></span>
            <span ref={onlineRef} className="ck-online">● SYSTEM READY</span>
          </div>
          <div className="ck-corner ck-br ck-br-desktop">ESC TO SKIP</div>
          <div className="ck-corner ck-br ck-br-mobile">TAP TO SKIP</div>

          <div className="ck-hline ck-hline-top" />
          <div className="ck-hline ck-hline-bot" />
        </div>
      )}
      {children}
    </>
  );
}

const STYLES = `
  /* ── Boot screen tokens — mirror the portfolio's actual design system ── */
  :root {
    --ck-accent-rgb: 245, 158, 11;
    --ck-bg: #0c1017;
    --ck-bg-elevated: rgba(15, 23, 42, 0.72);
    --ck-text: #f3efe7;
    --ck-muted: #b8bec8;
    --ck-soft: #8f98a8;
    --ck-line: rgba(255, 255, 255, 0.08);
    --ck-line-strong: rgba(255, 255, 255, 0.14);
    --ck-accent: #f59e0b;
    --ck-teal: #5eead4;
    --ck-surface: rgba(255, 255, 255, 0.032);
    --ck-grid-dot: rgba(255, 255, 255, 0.055);
    --ck-vignette: rgba(0, 0, 0, 0.55);
    --ck-scan-color: rgba(0, 0, 0, 0.04);
    --ck-sweep-color: rgba(245, 158, 11, 0.06);
    --ck-name-glow: rgba(245, 158, 11, 0.28);
    --ck-hline-color: rgba(255, 255, 255, 0.1);
    --ck-sep-color: rgba(255, 255, 255, 0.18);
  }

  [data-theme="light"] {
    --ck-accent-rgb: 146, 64, 14;
    --ck-bg: #e8e4de;
    --ck-bg-elevated: rgba(240, 237, 231, 0.95);
    --ck-text: #0f172a;
    --ck-muted: #1a2236;
    --ck-soft: #475569;
    --ck-line: rgba(15, 23, 42, 0.12);
    --ck-line-strong: rgba(15, 23, 42, 0.22);
    --ck-accent: #92400e;
    --ck-teal: #065f46;
    --ck-surface: rgba(255, 255, 255, 0.55);
    --ck-grid-dot: rgba(15, 23, 42, 0.055);
    --ck-vignette: rgba(15, 23, 42, 0.06);
    --ck-scan-color: rgba(15, 23, 42, 0.025);
    --ck-sweep-color: rgba(146, 64, 14, 0.05);
    --ck-name-glow: rgba(146, 64, 14, 0.22);
    --ck-hline-color: rgba(15, 23, 42, 0.16);
    --ck-sep-color: rgba(15, 23, 42, 0.2);
  }

  /* ── Layout ── */
  .ck-boot {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--ck-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1000px;
    cursor: pointer;
    overflow: hidden;
  }

  .ck-exit {
    clip-path: circle(0% at 50% 50%);
    transition: clip-path 0.8s cubic-bezier(0.85, 0, 0.15, 1);
  }

  /* ── Background layers ── */
  .ck-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      var(--ck-scan-color) 3px,
      var(--ck-scan-color) 4px
    );
    z-index: 10;
  }

  .ck-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    background: radial-gradient(ellipse 80% 80% at center, transparent 35%, var(--ck-vignette) 100%);
  }

  .ck-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(var(--ck-grid-dot) 1px, transparent 1px);
    background-size: 36px 36px;
    z-index: 1;
  }

  /* Ambient aurora blobs — match portfolio hero */
  .ck-aurora {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }
  .ck-aurora::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -5%;
    width: 55%;
    height: 55%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--ck-accent-rgb), 0.12) 0%, transparent 65%);
    filter: blur(60px);
  }
  .ck-aurora::after {
    content: '';
    position: absolute;
    bottom: -5%;
    right: -5%;
    width: 45%;
    height: 45%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 65%);
    filter: blur(50px);
  }

  [data-theme="light"] .ck-aurora::before {
    background: radial-gradient(circle, rgba(146, 64, 14, 0.08) 0%, transparent 65%);
  }
  [data-theme="light"] .ck-aurora::after {
    background: radial-gradient(circle, rgba(6, 95, 70, 0.06) 0%, transparent 65%);
  }

  .ck-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, var(--ck-sweep-color) 50%, transparent 100%);
    pointer-events: none;
    z-index: 3;
  }

  .ck-hline {
    position: absolute;
    left: 8%;
    right: 8%;
    height: 1px;
    background: var(--ck-hline-color);
    z-index: 6;
  }
  .ck-hline-top { top: 14%; }
  .ck-hline-bot { bottom: 14%; }

  /* ── Stage (center content) ── */
  .ck-stage {
    position: relative;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0 24px;
  }

  /* ── Chip / badge ── */
  .ck-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
    font-size: 9px;
    color: var(--ck-accent);
    margin-bottom: 36px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    padding: 6px 14px;
    border: 1px solid rgba(var(--ck-accent-rgb), 0.3);
    border-radius: 999px;
    background: rgba(var(--ck-accent-rgb), 0.06);
    backdrop-filter: blur(8px);
  }
  .ck-chip-dot {
    width: 5px;
    height: 5px;
    background: var(--ck-accent);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(var(--ck-accent-rgb), 0.8);
    animation: ck-pulse 2s ease-in-out infinite;
  }
  @keyframes ck-pulse {
    0%, 100% { box-shadow: 0 0 6px rgba(var(--ck-accent-rgb), 0.8); }
    50%       { box-shadow: 0 0 14px rgba(var(--ck-accent-rgb), 1); }
  }

  /* ── Name ── */
  .ck-name-wrap {
    margin-bottom: 20px;
    position: relative;
    text-align: center;
  }
  .ck-name {
    font-size: clamp(22px, 6.5vw, 88px);
    font-weight: 800;
    color: var(--ck-text);
    letter-spacing: -0.02em;
    line-height: 1;
    text-transform: uppercase;
  }
  .ck-name-rule {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ck-accent), transparent);
    margin-top: 14px;
    box-shadow: 0 0 20px rgba(var(--ck-accent-rgb), 0.5);
  }

  /* ── Title lines ── */
  .ck-titles {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 52px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .ck-title {
    font-family: monospace;
    font-size: 11px;
    color: var(--ck-soft);
    text-transform: uppercase;
    letter-spacing: 0.22em;
    padding: 0 16px;
    position: relative;
  }
  .ck-sep {
    display: inline-block;
    width: 1px;
    height: 12px;
    background: var(--ck-sep-color);
    margin: 0;
    vertical-align: middle;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  /* ── Progress ── */
  .ck-progress-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 36px;
  }
  .ck-bar {
    width: 220px;
    height: 2px;
    background: var(--ck-line-strong);
    position: relative;
    border-radius: 1px;
    overflow: visible;
  }
  .ck-bar-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--ck-accent), rgba(var(--ck-accent-rgb), 0.7));
    transform-origin: left center;
    transform: scaleX(0);
    border-radius: 1px;
    box-shadow: 0 0 8px rgba(var(--ck-accent-rgb), 0.5);
  }
  .ck-bar-dot {
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(-50%, -50%);
    width: 7px;
    height: 7px;
    background: var(--ck-accent);
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(var(--ck-accent-rgb), 0.9);
    z-index: 2;
  }
  .ck-pct {
    font-family: monospace;
    font-size: 13px;
    color: var(--ck-accent);
    width: 44px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* ── Links ── */
  .ck-links {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .ck-link {
    font-family: monospace;
    font-size: 10px;
    color: var(--ck-soft);
    opacity: 0;
    letter-spacing: 0.08em;
    transition: color 0.2s;
    position: relative;
    padding-bottom: 2px;
  }
  .ck-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--ck-accent);
    transition: width 0.3s ease;
  }
  .ck-link:hover::after { width: 100%; }

  /* ── Corner labels ── */
  .ck-corner {
    position: absolute;
    font-family: monospace;
    font-size: 9px;
    color: var(--ck-soft);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.7;
    z-index: 30;
  }
  .ck-tl { top: 36px; left: 36px; }
  .ck-tr { top: 36px; right: 36px; }
  .ck-bl { bottom: 36px; left: 36px; }
  .ck-br { bottom: 36px; right: 36px; }

  /* Show correct skip hint based on device */
  .ck-br-desktop { display: block; }
  .ck-br-mobile  { display: none;  }

  .ck-online {
    color: var(--ck-teal);
    font-weight: bold;
  }

  /* ── Glitch chars ── */
  .ck-glitch-char {
    position: relative;
    display: inline-block;
  }
  .ck-name-char {
    text-shadow: 0 0 20px var(--ck-name-glow);
  }

  /* ── Status text ── */
  .ck-ellipsis::after {
    content: '';
    animation: ck-dots 1.5s infinite;
  }
  @keyframes ck-dots {
    0%   { content: '';   }
    33%  { content: '.';  }
    66%  { content: '..'; }
    100% { content: '...'; }
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .ck-name  { font-size: 26px; }
    .ck-titles {
      gap: 0;
      margin-bottom: 32px;
      flex-direction: column;
      align-items: center;
    }
    .ck-title { font-size: 9px; letter-spacing: 0.14em; padding: 4px 0; }
    .ck-sep { display: none; }
    .ck-progress-row { margin-bottom: 28px; }
    .ck-bar   { width: 160px; }
    .ck-chip  { margin-bottom: 28px; font-size: 8px; }
    .ck-links { gap: 16px; }
    .ck-link  { font-size: 9px; }
    .ck-corner { font-size: 7px; opacity: 0.55; }
    .ck-tl, .ck-tr { top: 18px; }
    .ck-bl, .ck-br { bottom: 18px; }
    .ck-tl { left: 18px; }
    .ck-tr { right: 18px; }
    .ck-bl { left: 18px; }
    .ck-br { right: 18px; }
    .ck-br-desktop { display: none;  }
    .ck-br-mobile  { display: block; }
    .ck-hline { left: 5%; right: 5%; }
  }

  @media (hover: none) {
    .ck-br-desktop { display: none;  }
    .ck-br-mobile  { display: block; }
  }
`;
