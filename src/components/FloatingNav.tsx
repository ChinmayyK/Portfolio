"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { triggerHaptic } from "@/lib/haptics";
import { Home, Briefcase, Code2, Layers, Mail } from "lucide-react";

const navItems = [
  { id: "top", label: "Home", icon: Home },
  { id: "experience", label: "Work", icon: Briefcase },
  { id: "projects", label: "Projects", icon: Code2 },
  { id: "stack", label: "Stack", icon: Layers },
  { id: "contact", label: "Contact", icon: Mail },
];

function getActiveSectionId() {
  if (typeof window === "undefined") {
    return "top";
  }

  const threshold = window.innerHeight * 0.42;
  let current = navItems[0]?.id ?? "top";
  let closest = current;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const item of navItems) {
    const element = document.getElementById(item.id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const inRange = rect.top <= threshold && rect.bottom >= threshold;
    const distance = Math.abs(rect.top - threshold);

    if (inRange) {
      return item.id;
    }

    if (rect.top <= threshold) {
      current = item.id;
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = item.id;
    }
  }

  return current ?? closest;
}

export function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      frame = 0;
      setVisible(window.scrollY > 80);
      setActiveSection(getActiveSectionId());
    };

    const requestSync = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    triggerHaptic("light");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible ? (
          <motion.nav
            initial={{ y: -18, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -18, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-4 z-[100] hidden -translate-x-1/2 md:block"
            aria-label="Section navigation"
          >
            <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg)]/85 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(245,158,11,0.05)] backdrop-blur-xl ring-1 ring-inset ring-white/5">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { triggerHaptic("light"); scrollTo(item.id); }}
                    className={`relative rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 ${
                      isActive ? "text-[var(--text)]" : "text-[var(--soft)] hover:text-[var(--muted)]"
                    }`}
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-full border border-[var(--accent)]/30 bg-[var(--surface-accent)] shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                        transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {visible ? (
          <motion.nav
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-3 z-[100] px-3 md:hidden"
            aria-label="Mobile section navigation"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="mx-auto max-w-[340px] rounded-full border border-[var(--line)] bg-[var(--bg)]/90 p-1.5 shadow-[0_16px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl ring-1 ring-inset ring-white/10">
              <div className="flex items-center justify-between gap-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { triggerHaptic("light"); scrollTo(item.id); }}
                      className={`relative flex h-[46px] items-center justify-center rounded-full transition-all duration-300 ease-out ${
                        isActive 
                          ? "flex-1 px-4 text-[var(--text)]" 
                          : "w-[46px] shrink-0 text-[var(--soft)] hover:text-[var(--muted)]"
                      }`}
                    >
                      {isActive ? (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 rounded-full border border-[var(--accent-soft)] bg-[var(--accent)]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      ) : null}
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        <Icon 
                          className={`shrink-0 transition-colors duration-300 ${isActive ? "text-[var(--accent)] h-[18px] w-[18px]" : "h-5 w-5"}`} 
                          strokeWidth={isActive ? 2.5 : 1.5} 
                        />
                        <div className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${isActive ? "max-w-[100px] opacity-100 ml-0.5" : "max-w-0 opacity-0 ml-0"}`}>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </>
  );
}
