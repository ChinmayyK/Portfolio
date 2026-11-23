import DATA from "@/content/days.json";

/**
 * The hero's name, set in my GitHub contributions: one dot for each, in the order I made them,
 * reading through the letters (scripts/days.mjs keeps the snapshot). The more I build, the finer
 * the grid gets. Older work is lighter, the most recent day I pushed is lime.
 */
const DAY = 86_400_000;
const START = Date.parse(DATA.start);
const DAYS = DATA.days;
export const SINCE = new Date(START).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** the day each contribution was made on, oldest first */
const UNITS = DAYS.flatMap((c, day) => Array<number>(c).fill(day));
const LATEST = UNITS[UNITS.length - 1];
export const UNTIL = new Date(START + LATEST * DAY).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const describeDay = (day: number) => {
  const d = new Date(START + day * DAY).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const c = DAYS[day];
  return `${d} · ${c} contribution${c === 1 ? "" : "s"}`;
};

export type Field = {
  pitch: number; ox: number; oy: number;
  cells: { x: number; y: number }[];
  /** the day behind each dot; a dot stands for `per` contributions when the screen is too small for one each */
  dayOf: number[];
  per: number;
  index: Map<string, number>;
};

// cells sit on a hex grid: rows are closer than columns and every other row shifts by half a cell
const ROW = Math.sqrt(3) / 2;
const MIN_PITCH = 3.4;
const centre = (p: number, ox: number, oy: number, col: number, row: number) => ({ x: ox + (col + 0.5 + (row % 2) * 0.5) * p, y: oy + (row + 0.5) * p * ROW });

/**
 * Measure the real name (each character's box, transforms set aside) and find the largest grid
 * whose cells inside the letters still hold every contribution.
 */
export function layout(name: HTMLElement, host: HTMLElement): Field | null {
  const lines = Array.from(name.querySelectorAll<HTMLElement>(".hero-rise"));
  const moved = [...lines, ...lines.map((l) => l.parentElement!)];
  const saved = moved.map((m) => m.style.transform);
  moved.forEach((m) => { m.style.transform = "none"; });
  const h = host.getBoundingClientRect();
  const glyphs = lines.map((line) => {
    const text = line.firstChild as Text;
    const range = document.createRange();
    return Array.from(text.data, (ch, i) => {
      range.setStart(text, i); range.setEnd(text, i + 1);
      const r = range.getBoundingClientRect();
      return { ch, x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
    });
  });
  moved.forEach((m, i) => { m.style.transform = saved[i]; });

  const all = glyphs.flat();
  if (!all.length || all[0].w === 0 || !UNITS.length) return null;
  const left = Math.min(...all.map((g) => g.x)), top = Math.min(...all.map((g) => g.y));
  const W = Math.ceil(Math.max(...all.map((g) => g.x + g.w)) - left), H = Math.ceil(Math.max(...all.map((g) => g.y + g.h)) - top);

  // draw each line alone so cells keep reading order even where a descender dips into the next line;
  // keep only a yes/no ink map per line, and the band of rows and columns each line covers
  const cs = getComputedStyle(lines[0]);
  const masks = glyphs.map((line) => {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.textBaseline = "alphabetic";
    const ascent = ctx.measureText("H").fontBoundingBoxAscent;
    line.forEach((g) => ctx.fillText(g.ch, g.x - left, g.y - top + ascent));
    const rgba = ctx.getImageData(0, 0, W, H).data;
    const on = new Uint8Array(W * H);
    for (let i = 0; i < on.length; i++) on[i] = rgba[i * 4 + 3] > 127 ? 1 : 0;
    const x0 = Math.min(...line.map((g) => g.x)) - left, x1 = Math.max(...line.map((g) => g.x + g.w)) - left;
    const y0 = Math.min(...line.map((g) => g.y)) - top, y1 = Math.max(...line.map((g) => g.y + g.h)) - top;
    return { on, x0, x1, y0: Math.max(0, y0 - H * 0.1), y1: Math.min(H, y1 + H * 0.1) };
  });

  // visit every cell inside the letters, in order: line by line, column by column, top to bottom
  const visit = (p: number, each: (col: number, row: number) => void) => {
    const ox = (W % p) / 2 - p / 4, oy = (H % (p * ROW)) / 2;
    const cols = Math.ceil(W / p) + 1, rows = Math.ceil(H / (p * ROW)) + 1;
    const seen = new Uint8Array(cols * rows);
    for (const m of masks) {
      const r0 = Math.max(0, Math.floor((m.y0 - oy) / (p * ROW))), r1 = Math.min(rows - 1, Math.ceil((m.y1 - oy) / (p * ROW)));
      const c0 = Math.max(0, Math.floor((m.x0 - ox) / p) - 1), c1 = Math.min(cols - 1, Math.ceil((m.x1 - ox) / p));
      for (let col = c0; col <= c1; col++)
        for (let row = r0; row <= r1; row++) {
          const x = Math.round(ox + (col + 0.5 + (row % 2) * 0.5) * p), y = Math.round(oy + (row + 0.5) * p * ROW);
          if (x < 0 || y < 0 || x >= W || y >= H || !m.on[y * W + x] || seen[col * rows + row]) continue;
          seen[col * rows + row] = 1;
          each(col, row);
        }
    }
    return { ox, oy };
  };
  const count = (p: number) => { let n = 0; visit(p, () => n++); return n; };

  // one dot per contribution if the letters can hold them; on small screens, one dot per few
  const per = Math.max(1, Math.ceil(UNITS.length / count(MIN_PITCH)));
  const need = Math.ceil(UNITS.length / per);
  // the count only roughly falls as the pitch grows: halve the range first, then, since it jumps
  // as the grid slides over the letters, take the nearby fit that leaves the fewest cells spare
  let lo = MIN_PITCH, hi = Math.max(8, H / 8);
  while (hi - lo > 0.05) { const mid = (lo + hi) / 2; if (count(mid) >= need) lo = mid; else hi = mid; }
  let p = lo, spare = count(lo) - need;
  for (let q = lo + 0.15; q >= Math.max(MIN_PITCH, lo - 0.15); q -= 0.01) {
    const n = count(q) - need;
    if (n >= 0 && n < spare) { spare = n; p = q; }
  }
  const order: { col: number; row: number }[] = [];
  const s = { p, ...visit(p, (col, row) => order.push({ col, row })) };

  const index = new Map<string, number>();
  const cells = order.map((c, i) => {
    index.set(`${c.col},${c.row}`, i);
    return centre(s.p, left + s.ox, top + s.oy, c.col, c.row);
  });
  const dayOf = Array.from({ length: Math.ceil(UNITS.length / per) }, (_, j) => UNITS[j * per]);
  return { pitch: s.p, ox: left + s.ox, oy: top + s.oy, cells, dayOf, per, index };
}

/** the day under a point in host coordinates, or -1 */
export function hit(f: Field, x: number, y: number) {
  const row = Math.floor((y - f.oy) / (f.pitch * ROW));
  const i = f.index.get(`${Math.floor((x - f.ox) / f.pitch - (row % 2) * 0.5)},${row}`);
  return i !== undefined && i < f.dayOf.length ? f.dayOf[i] : -1;
}

/** the last dot: where the name is up to */
export const latestCell = (f: Field) => f.cells[f.dayOf.length - 1];

const LIME = "#d4f25a";
const ink = (a: number) => `rgb(20 20 19 / ${a.toFixed(3)})`;

/** progress counts dots revealed so far; each grows in over the last few hundred */
export function draw(ctx: CanvasRenderingContext2D, f: Field, progress: number, xray: boolean, hover = -1) {
  const { pitch: p, cells, dayOf } = f;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const r = p * 0.36, soft = Math.max(60, dayOf.length / 25);
  // batch by fill so thousands of dots stay cheap
  const groups = new Map<string, { x: number; y: number; r: number }[]>();
  const add = (fill: string, x: number, y: number, rr: number) => {
    if (!groups.has(fill)) groups.set(fill, []);
    groups.get(fill)!.push({ x, y, r: rr });
  };
  let end: { x: number; y: number; a: number } | null = null;
  for (let i = 0; i < cells.length; i++) {
    const { x, y } = cells[i];
    if (i >= dayOf.length) { // cells left over at the end of the name: work still to come
      if (progress >= dayOf.length) add(xray ? ink(0.35) : ink(0.12), x, y, r * 0.55);
      continue;
    }
    const a = Math.min(1, Math.max(0, (progress - i) / soft));
    if (!a) continue;
    const day = dayOf[i];
    if (xray) add(day === hover ? ink(1) : ink(0.28), x, y, (day === hover ? r * 1.15 : r * 0.5) * a);
    else if (i === dayOf.length - 1) end = { x, y, a };
    else add(ink(0.3 + 0.7 * Math.pow(day / LATEST, 1.4)), x, y, r * a); // older work lighter
  }
  for (const [fill, dots] of groups) {
    ctx.beginPath();
    for (const d of dots) { ctx.moveTo(d.x + d.r, d.y); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); }
    ctx.fillStyle = fill; ctx.fill();
  }
  if (end) { // the newest dot, drawn large: the name is written up to here
    ctx.beginPath(); ctx.arc(end.x, end.y, Math.max(4.5, p * 0.95) * end.a, 0, Math.PI * 2);
    ctx.fillStyle = LIME; ctx.fill(); ctx.lineWidth = 1.25; ctx.strokeStyle = ink(1); ctx.stroke();
  }
}

/** size a canvas to its box at device resolution; returns its context in CSS pixels */
export function fit(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
