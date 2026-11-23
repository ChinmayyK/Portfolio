// Turns the glyphs of my name in Host Grotesk into three.js's typeface JSON, so the hero can
// extrude them in 3D without shipping a font parser. Run with `npm run name-font` after changing
// the font or the name. Host Grotesk is under the SIL Open Font License (src/assets/fonts/OFL.txt).
import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const TEXT = "Chinmay Kudalkar";
const buf = readFileSync(new URL("../src/assets/fonts/HostGrotesk-Regular.ttf", import.meta.url));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const r = (n) => Math.round(n);

const glyphs = {};
for (const ch of new Set(TEXT)) {
  const g = font.charToGlyph(ch);
  const o = g.path.commands.map((c) => {
    switch (c.type) {
      case "M": return `m ${r(c.x)} ${r(c.y)}`;
      case "L": return `l ${r(c.x)} ${r(c.y)}`;
      case "Q": return `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)}`;
      case "C": return `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)}`;
      default: return "z";
    }
  }).join(" ");
  // glyph.path is in font units, y-up, which is what the typeface format wants
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(g.xMin ?? 0), x_max: r(g.xMax ?? 0), o };
}

writeFileSync(new URL("../public/fonts/name.json", import.meta.url), JSON.stringify({
  glyphs,
  familyName: font.names.fontFamily?.en ?? "Host Grotesk",
  ascender: font.ascender, descender: font.descender,
  underlinePosition: font.tables.post.underlinePosition, underlineThickness: font.tables.post.underlineThickness,
  boundingBox: { xMin: font.tables.head.xMin, yMin: font.tables.head.yMin, xMax: font.tables.head.xMax, yMax: font.tables.head.yMax },
  resolution: font.unitsPerEm,
  original_font_information: { copyright: font.names.copyright?.en ?? "", licence: "SIL Open Font License 1.1" },
}));
console.log(`wrote ${Object.keys(glyphs).length} glyphs`);
