"use client";

import { useEffect, useState } from "react";

// What gets copied on the Mac, in order. The secret filter keeps the marked ones on the device they were copied on.
const CLIPS: { t: string; secret?: string }[] = [
  { t: "meeting moved to 4:30" },
  { t: "Your OTP is 482913", secret: "OTP" },
  { t: "git push --force-with-lease" },
  { t: "4111 1111 1111 1111", secret: "card" },
  { t: "see you at the station" },
  { t: "pass: tr0ub4dor&3", secret: "password" },
  { t: "linkall.chinmaykudalkar.com" },
];

type Item = { id: number; t: string; secret?: string };
type Flight = { id: number; t: string };

const KEEP = 4; // rows each device shows
const BEAT = 2600; // ms between copies

// stands in for the ciphertext: the same text always scrambles the same way
const cipher = (t: string, len = 11) =>
  [...t].slice(0, len).map((c, i) => (((c.charCodeAt(0) * 2654435761) ^ (i * 40503)) >>> 0).toString(16).slice(-2)).join(" ");

// Link All's clipboard, running: each copy on the Mac either goes over the encrypted wire to the phone
// or is stopped by the secret filter and stays where it was copied. Reduced motion shows it mid-run, still.
export default function Relay() {
  const [mac, setMac] = useState<Item[]>([]);
  const [phone, setPhone] = useState<Item[]>([]);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [gate, setGate] = useState<"" | "open" | "shut">("");
  const [tally, setTally] = useState({ sync: 0, kept: 0 });

  useEffect(() => {
    const items = CLIPS.map((c, i) => ({ id: i, ...c }));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const shown = items.slice(0, KEEP).reverse();
      setMac(shown);
      setPhone(shown.filter((c) => !c.secret));
      setTally({ sync: shown.filter((c) => !c.secret).length, kept: shown.filter((c) => c.secret).length });
      return;
    }
    const timers: number[] = [];
    const later = (ms: number, f: () => void) => timers.push(window.setTimeout(f, ms));
    let n = 0;
    const beat = () => {
      const c = items[n % items.length], item = { ...c, id: n++ };
      setMac((m) => [item, ...m].slice(0, KEEP));
      later(520, () => {
        if (item.secret) {
          setGate("shut");
          setTally((s) => ({ ...s, kept: s.kept + 1 }));
        } else {
          setGate("open");
          setFlight(item);
          later(1150, () => {
            setFlight(null);
            setPhone((p) => [item, ...p].slice(0, KEEP));
            setTally((s) => ({ ...s, sync: s.sync + 1 }));
          });
        }
        later(900, () => setGate(""));
      });
      later(BEAT, beat);
    };
    later(1400, beat); // once the figure has come in
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <figure className="relay fig-in" aria-label="Link All's clipboard running: text copied on a Mac crosses an encrypted connection to a phone, while one-time codes, card numbers and passwords are kept back by the secret filter.">
      <div className="relay-row" aria-hidden="true">
        <div className="dev mac">
          <p className="dev-head"><span className="lights"><i /><i /><i /></span><b>MacBook Pro</b><small>01 copied</small></p>
          <ul>
            {mac.map((c) => (
              <li key={c.id} className={c.secret ? "held" : ""}>
                <span>{c.t}</span>
                {c.secret && <em>kept · {c.secret}</em>}
              </li>
            ))}
          </ul>
        </div>

        <div className={`wire ${gate}`}>
          <span className="gate" />
          <span className="track" />
          <small className="gate-tag">02 filter</small>
          {flight && <code className="packet" key={flight.id}>{cipher(flight.t, 4)}</code>}
          <small className="wire-tag">03 encrypted</small>
        </div>

        <div className="dev phone">
          <p className="dev-head"><span className="notch" /><b>Galaxy S25 Ultra</b><small>04 pasted</small></p>
          <ul>
            {phone.map((c) => (
              <li key={c.id} className="landed">
                <span className="plain">{c.t}</span>
                <span className="ciph">{cipher(c.t)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="relay-tally" aria-hidden="true">
        <span><b>{tally.sync}</b> synced</span>
        <span><b>{tally.kept}</b> kept by the filter</span>
        <span><b>0</b> through a server</span>
      </p>
      <figcaption>Fig. 01 — Link All&rsquo;s clipboard, running</figcaption>
    </figure>
  );
}
