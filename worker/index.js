// Serves the static site, plus /api/commits: the GitHub contribution calendar as JSON.
// It's read from GitHub's own calendar page and cached at the edge, so the graph doesn't
// depend on a third-party mirror. Once that copy goes stale it's still served while a fresh one
// is fetched in the background, so GitHub being slow or down never holds the graph up.

const USER = "ChinmayyK";
const FRESH = 6 * 60 * 60; // seconds before asking GitHub again
const KEEP = 30 * 24 * 60 * 60; // how long a stale copy can stand in

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/commits") return commits(url, ctx);
    return env.ASSETS.fetch(request);
  },
};

async function commits(url, ctx) {
  const cache = caches.default;
  const fresh = new Request(`${url.origin}/api/commits?fresh`);
  const stale = new Request(`${url.origin}/api/commits?stale`);

  const hit = await cache.match(fresh);
  if (hit) return hit;

  // past its freshness: hand back the last good copy right away and refresh behind it
  const old = await cache.match(stale);
  if (old) {
    ctx.waitUntil(refresh(cache, fresh, stale).catch(() => {}));
    return json(await old.text(), 300);
  }
  try {
    return json(await refresh(cache, fresh, stale), FRESH);
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}

async function refresh(cache, fresh, stale) {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "User-Agent": "chinmaykudalkar.com" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const data = parse(await res.text());
  if (!data.contributions.length) throw new Error("empty calendar");
  const body = JSON.stringify(data);
  await Promise.all([cache.put(fresh, json(body, FRESH)), cache.put(stale, json(body, KEEP))]);
  return body;
}

// Each day is a <td> with data-date and data-level; its count lives in the <tool-tip> pointing at its id.
function parse(html) {
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)/g)) {
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const contributions = [];
  for (const m of html.matchAll(/<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g)) {
    const td = m[0];
    const date = td.match(/data-date="([^"]+)"/)?.[1];
    const level = Number(td.match(/data-level="(\d)"/)?.[1] ?? 0);
    const id = td.match(/\bid="([^"]+)"/)?.[1];
    if (date) contributions.push({ date, count: counts.get(id) ?? 0, level });
  }
  // the page lists days row by row (all Sundays, then all Mondays…); the graph wants them in date order
  contributions.sort((a, b) => (a.date < b.date ? -1 : 1));
  const lastYear = contributions.reduce((s, d) => s + d.count, 0);
  return { total: { lastYear }, contributions };
}

function json(body, maxAge) {
  return new Response(body, {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${maxAge}` },
  });
}
