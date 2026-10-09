"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, GithubLogo, X } from "@phosphor-icons/react";
import { PROJECTS, type Project } from "@/lib/content";
import { buzz } from "@/lib/buzz";
import Shot from "@/components/Shot";

/** Details sheet for a project. Anything on the page opens it with a "sheet:open" event naming the project. */
export default function ProjectSheet() {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Project | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const p = PROJECTS.find((x) => x.t === (e as CustomEvent<string>).detail);
      if (p) { buzz(); setOpen(p); }
    };
    addEventListener("sheet:open", onOpen);
    return () => removeEventListener("sheet:open", onOpen);
  }, []);

  useEffect(() => {
    if (open && dlg.current && !dlg.current.open) dlg.current.showModal();
  }, [open]);

  return (
    <dialog ref={dlg} aria-labelledby="s-title" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}>
      {open && (
        <div className="sheet bezel">
          <div className="core">
            <form method="dialog"><button className="x" aria-label="Close"><X weight="light" /></button></form>
            <span className="chip">{open.k}</span>
            <h3 id="s-title">{open.t}</h3>
            <p className="line">{open.lede}</p>
            {open.shots.length > 0 && (
              <div className="shots">{open.shots.map((s) => <Shot key={s} file={s} alt={`${open.t} screenshot`} loading="lazy" />)}</div>
            )}
            <div className="facts">
              <div><h4>How it works</h4><ul>{open.pts.map((x) => <li key={x}>{x}</li>)}</ul></div>
              <div>
                <h4>Built with</h4><p>{open.stack}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {open.site && <a className="pill dark" href={open.site}>Visit the site <span className="isl"><ArrowUpRight weight="light" /></span></a>}
                  <a className={`pill ${open.site ? "light" : "dark"}`} href={open.src}>View on GitHub <span className="isl"><GithubLogo weight="light" /></span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
