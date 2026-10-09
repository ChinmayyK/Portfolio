"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, FileZip, GithubLogo, WifiSlash } from "@phosphor-icons/react";
import { PROJECTS } from "@/lib/content";
import Shot from "@/components/Shot";
import { buzz } from "@/lib/buzz";
import { detect, type Visitor } from "@/lib/visitor";

const P = PROJECTS.find((p) => p.star)!;
const DROP_AT = 48; // percent where the demo connection drops

/**
 * Desktop only: the hero's Mac and phone cards fly into the scene while the page scrolls from the
 * top to the chapter, then hand over to the scene's own devices. Returns its cleanup.
 */
function handoff(story: HTMLElement) {
  const cas = document.querySelector<HTMLElement>(".hero .cascade");
  const pairs = ([[".main", ".mac"], [".phone", ".phone"]] as const).map(([a, b]) => ({
    from: cas?.querySelector<HTMLElement>(a), to: story.querySelector<HTMLElement>(`.scene ${b}`), x: 0, y: 0, s: 1, r: 0,
  }));
  const stage = story.querySelector<HTMLElement>(".story-stage");
  if (!cas || !stage || pairs.some((p) => !p.from || !p.to)) return () => {};
  for (const p of pairs) p.r = parseFloat(getComputedStyle(p.from!).rotate) || 0;

  // page-space boxes, from layout sizes so the cards' own transforms don't skew them.
  // The scene is read relative to the stage, which may be pinned (sticky) at this moment.
  const measure = () => {
    const c = cas.getBoundingClientRect(), st = story.getBoundingClientRect(), sg = stage.getBoundingClientRect();
    for (const p of pairs) {
      const f = p.from!, t = p.to!, sc = (t.offsetParent as HTMLElement).getBoundingClientRect();
      const fx = c.left + f.offsetLeft, fy = c.top + scrollY + f.offsetTop;
      const tx = sc.left + t.offsetLeft, ty = st.top + scrollY + (sc.top - sg.top) + t.offsetTop;
      p.s = t.offsetWidth / f.offsetWidth;
      p.x = tx + (p.s - 1) * f.offsetWidth / 2 - fx;
      p.y = ty + (p.s - 1) * f.offsetHeight / 2 - fy;
    }
  };
  const set = (k: number) => {
    cas.style.setProperty("--k", String(1 - k)); // pointer drift fades out on the way
    for (const p of pairs) {
      const f = p.from!;
      f.style.translate = `${p.x * k}px ${p.y * k}px`;
      f.style.scale = String(1 + (p.s - 1) * k);
      f.style.rotate = `${p.r * (1 - k)}deg`;
      // swap only once landed: the card sits exactly on the scene's device, so the swap can't be seen
      p.to!.style.opacity = k >= 1 ? "1" : "0";
      f.style.visibility = k >= 1 ? "hidden" : "";
    }
  };
  const st = ScrollTrigger.create({
    start: 0, end: () => story.getBoundingClientRect().top + scrollY,
    onRefresh: (self) => { measure(); set(self.progress); },
    onUpdate: (self) => set(self.progress),
  });
  measure(); set(st.progress);
  // the cards change size when their screenshots load or swap, so measure again then
  const ro = new ResizeObserver(() => { measure(); set(st.progress); });
  for (const p of pairs) { ro.observe(p.from!); ro.observe(p.to!); }
  return () => {
    st.kill(); ro.disconnect();
    cas.style.removeProperty("--k");
    for (const p of pairs) {
      for (const k of ["translate", "scale", "rotate", "visibility"] as const) p.from!.style[k] = "";
      p.to!.style.opacity = "";
    }
  };
}

/**
 * Link All's own chapter. On desktop the stage pins while scrolling plays a transfer from the
 * Mac to the phone: it drops at 48%, reconnects and resumes from there, the thing the app is built
 * around. On phones the same sequence plays once when it comes into view. The text box is live:
 * whatever you type on the "Mac" shows up on the phone as a clipboard notification.
 * The scene casts the visitor's own device when Link All supports it, and while the chapter is
 * on screen the rest of the page goes dark (the "house lights", see globals.css).
 */
export default function LinkAllStory() {
  const root = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState("");
  const [synced, setSynced] = useState("");
  const [sending, setSending] = useState(false);
  const [you, setYou] = useState<Visitor | null>(null);
  const sendText = useRef("Sending to OnePlus Nord 4");

  useEffect(() => {
    const v = detect();
    setYou(v);
    if (v) sendText.current = v.side === "phone" ? `Sending to ${v.name}` : `Sending from ${v.name}`;
  }, []);

  // debounce typing into a "sync", like copying on one device and seeing it land on the other
  useEffect(() => {
    if (!typed.trim()) { setSynced(""); setSending(false); return; }
    setSending(true);
    const t = setTimeout(() => { setSynced(typed.trim()); setSending(false); buzz(); }, 450);
    return () => clearTimeout(t);
  }, [typed]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(el);
    const bar = q(".xfer-bar i")[0] as HTMLElement;
    const pct = q(".xfer-pct")[0] as HTMLElement;
    const status = q(".xfer-status")[0] as HTMLElement;
    const scene = q(".scene")[0] as HTMLElement;

    // transfer progress and wording for a given point on the timeline (0 to 10)
    const show = (t: number) => {
      const p = t < 2 ? 0 : t < 5 ? ((t - 2) / 3) * DROP_AT : t < 6.6 ? DROP_AT : t < 9 ? DROP_AT + ((t - 6.6) / 2.4) * (100 - DROP_AT) : 100;
      const phase = t < 2 ? "ready" : t < 5 ? "sending" : t < 6 ? "dropped" : t < 6.6 ? "resuming" : t < 9 ? "sending" : "done";
      bar.style.transform = `scaleX(${p / 100})`;
      pct.textContent = `${Math.round(p)}%`;
      status.textContent = {
        ready: "Ready to send",
        sending: t > 6.6 ? `Resumed from ${DROP_AT}%` : sendText.current,
        dropped: `Connection dropped at ${DROP_AT}%`,
        resuming: "Reconnected. Picking up where it stopped",
        done: "Received. Nothing was sent twice.",
      }[phase];
      scene.dataset.phase = phase;
    };

    // flown: the hero's cards already brought the devices in, so the timeline skips their entrance
    const build = (flown = false) => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onUpdate: () => show(tl.time()) });
      if (!flown) {
        tl.from(q(".mac"), { xPercent: -14, opacity: 0, duration: 1.4 }, 0)
          .from(q(".phone"), { xPercent: 40, opacity: 0, duration: 1.4 }, 0.15);
      }
      tl.from(q(".link"), { opacity: 0, duration: 0.6 }, 1.2)
        .from(q(".xfer"), { y: 24, opacity: 0, duration: 0.6 }, 1.4)
        .from(q(".file"), { scale: 0.6, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 1.6)
        // there: halfway across, then it stalls while the link is down
        .to(q(".file"), { left: "60%", top: "36%", duration: 3, ease: "none" }, 2)
        .to(q(".file"), { x: -6, duration: 0.08, repeat: 5, yoyo: true, ease: "none" }, 5)
        .to(q(".file"), { left: "86%", top: "50%", duration: 2.4, ease: "none" }, 6.6)
        .to(q(".file"), { scale: 0.3, opacity: 0, duration: 0.5, ease: "power2.in" }, 9)
        .from(q(".rx"), { y: 16, opacity: 0, duration: 0.6, ease: "back.out(1.6)" }, 9.2)
        .to({}, { duration: 0.8 }, 9.8); // a beat at the end before the pin releases
      show(0);
      return tl;
    };

    // house lights: down while the chapter holds the screen, back up once it leaves
    const lights = ScrollTrigger.create({
      trigger: el, start: "top 45%", end: "bottom 55%",
      onToggle: (self) => document.documentElement.classList.toggle("lights", self.isActive),
    });

    const mm = gsap.matchMedia();
    mm.add({
      wide: "(min-width: 901px)",
      calm: "(prefers-reduced-motion: no-preference)",
    }, (ctx) => {
      const { wide, calm } = ctx.conditions as { wide: boolean; calm: boolean };
      const tl = build(wide && calm);
      if (!calm) { tl.progress(1); return; }
      if (wide) {
        ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8, animation: tl });
        return handoff(el);
      } else {
        tl.pause(0);
        ScrollTrigger.create({ trigger: q(".scene")[0], start: "top 70%", once: true, onEnter: () => { tl.timeScale(1.3).play(); } });
      }
    }, el);
    return () => { mm.revert(); lights.kill(); document.documentElement.classList.remove("lights"); };
  }, []);

  return (
    <section className="story" id="link-all" ref={root} aria-labelledby="la-h">
      <div className="house" aria-hidden="true" />
      <div className="story-stage">
        <div className="wrap story-grid">
          <div className="story-copy">
            <span className="chip">The one I&apos;m proudest of</span>
            <h2 id="la-h">Link All<span className="dot">.</span></h2>
            <p className="story-line">Copy on one device, paste on another. Files and clipboard across macOS, Windows, Android and Linux, over your own network, with no cloud and no account.</p>
            <ul className="story-points">
              <li>Transfers pick up where they stopped</li>
              <li>End-to-end encrypted, paired with a code</li>
              <li>One Rust core, a native app on every platform</li>
            </ul>
          </div>

          <div className="scene" data-phase="ready" aria-hidden="true">
            <div className="mac bezel lifted">
              <div className="core"><Shot file={you?.win ? "linkall-win-clipboard.png" : "linkall-mac-devices.png"} alt="" /></div>
            </div>
            <div className="phone bezel lifted">
              <div className="core">
                <Shot file="linkall-android-home.png" alt="" />
                <div className={`notif${synced ? " show" : ""}`}>
                  <small>From {you?.side === "mac" ? you.name : "Chinmay’s MacBook Air"}</small>
                  <p>{synced || " "}</p>
                  <span><Check weight="bold" /> Copied to clipboard</span>
                </div>
                <div className="rx"><Check weight="bold" /> Received 1.2 GB</div>
              </div>
            </div>
            <svg className="link" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M44 46 C 58 22, 74 24, 86 48" /></svg>
            <div className="file"><FileZip weight="light" /><span><b>Trip-photos-2026.zip</b><small>1.2 GB</small></span></div>
            {you && <span className={`you on-${you.side}`}>You, on {you.os}</span>}
            <div className="xfer">
              <div className="xfer-top"><span className="xfer-status">Ready to send</span><span className="xfer-pct">0%</span></div>
              <div className="xfer-bar"><i /></div>
              <WifiSlash className="xfer-drop" weight="bold" />
            </div>
          </div>

          <div className="story-try">
            <label htmlFor="la-try">{
              you?.side === "phone" ? "Try it. Type here and watch it land on your phone:"
                : you ? `Try it. Type on ${you.name}, watch the phone:`
                : "Try it. Type on the Mac, watch the phone:"}</label>
            <div className={`try-field${sending ? " busy" : synced ? " ok" : ""}`}>
              <input id="la-try" type="text" maxLength={80} autoComplete="off" placeholder="Copy something…" value={typed} onChange={(e) => setTyped(e.target.value)} />
              <span className="try-state" aria-live="polite">{sending ? "Sending…" : synced ? "On the phone" : ""}</span>
            </div>
            <div className="story-actions">
              <button className="pill dark" type="button" onClick={() => dispatchEvent(new CustomEvent("sheet:open", { detail: P.t }))}>Details <span className="isl"><ArrowUpRight weight="light" /></span></button>
              {P.site && <a className="pill light" href={P.site}>Website <span className="isl"><ArrowUpRight weight="light" /></span></a>}
              <a className="pill light" href={P.src}>GitHub <span className="isl"><GithubLogo weight="light" /></span></a>
            </div>
            <a className="story-more" href="https://github.com/ChinmayyK?tab=repositories">Other projects live on GitHub <ArrowUpRight weight="light" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
