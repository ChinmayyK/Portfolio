/**
 * Long shadows for the hero's type. The letters are treated as blocks standing on the page, seen
 * from above, with north at the top of the screen: a light at bearing θ and altitude α throws each
 * letter's shadow away from θ, h / tan α long. The shadow is the letter swept along that line,
 * built by doubling (union with itself shifted 1, 2, 4… px), so even a full-width shadow is a
 * dozen draws.
 */

export type Glyphs = { mask: HTMLCanvasElement; box: { left: number; top: number; right: number; bottom: number }; size: number };

/** draw every character inside `els` into one mask, in the host's coordinates, transforms set aside */
export function measure(els: HTMLElement[], host: HTMLElement): Glyphs | null {
  const moved = els.flatMap((el) => [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))]);
  const saved = moved.map((m) => m.style.transform);
  moved.forEach((m) => { m.style.transform = "none"; });
  const h = host.getBoundingClientRect();
  const W = Math.ceil(h.width), H = Math.ceil(h.height);
  const mask = document.createElement("canvas");
  mask.width = W; mask.height = H;
  const ctx = mask.getContext("2d")!;
  const box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
  let size = 0;
  const range = document.createRange();
  for (const el of els) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
      const cs = getComputedStyle(n.parentElement!);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ascent = ctx.measureText("H").fontBoundingBoxAscent;
      size = Math.max(size, parseFloat(cs.fontSize));
      for (let i = 0; i < n.data.length; i++) {
        const ch = n.data[i];
        if (!ch.trim()) continue;
        range.setStart(n, i); range.setEnd(n, i + 1);
        const r = range.getBoundingClientRect();
        const x = r.left - h.left, y = r.top - h.top;
        ctx.fillText(ch, x, y + ascent);
        box.left = Math.min(box.left, x); box.right = Math.max(box.right, x + r.width);
        box.top = Math.min(box.top, y); box.bottom = Math.max(box.bottom, y + r.height);
      }
    }
  }
  moved.forEach((m, i) => { m.style.transform = saved[i]; });
  return Number.isFinite(box.left) ? { mask, box, size } : null;
}

const scratch = () => document.createElement("canvas");
let A: HTMLCanvasElement | null = null, B: HTMLCanvasElement | null = null;

/**
 * The shadow as an opaque mask (alpha only), faded along its length.
 * dir is a unit vector on screen pointing away from the light.
 */
export function cast(g: Glyphs, dir: { x: number; y: number }, length: number) {
  A ??= scratch(); B ??= scratch();
  const { width: W, height: H } = g.mask;
  for (const c of [A, B]) { if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } }
  const a = A.getContext("2d")!, b = B.getContext("2d")!;
  a.globalCompositeOperation = "source-over";
  a.clearRect(0, 0, W, H);
  a.drawImage(g.mask, 0, 0);
  for (let covered = 1; covered < length; ) {
    const step = Math.min(covered, length - covered);
    b.clearRect(0, 0, W, H);
    b.drawImage(A, 0, 0);
    a.drawImage(B, dir.x * step, dir.y * step);
    covered += step;
  }
  // fade with distance from the type: strong at the foot of the letters, gone at the tip
  const corners = [[g.box.left, g.box.top], [g.box.right, g.box.top], [g.box.left, g.box.bottom], [g.box.right, g.box.bottom]];
  const along = corners.map(([x, y]) => x * dir.x + y * dir.y);
  const from = Math.min(...along), to = Math.max(...along) + length;
  const cx = (g.box.left + g.box.right) / 2, cy = (g.box.top + g.box.bottom) / 2;
  const base = cx * dir.x + cy * dir.y;
  const grad = a.createLinearGradient(cx + dir.x * (from - base), cy + dir.y * (from - base), cx + dir.x * (to - base), cy + dir.y * (to - base));
  grad.addColorStop(0, "rgb(0 0 0 / 1)");
  grad.addColorStop(0.55, "rgb(0 0 0 / .55)");
  grad.addColorStop(1, "rgb(0 0 0 / 0)");
  a.globalCompositeOperation = "destination-in";
  a.fillStyle = grad;
  a.fillRect(0, 0, W, H);
  a.globalCompositeOperation = "source-over";
  return A;
}

/** paint the shadow mask into a visible canvas in one colour, or as a hatch for the x-ray layer */
export function paint(target: HTMLCanvasElement, shadow: HTMLCanvasElement, fill: string | "hatch") {
  if (target.width !== shadow.width || target.height !== shadow.height) { target.width = shadow.width; target.height = shadow.height; }
  const t = target.getContext("2d")!;
  t.globalCompositeOperation = "source-over";
  t.clearRect(0, 0, target.width, target.height);
  t.drawImage(shadow, 0, 0);
  t.globalCompositeOperation = "source-in";
  if (fill === "hatch") {
    const tile = scratch(); tile.width = tile.height = 9;
    const p = tile.getContext("2d")!;
    p.strokeStyle = "rgb(20 20 19 / .55)"; p.lineWidth = 1;
    p.beginPath(); p.moveTo(0, 9); p.lineTo(9, 0); p.stroke();
    t.fillStyle = t.createPattern(tile, "repeat")!;
  } else t.fillStyle = fill;
  t.fillRect(0, 0, target.width, target.height);
  t.globalCompositeOperation = "source-over";
}
