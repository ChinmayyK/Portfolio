"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps } from "react";
import { DUR, EASE, motion, reducedMotion } from "@/lib/motion";
import { lenis, scrollToTarget } from "@/lib/scroll";
import { transitionState } from "@/lib/transition";

type Go = (href: string, label?: string) => void;
const Ctx = createContext<Go | null>(null);

/**
 * Route changes play as a transfer: a curtain rises with the destination's name and a progress
 * line, the route swaps underneath, the line completes and the curtain lifts off the new page.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const path = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const pending = useRef<URL | null>(null);

  const go = useCallback<Go>((href, name) => {
    const url = new URL(href, window.location.href);
    if (reducedMotion()) { router.push(href); return; }
    if (pending.current) return;
    pending.current = url;
    const { gsap } = motion();
    label.current!.textContent = name ?? "Index";
    path.current!.textContent = url.pathname;
    lenis()?.stop();
    gsap.timeline()
      .set(curtain.current, { visibility: "visible", yPercent: 100 })
      .set(bar.current, { scaleX: 0 })
      .set(label.current, { yPercent: 100 })
      .to(curtain.current, { yPercent: 0, duration: DUR.curtain, ease: EASE.inOut })
      .to(label.current, { yPercent: 0, duration: 0.7, ease: EASE.out }, "-=.35")
      .to(bar.current, { scaleX: 0.72, duration: 0.55, ease: "power2.out" }, "<")
      .add(() => {
        transitionState.set(true);
        router.push(url.pathname + url.hash, { scroll: false });
      });
  }, [router]);

  useEffect(() => {
    const url = pending.current;
    if (!url || url.pathname !== pathname) return;
    pending.current = null;
    const { gsap, ScrollTrigger } = motion();
    window.scrollTo(0, 0);
    lenis()?.scrollTo(0, { immediate: true, force: true });
    lenis()?.start();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (url.hash) scrollToTarget(url.hash, true);
    });
    gsap.timeline({ onComplete: () => { transitionState.set(false); gsap.set(curtain.current, { visibility: "hidden" }); } })
      .to(bar.current, { scaleX: 1, duration: 0.3, ease: "power2.out" })
      .to(label.current, { yPercent: -100, duration: 0.5, ease: EASE.inOut }, "+=.05")
      .to(curtain.current, { yPercent: -100, duration: DUR.curtain, ease: EASE.inOut }, "<.1");
  }, [pathname]);

  return (
    <Ctx.Provider value={go}>
      {children}
      <div ref={curtain} className="curtain" aria-hidden="true">
        <div className="curtain-mask"><p ref={label} className="t-h2 curtain-label" /></div>
        <div className="curtain-meta t-label">
          <span>transferring <span ref={path} /></span>
          <span className="curtain-bar"><span ref={bar} /></span>
        </div>
      </div>
    </Ctx.Provider>
  );
}

type TLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string; label?: string };

/** A Link that plays the curtain between routes and scrolls smoothly to anchors on the same page. */
export function TLink({ href, label, onClick, ...rest }: TLinkProps) {
  const go = useContext(Ctx);
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const url = new URL(href, window.location.href);
        if (url.pathname === pathname) {
          e.preventDefault();
          if (url.hash) {
            scrollToTarget(url.hash);
            history.replaceState(null, "", url.hash);
          } else scrollToTarget(0);
        }
      }}
      onNavigate={(e) => {
        if (!go) return;
        e.preventDefault();
        go(href, label);
      }}
    />
  );
}
