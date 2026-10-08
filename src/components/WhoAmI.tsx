"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

/** Typing "whoami" anywhere opens the only photo on the site. */
export default function WhoAmI() {
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest?.("input, textarea")) return;
      typed = (typed + e.key.toLowerCase()).slice(-6);
      if (typed === "whoami" && dlg.current && !dlg.current.open) { typed = ""; dlg.current.showModal(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <dialog ref={dlg} aria-label="Photo of Chinmay" onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}>
      <figure className="who bezel">
        <div className="core">
          <img src="/img/chinmay-photo.png" alt="Photo of Chinmay Kudalkar" />
          <figcaption>
            <strong>That&apos;s me.</strong>
            <form method="dialog">
              <button className="pill light" style={{ paddingLeft: 16 }}>Close <span className="isl"><X weight="light" /></span></button>
            </form>
          </figcaption>
        </div>
      </figure>
    </dialog>
  );
}
