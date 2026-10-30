type Run = { anims: Animation[]; done: () => void };

export function land(board: HTMLElement) {
  if (board.classList.contains("landed")) return; // once: React runs effects twice in development
  const tiles = [...board.querySelectorAll<HTMLElement>(":scope > .tile")];
  board.classList.add("landed");
  if (!tiles.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const run = trace(board, tiles);
  // any click, key or scroll skips to the finished board
  const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
  const done = () => { run.done(); events.forEach((e) => removeEventListener(e, skip)); };
  const skip = () => { run.anims.forEach((a) => a.finish()); done(); };
  events.forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  Promise.all(run.anims.map((a) => a.finished)).then(done, done);
}

// The landing: the board starts dark. A line of orange light runs round the name's edge, then spreads out to the
// other tiles like current through a circuit. Each tile flickers on once its edge is drawn, and the year of
// GitHub squares switches on after its tile.

const DRAW = 640; // a line running round one tile
const WAVE = 0.4; // ms of delay per pixel from the name
const NS = "http://www.w3.org/2000/svg";

function trace(board: HTMLElement, tiles: HTMLElement[]): Run {
  const b = board.getBoundingClientRect();
  const lead = board.querySelector<HTMLElement>(":scope > .t-id") ?? tiles[0];
  const l = lead.getBoundingClientRect(), lx = l.left + l.width / 2, ly = l.top + l.height / 2;
  const radius = parseFloat(getComputedStyle(lead).borderTopLeftRadius) || 24;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", `${b.width}`);
  svg.setAttribute("height", `${b.height}`);
  Object.assign(svg.style, { position: "absolute", left: "0", top: "0", zIndex: "5", pointerEvents: "none", overflow: "visible" });
  board.append(svg);

  const when = new Map<HTMLElement, number>();
  const anims = tiles.flatMap((t) => {
    const r = t.getBoundingClientRect();
    const delay = t === lead ? 0 : 280 + Math.min(900, Math.hypot(r.left + r.width / 2 - lx, r.top + r.height / 2 - ly) * WAVE);
    const on = delay + DRAW * 0.8;
    when.set(t, on);

    const line = document.createElementNS(NS, "path");
    line.setAttribute("d", outline(r.left - b.left + 0.5, r.top - b.top + 0.5, r.width - 1, r.height - 1, radius));
    line.setAttribute("pathLength", "1");
    Object.assign(line.style, {
      fill: "none", stroke: "var(--accent)", strokeWidth: "1.5", strokeDasharray: "1", strokeDashoffset: "1",
      filter: "drop-shadow(0 0 6px var(--accent))",
    });
    svg.append(line);

    const lit = getComputedStyle(t).borderColor;
    return [
      line.animate(
        [{ strokeDashoffset: 1, opacity: 1 }, { offset: 0.7, strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: 0, opacity: 0 }],
        { duration: DRAW / 0.7, delay, easing: "cubic-bezier(.65,0,.35,1)", fill: "both" },
      ),
      // it flickers on like a tube light, then the edge cools
      t.animate(
        [
          { opacity: 0, borderColor: "var(--accent)", boxShadow: "0 0 36px -8px var(--accent)" },
          { offset: 0.12, opacity: 0.8 },
          { offset: 0.2, opacity: 0.25 },
          { offset: 0.34, opacity: 1, borderColor: "var(--accent)", boxShadow: "0 0 36px -8px var(--accent)" },
          { opacity: 1, borderColor: lit, boxShadow: "0 0 0 0 transparent" },
        ],
        { duration: 900, delay: on, easing: "ease-out", fill: "backwards" },
      ),
    ];
  });

  // the year of squares switches on week by week once its tile is lit
  const cells = [...board.querySelectorAll<HTMLElement>(".hm i:not(.pad)")];
  const start = (cells[0] && when.get(cells[0].closest<HTMLElement>(".tile")!)) ?? 0;
  const squares = cells.map((c, k) => c.animate(
    [{ opacity: 0.08, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 360, delay: start + 200 + Math.floor(k / 7) * 12 + (k % 7) * 5, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" },
  ));

  return { anims: [...anims, ...squares], done: () => svg.remove() };
}

/** A rounded rectangle drawn clockwise from the top left, the way a tile's border runs. */
function outline(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`
    + `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}
