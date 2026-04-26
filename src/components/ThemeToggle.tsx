"use client";

import { motion } from "framer-motion";
import { SunMoon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { triggerHaptic } from "@/lib/haptics";

type ViewTransitionCapableDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void;
};

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        triggerHaptic("light");
        
        const x = e.clientX;
        const y = e.clientY;

        document.documentElement.style.setProperty("--click-x", `${x}px`);
        document.documentElement.style.setProperty("--click-y", `${y}px`);
        
        const shockwaveEvent = new CustomEvent("sh-theme-trigger", {
          detail: {
            x,
            y,
            onComplete: () => {}
          }
        });
        window.dispatchEvent(shockwaveEvent);

        const transitionDocument = document as ViewTransitionCapableDocument;

        if (!transitionDocument.startViewTransition) {
          toggleTheme();
          return;
        }

        transitionDocument.startViewTransition(async () => {
          toggleTheme();
          await new Promise((r) => setTimeout(r, 0));
        });
      }}
      className="inline-flex min-h-[40px] md:min-h-[44px] items-center gap-3 rounded-full border border-[var(--line-strong)] bg-[var(--surface-soft)] p-2 md:px-4 md:py-2 text-left text-[var(--text)] shadow-[var(--shadow-elevated)] backdrop-blur-xl"
      aria-label="Toggle light and dark mode"
    >
      <span className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-muted)] text-[var(--accent)] shrink-0">
        <SunMoon className="h-4 w-4" />
      </span>
      <span className="hidden md:block">
        <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-soft)]">
          Display
        </span>
        <span className="block text-sm font-medium text-[var(--text)]">
          Light / Dark
        </span>
      </span>
    </motion.button>
  );
}

