import type Lenis from "lenis";

// The one smooth-scroll instance, when there is one (not with reduced motion).
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { instance = l; };
export const lenis = () => instance;

/** Scroll to an element or the top, through Lenis when it is running. */
export function scrollToTarget(target: string | number, immediate = false) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : null;
  if (typeof target === "string" && !el) return;
  if (instance) instance.scrollTo(el ?? (target as number), { immediate, duration: 1.4 });
  else if (el) el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  else window.scrollTo({ top: target as number, behavior: immediate ? "auto" : "smooth" });
  if (el) {
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}
