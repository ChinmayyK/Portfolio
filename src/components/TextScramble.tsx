"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]!;
}

interface TextScrambleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  delay?: number;
  duration?: number;
  trigger?: boolean;
}

export function TextScramble({
  text,
  className = "",
  as: Tag = "span",
  delay = 0,
  duration = 680,
  trigger = true,
}: TextScrambleProps) {
  // ✅ Start with real text — never show garbage on mount / SSR
  const [displayed, setDisplayed] = useState<string[]>(() => text.split(""));
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!trigger) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [trigger, delay]);

  useEffect(() => {
    if (!started) return;

    const chars = text.split("");
    const len = chars.length;
    const resolved = new Array(len).fill(false);

    // Each position resolves at slightly irregular time — front first
    const resolveTimes = chars.map((_, i) => {
      const base = (i / len) * duration * 0.85;
      const jitter = (Math.sin(i * 3.7 + 1.2) * 0.5 + 0.5) * duration * 0.12;
      return base + jitter;
    });

    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      let allDone = true;

      const next = chars.map((char, i) => {
        if (char === " " || char === "\n") return char;
        if (resolved[i]) return char;
        if (elapsed >= resolveTimes[i]!) {
          resolved[i] = true;
          return char;
        }
        allDone = false;
        const progress = elapsed / resolveTimes[i]!;
        // Near the end, "hunt" toward real char by sometimes showing it
        if (progress > 0.78 && Math.random() > 0.5) return char;
        return randomChar();
      });

      setDisplayed(next);

      if (!allDone) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, text, duration]);

  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    let currentWord: React.ReactNode[] = [];

    displayed.forEach((char, i) => {
      if (char === " " || char === "\n") {
        if (currentWord.length > 0) {
          elements.push(
            <span key={`word-${i}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {currentWord}
            </span>
          );
          currentWord = [];
        }
        elements.push(
          <span key={`space-${i}`} style={{ display: "inline", whiteSpace: "pre" }}>
            {char}
          </span>
        );
      } else {
        currentWord.push(
          <span
            key={i}
            aria-hidden
            style={{
              display: "inline-block",
              opacity: char === text[i] ? 1 : 0.52,
              transition: char === text[i] ? "opacity 0.12s" : undefined,
            }}
          >
            {char}
          </span>
        );
      }
    });

    if (currentWord.length > 0) {
      elements.push(
        <span key="word-last" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {currentWord}
        </span>
      );
    }

    return elements;
  };

  return (
    <Tag className={className} aria-label={text}>
      {renderContent()}
    </Tag>
  );
}

/**
 * ScrollScramble — triggers TextScramble when element enters viewport.
 * Before intersection: shows real text (readable, accessible, SSR-safe).
 * After intersection: scrambles then resolves.
 */
export function ScrollScramble({
  text,
  className = "",
  as = "span",
  delay = 0,
  duration = 680,
  threshold = 0.3,
}: TextScrambleProps & { threshold?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(isReduced);
    if (isReduced) return;

    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setTriggered(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  // Reduced motion or not yet triggered: just show real text, no scramble
  if (reduced) {
    const T = as;
    return <T className={className}>{text}</T>;
  }

  return (
    <span ref={wrapRef} style={{ display: "contents" }}>
      <TextScramble
        text={text}
        className={className}
        as={as}
        delay={delay}
        duration={duration}
        trigger={triggered}
      />
    </span>
  );
}
