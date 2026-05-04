"use client";

import { useEffect, useRef, useState, Children, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/**
 * TextReveal — Word-by-word stagger reveal on scroll.
 * Each word slides up from below with a cascading delay.
 */
export function TextReveal({
  children,
  className = "",
  stagger = 0.04,
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  stagger?: number;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const words = children.split(" ");

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * CharReveal — Character-by-character cascade with blur-in.
 * Premium text entrance for section titles.
 */
export function CharReveal({
  children,
  className = "",
  stagger = 0.02,
  as: Tag = "span",
}: {
  children: string;
  className?: string;
  stagger?: number;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const chars = children.split("");

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(4px)" }}
          transition={{
            duration: 0.4,
            delay: i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </Tag>
  );
}

/**
 * CountUp — Animated number counter.
 * Counts from 0 to target value when scrolled into view.
 */
export function CountUp({
  target,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const start = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;
      const p = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const current = Math.round(eased * target);
      setCount(current);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
