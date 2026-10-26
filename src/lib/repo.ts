export type Repo = {
  stars: number;
  forks: number;
  /** null when GitHub wouldn't say */
  commits: number | null;
  releases: number;
  downloads: number;
  latest: { tag: string; date: string } | null;
  license: string | null;
  pushed: string;
  /** share of the code by language, biggest first */
  langs: [name: string, share: number][];
};

type Release = { tag_name: string; published_at: string; draft: boolean; prerelease: boolean; assets: { download_count: number }[] };

// A repo's public numbers from the GitHub API. Runs at build time for first paint and again in the browser
// for a fresher copy; anything that fails just leaves the build copy (or nothing) in place.
export async function repoStats(url: string): Promise<Repo | null> {
  const name = new URL(url).pathname.slice(1); // https://github.com/owner/repo
  const get = (path: string) =>
    fetch(`https://api.github.com/repos/${name}${path}`, { headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(10000) });
  try {
    const [repo, rel, langs, commits] = await Promise.all([get(""), get("/releases?per_page=100"), get("/languages"), get("/commits?per_page=1")]);
    if (!repo.ok) return null;
    const r = await repo.json();
    const releases: Release[] = rel.ok ? (await rel.json()).filter((x: Release) => !x.draft) : [];
    const latest = releases.find((x) => !x.prerelease) ?? releases[0];
    const bytes: Record<string, number> = langs.ok ? await langs.json() : {};
    const sum = Object.values(bytes).reduce((s, n) => s + n, 0);
    // one commit per page, so the last page number is the commit count
    const last = commits.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/)?.[1];
    return {
      stars: r.stargazers_count,
      forks: r.forks_count,
      commits: last ? Number(last) : commits.ok ? (await commits.json()).length : null,
      releases: releases.length,
      downloads: releases.reduce((s, x) => s + x.assets.reduce((t, a) => t + a.download_count, 0), 0),
      latest: latest ? { tag: latest.tag_name, date: latest.published_at } : null,
      license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
      pushed: r.pushed_at,
      langs: Object.entries(bytes).sort((a, b) => b[1] - a[1]).map(([l, n]) => [l, n / sum]),
    };
  } catch {
    return null;
  }
}
