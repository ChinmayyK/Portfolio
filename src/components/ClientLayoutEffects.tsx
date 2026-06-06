"use client";

import { useEffect } from "react";
import { ScrollProgress } from "./ScrollProgress";
import { FloatingNav } from "./FloatingNav";
import { SystemBootInitializer } from "./SystemBootInitializer";
import { triggerHaptic } from "@/lib/haptics";
import { playClick } from "@/lib/sounds";

export function ClientLayoutEffects({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const pulseButton = (button: Element) => {
      button.setAttribute("data-haptic-press", "true");
      window.setTimeout(() => {
        button.removeAttribute("data-haptic-press");
      }, 140);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button, [role='button']");
      if (!button) return;

      if (button instanceof HTMLButtonElement && button.disabled) return;

      triggerHaptic("medium");
      playClick();
      pulseButton(button);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.detail !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button, [role='button']");
      if (!button) return;

      triggerHaptic("medium");
      playClick();
      pulseButton(button);
    };

    document.addEventListener("pointerup", handlePointerUp, { capture: true, passive: true });
    document.addEventListener("click", handleClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return (
    <SystemBootInitializer>
      <div data-app-shell>
        <ScrollProgress />
        <FloatingNav />
        {children}
      </div>
    </SystemBootInitializer>
  );
}
