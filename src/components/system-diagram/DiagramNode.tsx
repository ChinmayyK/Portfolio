"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDiagramContext } from "./DiagramContext";

export type NodeTone =
  | "neutral" | "amber" | "sky" | "teal"
  | "client" | "external" | "data";

interface DiagramNodeProps {
  label: string;
  subLabel?: string;
  tone?: NodeTone;
  insight?: string;
  nodeIndex?: number; // for staggered decision animations
}

interface ToneStyle {
  border: string; bg: string; text: string; sub: string; dot: string;
  hoverBorder: string; decisionBorder: string;
}

const DARK_TONES: Record<NodeTone, ToneStyle> = {
  neutral:  {
    border: "border-[var(--diagram-boundary)]",
    bg: "bg-[rgba(255,255,255,0.03)]",
    text: "text-[rgba(255,255,255,0.82)]",
    sub: "text-[rgba(255,255,255,0.4)]",
    dot: "bg-[rgba(255,255,255,0.4)]",
    hoverBorder: "rgba(255,255,255,0.28)",
    decisionBorder: "rgba(255,255,255,0.4)",
  },
  amber: {
    border: "border-[rgba(245,158,11,0.3)]",
    bg: "bg-[rgba(245,158,11,0.04)]",
    text: "text-[rgba(253,230,138,0.92)]",
    sub: "text-[rgba(245,158,11,0.5)]",
    dot: "bg-[rgba(245,158,11,0.7)]",
    hoverBorder: "rgba(245,158,11,0.58)",
    decisionBorder: "rgba(245,158,11,0.7)",
  },
  sky: {
    border: "border-[rgba(56,189,248,0.3)]",
    bg: "bg-[rgba(56,189,248,0.04)]",
    text: "text-[rgba(186,230,253,0.92)]",
    sub: "text-[rgba(56,189,248,0.5)]",
    dot: "bg-[rgba(56,189,248,0.7)]",
    hoverBorder: "rgba(56,189,248,0.58)",
    decisionBorder: "rgba(56,189,248,0.7)",
  },
  teal: {
    border: "border-[rgba(94,234,212,0.3)]",
    bg: "bg-[rgba(94,234,212,0.04)]",
    text: "text-[rgba(153,246,228,0.92)]",
    sub: "text-[rgba(94,234,212,0.5)]",
    dot: "bg-[rgba(94,234,212,0.7)]",
    hoverBorder: "rgba(94,234,212,0.58)",
    decisionBorder: "rgba(94,234,212,0.7)",
  },
  client: {
    border: "border-[rgba(56,189,248,0.3)]",
    bg: "bg-[rgba(56,189,248,0.04)]",
    text: "text-[rgba(186,230,253,0.92)]",
    sub: "text-[rgba(56,189,248,0.5)]",
    dot: "bg-[rgba(56,189,248,0.7)]",
    hoverBorder: "rgba(56,189,248,0.58)",
    decisionBorder: "rgba(56,189,248,0.7)",
  },
  external: {
    border: "border-[rgba(94,234,212,0.3)]",
    bg: "bg-[rgba(94,234,212,0.04)]",
    text: "text-[rgba(153,246,228,0.92)]",
    sub: "text-[rgba(94,234,212,0.5)]",
    dot: "bg-[rgba(94,234,212,0.7)]",
    hoverBorder: "rgba(94,234,212,0.58)",
    decisionBorder: "rgba(94,234,212,0.7)",
  },
  data: {
    border: "border-[rgba(167,139,250,0.3)]",
    bg: "bg-[rgba(167,139,250,0.04)]",
    text: "text-[rgba(221,214,254,0.92)]",
    sub: "text-[rgba(167,139,250,0.5)]",
    dot: "bg-[rgba(167,139,250,0.7)]",
    hoverBorder: "rgba(167,139,250,0.58)",
    decisionBorder: "rgba(167,139,250,0.7)",
  },
};

/* ── Light mode: high-contrast readable colors ── */
const LIGHT_TONES: Record<NodeTone, ToneStyle> = {
  neutral: {
    border: "border-[var(--diagram-boundary)]",
    bg: "bg-[rgba(15,23,42,0.04)]",
    text: "text-[rgba(15,23,42,0.88)]",
    sub: "text-[rgba(15,23,42,0.5)]",
    dot: "bg-[rgba(15,23,42,0.35)]",
    hoverBorder: "rgba(15,23,42,0.3)",
    decisionBorder: "rgba(15,23,42,0.45)",
  },
  amber: {
    border: "border-[rgba(146,64,14,0.35)]",
    bg: "bg-[rgba(146,64,14,0.06)]",
    text: "text-[rgba(120,53,15,0.95)]",
    sub: "text-[rgba(146,64,14,0.6)]",
    dot: "bg-[rgba(146,64,14,0.65)]",
    hoverBorder: "rgba(146,64,14,0.55)",
    decisionBorder: "rgba(146,64,14,0.65)",
  },
  sky: {
    border: "border-[rgba(3,105,161,0.3)]",
    bg: "bg-[rgba(3,105,161,0.05)]",
    text: "text-[rgba(12,74,110,0.95)]",
    sub: "text-[rgba(3,105,161,0.55)]",
    dot: "bg-[rgba(3,105,161,0.6)]",
    hoverBorder: "rgba(3,105,161,0.5)",
    decisionBorder: "rgba(3,105,161,0.65)",
  },
  teal: {
    border: "border-[rgba(6,95,70,0.3)]",
    bg: "bg-[rgba(6,95,70,0.05)]",
    text: "text-[rgba(4,78,56,0.95)]",
    sub: "text-[rgba(6,95,70,0.55)]",
    dot: "bg-[rgba(6,95,70,0.6)]",
    hoverBorder: "rgba(6,95,70,0.5)",
    decisionBorder: "rgba(6,95,70,0.65)",
  },
  client: {
    border: "border-[rgba(3,105,161,0.3)]",
    bg: "bg-[rgba(3,105,161,0.05)]",
    text: "text-[rgba(12,74,110,0.95)]",
    sub: "text-[rgba(3,105,161,0.55)]",
    dot: "bg-[rgba(3,105,161,0.6)]",
    hoverBorder: "rgba(3,105,161,0.5)",
    decisionBorder: "rgba(3,105,161,0.65)",
  },
  external: {
    border: "border-[rgba(6,95,70,0.3)]",
    bg: "bg-[rgba(6,95,70,0.05)]",
    text: "text-[rgba(4,78,56,0.95)]",
    sub: "text-[rgba(6,95,70,0.55)]",
    dot: "bg-[rgba(6,95,70,0.6)]",
    hoverBorder: "rgba(6,95,70,0.5)",
    decisionBorder: "rgba(6,95,70,0.65)",
  },
  data: {
    border: "border-[rgba(109,40,217,0.3)]",
    bg: "bg-[rgba(109,40,217,0.05)]",
    text: "text-[rgba(88,28,135,0.95)]",
    sub: "text-[rgba(109,40,217,0.55)]",
    dot: "bg-[rgba(109,40,217,0.6)]",
    hoverBorder: "rgba(109,40,217,0.5)",
    decisionBorder: "rgba(109,40,217,0.65)",
  },
};

function useIsDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.dataset.theme !== "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function DiagramNode({ label, subLabel, tone = "neutral", insight, nodeIndex = 0 }: DiagramNodeProps) {
  const [open, setOpen] = useState(false);
  const { mode } = useDiagramContext();
  const isDark = useIsDark();
  const s = isDark ? DARK_TONES[tone] : LIGHT_TONES[tone];

  const isFailure = mode === "failure";
  const isDecisions = mode === "decisions";
  const isSystems = mode === "systems";

  // Failure: flicker animation
  const flickerAnimation = isFailure ? {
    opacity: [1, 0.72, 1, 0.85, 1, 0.78, 1],
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: nodeIndex * 0.35,
      times: [0, 0.15, 0.28, 0.44, 0.6, 0.78, 1],
    },
  } : {};

  // Decisions: progressive border brightening
  const decisionGlowDelay = nodeIndex * 0.28;
  const decisionBoxShadow = isDecisions
    ? [
        "0 0 0px transparent",
        `0 0 14px ${s.decisionBorder.replace(")", ", 0.5)")}`,
        "0 0 0px transparent",
      ]
    : undefined;

  return (
    <div className="relative min-w-0 w-full h-full">
      <motion.div
        className={`relative h-full flex flex-col justify-center w-full min-w-0 rounded-[0.875rem] border px-4 py-4 ${s.border} ${s.bg} ${insight ? "cursor-help" : ""}`}
        animate={{
          ...flickerAnimation,
          ...(isDecisions && {
            boxShadow: decisionBoxShadow,
          }),
          ...(isSystems && !isDecisions && !isFailure && {
            opacity: [1, 0.92, 1],
          }),
        }}
        transition={
          isDecisions
            ? { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: decisionGlowDelay }
            : isSystems
            ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: nodeIndex * 0.4 }
            : undefined
        }
        whileHover={insight ? { scale: 1.018, borderColor: s.hoverBorder } : undefined}
        onMouseEnter={() => insight && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => insight && setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={insight ? 0 : undefined}
      >
        {/* Status dot */}
        <span
          aria-hidden
          className={`absolute right-2 top-2 h-2 w-2 rounded-full transition-colors duration-500 ${
            isFailure ? "bg-[rgba(248,113,113,0.75)]" : s.dot
          } opacity-60`}
        />

        {subLabel && (
          <p className={`mb-1 font-mono text-[8px] uppercase tracking-[0.24em] ${s.sub}`}>
            {subLabel}
          </p>
        )}
        <p className={`text-xs font-medium leading-snug ${s.text}`}>{label}</p>
      </motion.div>

      {/* Insight tooltip */}
      <AnimatePresence>
        {open && insight && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-52 max-w-[calc(100vw-2rem)] rounded-[0.75rem] border border-[var(--diagram-boundary)] bg-[var(--bg-strong)] px-4 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <p className="text-[10px] leading-relaxed text-[var(--muted)]">{insight}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
