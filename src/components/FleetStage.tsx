"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Car } from "@phosphor-icons/react";
import { Stage } from "@/kit/stage";
import type { Act } from "@/kit/act";
import { Bar } from "@/kit/window";
import { Collapse } from "@/kit/motion/Collapse";
import { Avatar } from "@/kit/parts/Avatar";
import { Spinner } from "@/kit/parts/Spinner";
import { Badge } from "@/kit/controls/Badge";
import { useSiteTheme } from "@/components/useSiteTheme";
import "./fleet-stage.css";

// FleetDesk is internal, so there are no screenshots to show. Instead a faux
// slice of its admin bookings list plays in the tile's top-right corner:
// a booking drops in Pending, a driver is assigned and the pill turns to
// Assigned on itself. After a hold the row closes the way it opened, and
// resets while closed.
//
// Real strings: the new route, its car and driver, its status and time, and
// the finished row below it. The rest is placeholder.

type S = { open: boolean; assigned: boolean };

const initial: S = { open: false, assigned: false };

async function script(a: Act<S>) {
  await a.wait(900);
  a.put({ open: true });
  await a.wait(1500);
  a.put({ assigned: true });
  await a.wait(2400);
  // the booking leaves in one motion; its status goes back while hidden
  a.put({ open: false });
  await a.wait(700);
  await a.snap({ assigned: false });
}

export default function FleetStage() {
  const theme = useSiteTheme();
  return (
    <Stage<S>
        width={340} height={150}
        compact={{ below: 340, width: 280, height: 150 }}
        theme={theme} accent="#FF5A1F"
        initial={initial} poster={{ open: true, assigned: true }} script={script}
        className="fd"
      >
        {(s) => (
          <div className="fd-panel ss-fade-b">
            <div className="fd-head">
              <div className="fd-title">Bookings</div>
              <Bar w={44} h={6} tone={2} />
            </div>
            <div className="fd-list">
              <Collapse open={s.open} reveal="drop">
                <div className="fd-row" data-lead>
                  <span className="fd-lines">
                    <span className="fd-route">Pune → Chakan</span>
                    <span className="fd-meta">
                      <span className="fd-driver" data-on={s.assigned || undefined}>
                        <span><Avatar name="Rahul" size={14} />Rahul</span>
                      </span>
                      <span className="fd-car"><Car weight="fill" />Innova</span>
                    </span>
                  </span>
                  <Badge tone={s.assigned ? "accent" : "neutral"} className="fd-badge" icon={<Mark on={s.assigned} />}>
                    <Label on={s.assigned} />
                  </Badge>
                  <span className="fd-time">9:30</span>
                </div>
              </Collapse>
              <div className="fd-row">
                <span className="fd-lines">
                  <span className="fd-route">Baner → Airport</span>
                  <span className="fd-meta"><span className="fd-car"><Car weight="fill" />Swift</span></span>
                </span>
                <Badge tone="neutral" className="fd-badge fd-badge--old">Done</Badge>
                <span className="fd-time">8:15</span>
              </div>
              {[132, 108].map((w) => (
                <div key={w} className="fd-row">
                  <span className="fd-lines">
                    <Bar w={w} h={7} r={3.5} tone={2} />
                    <Bar w={64} h={6} r={3} tone={1} />
                  </span>
                  <Bar w={44} h={16} r={8} tone={1} />
                  <Bar w={26} h={6} r={3} tone={1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Stage>
  );
}

// spinner and dot share one cell and crossfade, so the word never moves
function Mark({ on }: { on: boolean }) {
  return (
    <span className="fd-mark" data-on={on || undefined}>
      <Spinner size={8} />
      <i className="fd-dot" />
    </span>
  );
}

// one pill, two words: the cell eases to the width of the word showing,
// the old word fading before the edge reaches it
function Label({ on }: { on: boolean }) {
  const words = useRef<HTMLSpanElement[]>([]);
  const [w, setW] = useState<number[]>([]);
  useLayoutEffect(() => setW(words.current.map((e) => e.offsetWidth)), []);
  const i = on ? 1 : 0;
  return (
    <span className="fd-label" style={w.length ? { width: w[i] } : undefined}>
      {["Pending", "Assigned"].map((t, k) => (
        <span key={t} ref={(e) => { if (e) words.current[k] = e; }} className="fd-word" data-on={k === i || undefined}>{t}</span>
      ))}
    </span>
  );
}
