// Snapshots my daily GitHub contribution counts into src/content/days.json for the hero.
// Only the per-day numbers are kept: no repositories, no messages, nothing about private work beyond a count.
// Run with `npm run days` (needs the GitHub CLI, signed in). The build reads the snapshot; it never calls GitHub.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ACCOUNTS = ["ChinmayyK", "chinmayyk1"];
// GitHub holds almost nothing of mine before this; the record starts in earnest here
const SINCE = "2025-07-01";
const DAY = 86_400_000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);

const gql = (query) => JSON.parse(execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], { encoding: "utf8" })).data;

const counts = new Map();
let first = Infinity;
for (const login of ACCOUNTS) {
  const created = Date.parse(gql(`query{user(login:"${login}"){createdAt}}`).user.createdAt);
  first = Math.min(first, created);
  // the API answers at most a year per request
  for (let from = created; from < Date.now(); from += 365 * DAY) {
    const to = Math.min(from + 365 * DAY - 1, Date.now());
    const data = gql(`query{user(login:"${login}"){contributionsCollection(from:"${new Date(from).toISOString()}",to:"${new Date(to).toISOString()}"){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`);
    for (const w of data.user.contributionsCollection.contributionCalendar.weeks)
      for (const d of w.contributionDays) counts.set(d.date, (counts.get(d.date) ?? 0) + d.contributionCount);
  }
}

const start = SINCE > iso(first) ? SINCE : iso(first);
const days = [];
for (let t = Date.parse(start); iso(t) <= iso(Date.now()); t += DAY) days.push(counts.get(iso(t)) ?? 0);
writeFileSync(new URL("../src/content/days.json", import.meta.url), JSON.stringify({ start, days }) + "\n");
console.log(`${days.length} days from ${start}, ${days.filter(Boolean).length} with contributions`);
