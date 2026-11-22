import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// The motion system's vocabulary. Components use these rather than their own numbers,
// so every entrance, wipe and hover on the site shares one rhythm.
export const EASE = {
  out: "expo.out", // entrances: fast start, long settle
  inOut: "power4.inOut", // wipes and curtains
  soft: "power3.out", // small UI feedback
} as const;

export const DUR = { quick: 0.35, base: 0.9, slow: 1.25, curtain: 0.8 } as const;
export const STAGGER = 0.075;

let registered = false;
export function motion() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    registered = true;
  }
  return { gsap, ScrollTrigger, SplitText };
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
