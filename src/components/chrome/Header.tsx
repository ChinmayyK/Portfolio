"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/content/site";
import { PROJECTS } from "@/content/projects";
import { DUR, EASE, STAGGER, motion, reducedMotion } from "@/lib/motion";
import { lenis } from "@/lib/scroll";
import { TLink } from "./Transition";
import Magnetic from "./Magnetic";

/**
 * The top bar scrolls away with the page. Past the first screen a round menu button takes over,
 * and on small screens it is the only navigation. The menu is a full-screen dialog.
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setDocked(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close when the route changes (back and forward included), adjusting state during render
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) { setSeenPath(pathname); setOpen(false); }

  useEffect(() => {
    const el = panel.current!;
    const { gsap } = motion();
    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      lenis()?.stop();
      el.hidden = false;
      if (reducedMotion()) gsap.set([el, items], { clearProps: "all" });
      else
        gsap.timeline()
          .fromTo(el, { clipPath: "circle(0% at calc(100% - 3.5rem) 3.5rem)" }, { clipPath: "circle(150% at calc(100% - 3.5rem) 3.5rem)", duration: DUR.curtain, ease: EASE.inOut })
          .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: DUR.base, ease: EASE.out, stagger: STAGGER }, "-=.45");
      const first = el.querySelector<HTMLElement>("a");
      first?.focus({ preventScroll: true });
      const key = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Tab") {
          const f = Array.from(el.querySelectorAll<HTMLElement>("a, button")).concat(button.current!);
          const i = f.indexOf(document.activeElement as HTMLElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
      };
      document.addEventListener("keydown", key);
      return () => document.removeEventListener("keydown", key);
    }
    if (el.hidden) return;
    lenis()?.start();
    if (reducedMotion()) { el.hidden = true; return; }
    gsap.to(el, { clipPath: "circle(0% at calc(100% - 3.5rem) 3.5rem)", duration: DUR.curtain * 0.8, ease: EASE.inOut, onComplete: () => { el.hidden = true; } });
  }, [open]);

  return (
    <>
      <header className="topbar frame">
        <TLink href="/" label="Index" className="topbar-mark" aria-label={`${SITE.name}, home`}>
          {/* the CK. monogram, the same file as the favicon */}
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, SVG */}
          <img src="/icon.svg" alt="" width={64} height={64} />
        </TLink>
        <nav aria-label="Primary" className="topbar-nav">
          {NAV.map((n) => (
            <Magnetic key={n.href} strength={0.3}><TLink href={n.href} label={n.label} className="uhover">{n.label}</TLink></Magnetic>
          ))}
          <Magnetic strength={0.3}><a href={SITE.resume} className="uhover">Résumé</a></Magnetic>
        </nav>
      </header>

      <div className={`menu-dock ${docked || open ? "is-docked" : ""}`}>
        <Magnetic strength={0.4}>
          <button
            ref={button}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-lines" aria-hidden="true"><i /><i /></span>
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </Magnetic>
      </div>

      <div ref={panel} id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
        <div className="menu-inner frame">
          <p className="t-label menu-kicker">Navigation</p>
          <ul className="menu-list">
            {[{ label: "Index", href: "/" }, ...NAV, ...PROJECTS.map((p) => ({ label: p.title, href: `/work/${p.slug}` }))].map((n, i) => (
              <li key={n.href} className="menu-row">
                <span className="menu-mask">
                  <TLink data-menu-item href={n.href} label={n.label} className="menu-link t-h1" aria-current={pathname === n.href ? "page" : undefined} onClick={() => setOpen(false)}>
                    <span className="t-label menu-num">{String(i).padStart(2, "0")}</span>{n.label}
                  </TLink>
                </span>
              </li>
            ))}
          </ul>
          <div className="menu-foot">
            <a className="uhover" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <span className="menu-social">
              <a className="uhover" href={SITE.github}>GitHub</a>
              <a className="uhover" href={SITE.linkedin}>LinkedIn</a>
              <a className="uhover" href={SITE.resume}>Résumé</a>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
