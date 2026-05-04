
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

    // Premium cinematic slide-up and fade transition
    gsap.to(containerRef.current, {
      yPercent: -100,
      opacity: 0,
      scale: 0.95,
      duration: 1.2,
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
          y: 40,
          opacity: 0,
          scale: 0.5,
          rotateX: 45,
          filter: "blur(15px)"
        });
      }

      timeline = gsap.timeline({ onComplete: skip });

      const isMobile = window.innerWidth < 768;
      timeline.timeScale(isMobile ? 1.4 : 1);

      // Phase 1: High-Speed Intro
      timeline.to(".ck-sweep", { scaleY: 1, duration: 0.8, ease: "expo.inOut" })
        .to(".ck-hline", { scaleX: 1, duration: 1.0, ease: "power4.inOut" }, "<0.2")
        .fromTo(".ck-grid", { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }, "<");

      // Phase 2: The Core Identity Reveal (Glitch + Stagger)
      timeline.to(".ck-chip", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.4");
      
      if (nameChars.length) {
        timeline.to(nameChars, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: {
            each: 0.04,
            from: "start"
          },
          ease: "expo.out"
        }, "<");
      }

      timeline.to(".ck-progress-row", { opacity: 1, duration: 0.6 }, "-=0.8");

      // Progress Bar
      const progData = { val: 0 };
      timeline.to(progData, {
        val: 100,
        duration: 1.8,
        ease: "power3.inOut",
        onUpdate: () => {
          const p = progData.val;
          setProgressPct(Math.round(p));
          if (barFillRef.current) {
            barFillRef.current.style.transform = `scaleX(${p / 100})`;
          }
          if (barDotRef.current) gsap.set(barDotRef.current, { left: `${p}%` });
        }
      }, "<");

      timeline.to(".ck-name-rule", { scaleX: 1, duration: 1.8, ease: "power3.inOut" }, "<");

      // Phase 3: Secondary Elements
      timeline.to(".ck-title", { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)", 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power3.out" 
      }, "-=1.0");

      timeline.to(".ck-link", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.6");

      // Conclusion - Cinematic flash and zoom out
      timeline.to(".ck-init", { opacity: 0, display: "none", duration: 0.1 }, "-=0.2")
        .to(".ck-online", { opacity: 1, display: "inline-block", duration: 0.3 }, "<");

      timeline.call(() => { triggerHaptic("success"); }, [], "<");
      timeline.to({}, { duration: 0.4 });
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
  /* ── Boot screen tokens — mapped directly to portfolio's design system ── */
  .ck-boot {
    --ck-bg: var(--bg, #0c1017);
    --ck-text: var(--text, #f3efe7);
    --ck-muted: var(--muted, #b8bec8);
    --ck-soft: var(--soft, #8f98a8);
    --ck-line: var(--line, rgba(255, 255, 255, 0.08));
    --ck-line-strong: var(--line-strong, rgba(255, 255, 255, 0.14));
    --ck-accent: var(--accent, #f59e0b);
    --ck-teal: var(--teal, #5eead4);

    --ck-vignette: color-mix(in srgb, var(--ck-bg) 55%, black);
    --ck-scan-color: color-mix(in srgb, var(--ck-text) 4%, transparent);
    --ck-sweep-color: color-mix(in srgb, var(--ck-accent) 6%, transparent);
    --ck-name-glow: color-mix(in srgb, var(--ck-accent) 28%, transparent);
    --ck-hline-color: color-mix(in srgb, var(--ck-text) 10%, transparent);
    --ck-sep-color: color-mix(in srgb, var(--ck-text) 18%, transparent);
    --ck-grid-dot: color-mix(in srgb, var(--ck-text) 5.5%, transparent);
  }

  /* ── Layout ── */
  .ck-boot {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background:
      radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 28%),
      radial-gradient(circle at 85% 12%, rgba(94, 234, 212, 0.12), transparent 24%),
      radial-gradient(circle at 50% 100%, rgba(56, 189, 248, 0.08), transparent 30%),
      linear-gradient(180deg, #0d1118 0%, #0c1017 45%, #0b0e14 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    perspective: 1000px;
    cursor: pointer;
    overflow: hidden;
  }

  [data-theme="light"] .ck-boot {
    --ck-vignette: color-mix(in srgb, var(--ck-bg) 75%, #bcaea3);
    background:
      radial-gradient(circle at top left, rgba(146, 64, 14, 0.08), transparent 26%),
      radial-gradient(circle at 85% 12%, rgba(6, 95, 70, 0.05), transparent 24%),
      radial-gradient(circle at 50% 100%, rgba(6, 95, 70, 0.04), transparent 28%),
      linear-gradient(180deg, #ece8e1 0%, #e8e4de 45%, #e2ded6 100%);
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
    background: radial-gradient(circle, color-mix(in srgb, var(--ck-accent) 12%, transparent) 0%, transparent 65%);
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
    background: radial-gradient(circle, color-mix(in srgb, var(--ck-accent) 8%, transparent) 0%, transparent 65%);
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
    border: 1px solid color-mix(in srgb, var(--ck-accent) 30%, transparent);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ck-accent) 6%, transparent);
    backdrop-filter: blur(8px);
  }
  .ck-chip-dot {
    width: 5px;
    height: 5px;
    background: var(--ck-accent);
    border-radius: 50%;
    box-shadow: 0 0 8px color-mix(in srgb, var(--ck-accent) 80%, transparent);
    animation: ck-pulse 2s ease-in-out infinite;
  }
  @keyframes ck-pulse {
    0%, 100% { box-shadow: 0 0 6px color-mix(in srgb, var(--ck-accent) 80%, transparent); }
    50%       { box-shadow: 0 0 14px var(--ck-accent); }
  }

  /* ── Name ── */
  .ck-name-wrap {
    margin-bottom: 20px;
    position: relative;
    text-align: center;
  }
  .ck-name {
    font-size: clamp(36px, 8.5vw, 100px);
    font-weight: 800;
    color: var(--ck-text);
    letter-spacing: 0.04em;
    line-height: 1;
    text-transform: uppercase;
  }
  .ck-name-rule {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--ck-accent), transparent);
    margin-top: 14px;
    box-shadow: 0 0 20px color-mix(in srgb, var(--ck-accent) 50%, transparent);
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
    font-size: 13px;
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
    width: 280px;
    height: 2px;
    background: var(--ck-line-strong);
    position: relative;
    border-radius: 1px;
    overflow: visible;
  }
  .ck-bar-fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--ck-accent), color-mix(in srgb, var(--ck-accent) 70%, transparent));
    transform-origin: left center;
    transform: scaleX(0);
    border-radius: 1px;
    box-shadow: 0 0 8px color-mix(in srgb, var(--ck-accent) 50%, transparent);
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
    box-shadow: 0 0 12px color-mix(in srgb, var(--ck-accent) 90%, transparent);
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
    text-shadow: 
      0 0 20px var(--ck-name-glow),
      2px 0 0 rgba(255, 95, 86, 0.3),
      -2px 0 0 rgba(45, 212, 191, 0.3);
  }

  [data-theme="light"] .ck-name-char {
    text-shadow: 
      1px 0 0 rgba(255, 95, 86, 0.2),
      -1px 0 0 rgba(45, 212, 191, 0.2);
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
    .ck-name  { font-size: clamp(20px, 7vw, 34px); letter-spacing: 0.02em; white-space: nowrap; }
    .ck-titles {
      gap: 6px;
      margin-bottom: 32px;
      flex-direction: column;
      align-items: center;
    }
    .ck-title { font-size: 10px; letter-spacing: 0.18em; padding: 0; }
    .ck-sep { display: none; }
    .ck-progress-row { margin-bottom: 28px; }
    .ck-bar   { width: 200px; }
    .ck-chip  { margin-bottom: 24px; font-size: 9px; padding: 4px 12px; }
    .ck-links { gap: 16px; }
    .ck-link  { font-size: 9px; }
    .ck-corner { font-size: 8px; opacity: 0.65; }
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
