// Serves the static site, plus two JSON routes read from GitHub and cached at the edge:
//   /api/commits  the contribution calendar, read from GitHub's own calendar page
//   /api/repo     Link All's public numbers (stars, forks, releases…), read from the GitHub API
// Once a copy goes stale it's still served while a fresh one is fetched in the background,
// so GitHub being slow, down or rate-limiting never holds the page up.
// Set a GITHUB_TOKEN secret to lift the API's 60-requests-an-hour limit; no scopes are needed.

const USER = "ChinmayyK";
const REPO = "ChinmayyK/Link-All";
const HOUR = 60 * 60;
const KEEP = 30 * 24 * HOUR; // how long a stale copy can stand in

// path: [what to fetch, seconds before asking GitHub again]
const ROUTES = {
  "/api/commits": [calendar, 6 * HOUR],
  "/api/repo": [repo, HOUR],
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = ROUTES[url.pathname];
    if (route) return cached(url, env, ctx, ...route);
    return env.ASSETS.fetch(request);
  },
};

async function cached(url, env, ctx, load, maxAge) {
  const cache = caches.default;
  // the v2 in the keys retired copies cached before a partly failed /api/repo read counted as an error
  const fresh = new Request(`${url.origin}${url.pathname}?v2-fresh`);
  const stale = new Request(`${url.origin}${url.pathname}?v2-stale`);

  const hit = await cache.match(fresh);
  if (hit) return hit;

  // past its freshness: hand back the last good copy right away and refresh behind it
  const old = await cache.match(stale);
  if (old) {
    ctx.waitUntil(refresh(cache, fresh, stale, () => load(env), maxAge).catch(() => {}));
    return json(await old.text(), 300);
  }
  try {
    return json(await refresh(cache, fresh, stale, () => load(env), maxAge), maxAge);
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}

async function refresh(cache, fresh, stale, load, maxAge) {
  const body = JSON.stringify(await load());
  await Promise.all([cache.put(fresh, json(body, maxAge)), cache.put(stale, json(body, KEEP))]);
  return body;
}

async function calendar() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "User-Agent": "chinmaykudalkar.com" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const data = parse(await res.text());
  if (!data.contributions.length) throw new Error("empty calendar");
  return data;
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

// The shape is the Repo type in src/lib/repo.ts. Every call has to answer: a half-read repo
// (say, rate-limited part way) is an error, so it never replaces the last full copy.
async function repo(env) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "chinmaykudalkar.com" };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const get = (path) => fetch(`https://api.github.com/repos/${REPO}${path}`, { headers, signal: AbortSignal.timeout(8000) });

  const res = await Promise.all([get(""), get("/releases?per_page=100"), get("/languages"), get("/commits?per_page=1")]);
  const failed = res.find((x) => !x.ok);
  if (failed) throw new Error(`GitHub ${failed.status} on ${failed.url}`);
  const [r, rel, langs, commits] = res;
  const info = await r.json();
  const releases = (await rel.json()).filter((x) => !x.draft);
  const latest = releases.find((x) => !x.prerelease) ?? releases[0];
  const bytes = await langs.json();
  const sum = Object.values(bytes).reduce((s, n) => s + n, 0);
  // one commit per page, so the last page number is the commit count
  const last = commits.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
  return {
    stars: info.stargazers_count,
    forks: info.forks_count,
    commits: last ? Number(last) : (await commits.json()).length,
    releases: releases.length,
    downloads: releases.reduce((s, x) => s + x.assets.reduce((t, a) => t + a.download_count, 0), 0),
    latest: latest ? { tag: latest.tag_name, date: latest.published_at } : null,
    license: info.license?.spdx_id && info.license.spdx_id !== "NOASSERTION" ? info.license.spdx_id : null,
    pushed: info.pushed_at,
    langs: Object.entries(bytes).sort((a, b) => b[1] - a[1]).map(([l, n]) => [l, n / sum]),
  };
}

function json(body, maxAge) {
  return new Response(body, {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${maxAge}` },
  });
}
