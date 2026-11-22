"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DUR, EASE, STAGGER, motion, reducedMotion } from "@/lib/motion";
import { setLenis } from "@/lib/scroll";
import { transitionState } from "@/lib/transition";

/** Smooth scrolling, driven by GSAP's ticker so scroll-linked motion and the scroll itself share a frame. */
export function SmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    const { gsap, ScrollTrigger } = motion();
    const l = new Lenis({ autoRaf: false, lerp: 0.12, wheelMultiplier: 0.95 });
    setLenis(l);
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); l.destroy(); setLenis(null); };
  }, []);
  return null;
}

/**
 * The choreographer. Pages stay server-rendered and declare motion with data attributes;
 * this one client component reads them on every route and wires the animations:
 *
 *   data-split          lines rise out of a mask
 *   data-reveal         fade and rise ("up", default), or "clip" to wipe open from below
 *   data-stagger        the element's children reveal one after another
 *   data-parallax="n"   drifts against the scroll by n (0.1 is subtle)
 *   data-draw           SVG paths with pathLength="1" draw themselves in
 *   data-delay="s"      extra delay for any of the above
 */
export function Choreographer() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const { gsap, ScrollTrigger, SplitText } = motion();

    // The contact footer waits under the page. Keep it transparent (still focusable) until the page's end is a screen
    // away, so it never counts as the first screen's content and costs nothing until needed.
    const footer = document.querySelector<HTMLElement>(".contact");
    const page = document.querySelector<HTMLElement>(".page");
    const near = footer && page ? ScrollTrigger.create({
      trigger: page, start: "bottom 200%",
      onUpdate: (st) => footer.classList.toggle("is-near", st.progress > 0),
      onRefresh: (st) => footer.classList.toggle("is-near", st.progress > 0),
    }) : null;
    // once the page has slid off the footer, the dark menu button would vanish into it: swap its colour
    const over = page ? ScrollTrigger.create({
      trigger: page, start: "bottom 90px",
      onUpdate: (st) => document.documentElement.classList.toggle("over-dark", st.progress > 0),
      onRefresh: (st) => document.documentElement.classList.toggle("over-dark", st.progress > 0),
    }) : null;
    const stop = () => { near?.kill(); over?.kill(); document.documentElement.classList.remove("over-dark"); };
    if (reducedMotion()) return stop;
    const base = transitionState.enterDelay;
    const delayOf = (el: Element) => base + parseFloat((el as HTMLElement).dataset.delay ?? "0");
    const trigger = (el: Element, start = "top 88%") => ({ trigger: el, start, once: true });

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          aria: "none", // the lines still hold the real text, so no aria-label (not allowed on <p>)
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(self.lines, { yPercent: 110, duration: DUR.slow, ease: EASE.out, stagger: STAGGER, delay: delayOf(el), scrollTrigger: trigger(el) });
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const kind = el.dataset.reveal || "up";
        if (kind === "clip") {
          gsap.fromTo(el, { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.slow, ease: EASE.inOut, delay: delayOf(el), scrollTrigger: trigger(el, "top 92%") });
          const media = el.querySelector("img, svg, [data-media]");
          if (media) gsap.fromTo(media, { scale: 1.18 }, { scale: 1, duration: DUR.slow * 1.4, ease: EASE.out, delay: delayOf(el), scrollTrigger: trigger(el, "top 92%") });
        } else {
          gsap.fromTo(el, { autoAlpha: 0, y: kind === "fade" ? 0 : 36 }, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.out, delay: delayOf(el), scrollTrigger: trigger(el) });
        }
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.fromTo(el.children, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: STAGGER, delay: delayOf(el), scrollTrigger: trigger(el) });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const s = parseFloat(el.dataset.parallax || "0.1") * 100;
        gsap.fromTo(el, { yPercent: s / 2 }, { yPercent: -s / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });

      gsap.utils.toArray<SVGElement>("[data-draw]").forEach((el) => {
        const paths = el.querySelectorAll("[pathLength]");
        gsap.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: EASE.inOut, stagger: 0.12, delay: delayOf(el), scrollTrigger: trigger(el, "top 80%") });
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => { window.removeEventListener("load", refresh); ctx.revert(); stop(); };
  }, [pathname]);

  return null;
}
