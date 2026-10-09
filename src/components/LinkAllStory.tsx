"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, FileZip, GithubLogo, WifiSlash } from "@phosphor-icons/react";
import { PROJECTS } from "@/lib/content";
import Shot from "@/components/Shot";
import { buzz } from "@/lib/buzz";

const P = PROJECTS.find((p) => p.star)!;
const DROP_AT = 48; // percent where the demo connection drops

/**
 * Link All's own chapter. On desktop the stage pins while scrolling plays a transfer from the
 * Mac to the phone: it drops at 48%, reconnects and resumes from there, the thing the app is built
 * around. On phones the same sequence plays once when it comes into view. The text box is live:
 * whatever you type on the "Mac" shows up on the phone as a clipboard notification.
 */
export default function LinkAllStory() {
  const root = useRef<HTMLElement>(null);
  const [typed, setTyped] = useState("");
  const [synced, setSynced] = useState("");
  const [sending, setSending] = useState(false);

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
        sending: t > 6.6 ? `Resumed from ${DROP_AT}%` : "Sending to OnePlus Nord 4",
        dropped: `Connection dropped at ${DROP_AT}%`,
        resuming: "Reconnected. Picking up where it stopped",
        done: "Received. Nothing was sent twice.",
      }[phase];
      scene.dataset.phase = phase;
    };

    const build = () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, onUpdate: () => show(tl.time()) });
      tl.from(q(".mac"), { xPercent: -14, opacity: 0, duration: 1.4 }, 0)
        .from(q(".phone"), { xPercent: 40, opacity: 0, duration: 1.4 }, 0.15)
        .from(q(".link"), { opacity: 0, duration: 0.6 }, 1.2)
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

    const mm = gsap.matchMedia();
    mm.add({
      wide: "(min-width: 901px)",
      calm: "(prefers-reduced-motion: no-preference)",
    }, (ctx) => {
      const { wide, calm } = ctx.conditions as { wide: boolean; calm: boolean };
      const tl = build();
      if (!calm) { tl.progress(1); return; }
      if (wide) {
        ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8, animation: tl });
      } else {
        tl.pause(0);
        ScrollTrigger.create({ trigger: q(".scene")[0], start: "top 70%", once: true, onEnter: () => { tl.timeScale(1.3).play(); } });
      }
    }, el);
    return () => mm.revert();
  }, []);

  return (
    <section className="story" id="link-all" ref={root} aria-labelledby="la-h">
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
              <div className="core"><Shot file="linkall-mac-devices.png" alt="" /></div>
            </div>
            <div className="phone bezel lifted">
              <div className="core">
                <Shot file="linkall-android-home.png" alt="" />
                <div className={`notif${synced ? " show" : ""}`}>
                  <small>From Chinmay&apos;s MacBook Air</small>
                  <p>{synced || " "}</p>
                  <span><Check weight="bold" /> Copied to clipboard</span>
                </div>
                <div className="rx"><Check weight="bold" /> Received 1.2 GB</div>
              </div>
            </div>
            <svg className="link" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M44 46 C 58 22, 74 24, 86 48" /></svg>
            <div className="file"><FileZip weight="light" /><span><b>Trip-photos-2026.zip</b><small>1.2 GB</small></span></div>
            <div className="xfer">
              <div className="xfer-top"><span className="xfer-status">Ready to send</span><span className="xfer-pct">0%</span></div>
              <div className="xfer-bar"><i /></div>
              <WifiSlash className="xfer-drop" weight="bold" />
            </div>
          </div>

          <div className="story-try">
            <label htmlFor="la-try">Try it. Type on the Mac, watch the phone:</label>
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
