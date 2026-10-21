"use client";

import { useEffect, useRef, useState } from "react";

type Line = { at: string; tag: string; msg: string; tone?: "ok" | "bad" | "dim" } | { at: string; tag: string; bar: number; redo?: boolean };

// One transfer and a little clipboard traffic, as the Rust core would log it: pairing, the key exchange,
// a dropped connection that resumes where it stopped, and the secret filter holding back what it should.
type Step = { tag: string; msg: string; tone?: "ok" | "bad" | "dim"; wait: number } | { tag: string; bar: [from: number, to: number]; wait: number };
const SCRIPT: Step[] = [
  { tag: "pair", msg: "MacBook Pro ↔ Galaxy S25 Ultra, code 4719 matched on both", wait: 700 },
  { tag: "key", msg: "X25519 exchange done, ChaCha20-Poly1305 session open", tone: "dim", wait: 600 },
  { tag: "send", msg: "report.pdf, 42.8 MB in 36 chunks", wait: 300 },
  { tag: "chunk", bar: [0, 17], wait: 70 },
  { tag: "drop", msg: "connection lost at chunk 18 (Wi-Fi roamed)", tone: "bad", wait: 1100 },
  { tag: "resume", msg: "17 chunks already acknowledged, sending from 18", wait: 400 },
  { tag: "chunk", bar: [17, 36], wait: 70 },
  { tag: "done", msg: "report.pdf, 36/36, nothing went through a server", tone: "ok", wait: 1000 },
  { tag: "clip", msg: "“meeting moved to 4:30” → 3 devices", wait: 700 },
  { tag: "clip", msg: "“Your OTP is ██████” kept here: secret filter", tone: "bad", wait: 700 },
  { tag: "clip", msg: "“git push --force-with-lease” → 3 devices", wait: 700 },
  { tag: "clip", msg: "“4111 ████ ████ ████” kept here: secret filter", tone: "bad", wait: 3200 },
];
const CHUNKS = 36;

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const stamp = () => { const d = new Date(); return `${clock.format(d)}.${String(d.getMilliseconds()).padStart(3, "0")}`; };

// Plays the script line by line, then clears and plays it again. Reduced motion shows it all at once, still.
export default function CoreLog() {
  const [lines, setLines] = useState<Line[]>([]);
  const [clearing, setClearing] = useState(false);
  const body = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLines(SCRIPT.map((s) => ("bar" in s ? { at: stamp(), tag: s.tag, bar: s.bar[1], redo: s.bar[0] > 0 } : { at: stamp(), tag: s.tag, msg: s.msg, tone: s.tone })));
      return;
    }
    let alive = true, t = 0;
    const sleep = (ms: number) => new Promise<void>((ok) => { t = window.setTimeout(ok, ms); });
    const run = async () => {
      await sleep(1300); // once the figure has come in
      while (alive) {
        for (const s of SCRIPT) {
          if (!alive) return;
          if ("bar" in s) {
            const [from, to] = s.bar;
            // a run that picks up after the drop starts full to where it stopped, and marks the chunk that went again
            setLines((l) => [...l, { at: stamp(), tag: s.tag, bar: from, redo: from > 0 }]);
            for (let k = from + 1; k <= to && alive; k++) {
              await sleep(s.wait);
              setLines((l) => l.map((x, i) => (i === l.length - 1 ? { ...x, bar: k } : x)));
            }
            await sleep(300);
          } else {
            setLines((l) => [...l, { at: stamp(), tag: s.tag, msg: s.msg, tone: s.tone }]);
            await sleep(s.wait);
          }
        }
        if (!alive) return;
        setClearing(true);
        await sleep(600);
        setLines([]);
        setClearing(false);
        await sleep(500);
      }
    };
    run();
    return () => { alive = false; clearTimeout(t); };
  }, []);

  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [lines]);

  return (
    <figure className="corelog fig-in" aria-label="A log from Link All's Rust core: two devices pair, exchange keys, send a file that resumes after the connection drops, and sync clipboard text while the secret filter keeps a one-time code and a card number back.">
      <div className="term" aria-hidden="true">
        <p className="term-head"><span className="lights"><i /><i /><i /></span><b>link-all-core</b><small>the same engine on macOS, Windows, Android, Linux</small></p>
        <ol className={clearing ? "clearing" : ""} ref={body}>
          {lines.map((l, i) => (
            <li key={i} className={"tone" in l && l.tone ? l.tone : ""}>
              <time>{l.at}</time>
              <b>{l.tag}</b>
              {"bar" in l ? (
                <span className="bar">
                  {Array.from({ length: CHUNKS }, (_, k) => <i key={k} className={k < l.bar ? (l.redo && k === 17 ? "ok redo" : "ok") : ""} />)}
                  <small>{l.bar}/{CHUNKS}</small>
                </span>
              ) : <span>{l.msg}</span>}
            </li>
          ))}
          <li className="cursor"><i /></li>
        </ol>
      </div>
      <figcaption>Fig. 01 — Link All, from the core&rsquo;s side</figcaption>
    </figure>
  );
}
