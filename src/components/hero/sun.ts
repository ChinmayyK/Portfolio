// Where the sun and moon are over Mumbai at a given moment. The formulas are the standard
// low-precision ones (as in Vladimir Agafonkin's SunCalc): good to a fraction of a degree,
// which is far more than a shadow needs.

export const MUMBAI = { lat: 19.076, lng: 72.8777 };
const IST = 5.5 * 3_600_000;

const rad = Math.PI / 180;
const e = rad * 23.4397; // obliquity of the Earth
const toDays = (t: number) => t / 86_400_000 - 0.5 + 2_440_588 - 2_451_545;

const rightAscension = (l: number, b: number) => Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
const declination = (l: number, b: number) => Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
const sidereal = (d: number, lw: number) => rad * (280.16 + 360.9856235 * d) - lw;

function sunCoords(d: number) {
  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + rad * 102.9372 + Math.PI;
  return { ra: rightAscension(L, 0), dec: declination(L, 0) };
}

function moonCoords(d: number) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.22935 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  return { ra: rightAscension(l, b), dec: declination(l, b) };
}

export type Sky = {
  /** degrees above the horizon */
  altitude: number;
  /** compass bearing in degrees: 0 north, 90 east */
  bearing: number;
};

function position(t: number, body: "sun" | "moon"): Sky {
  const lw = rad * -MUMBAI.lng, phi = rad * MUMBAI.lat, d = toDays(t);
  const c = body === "sun" ? sunCoords(d) : moonCoords(d);
  const H = sidereal(d, lw) - c.ra;
  const altitude = Math.asin(Math.sin(phi) * Math.sin(c.dec) + Math.cos(phi) * Math.cos(c.dec) * Math.cos(H));
  const azimuth = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(c.dec) * Math.cos(phi)); // from south, westward
  return { altitude: altitude / rad, bearing: ((azimuth / rad + 180) % 360 + 360) % 360 };
}

export const sun = (t: number) => position(t, "sun");
export const moon = (t: number) => position(t, "moon");

/** midnight in Mumbai on the day that contains t */
export const mumbaiMidnight = (t: number) => {
  const local = t + IST;
  return local - (local % 86_400_000) - IST;
};

export const mumbaiClock = (t: number) =>
  new Date(t).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).replace(/\s?([ap])m/i, " $1m").toLowerCase();

const POINTS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
export const compass = (bearing: number) => POINTS[Math.round(bearing / 45) % 8];

/** what lights the page at time t: the sun, else the moon if it's up, else nothing */
export function light(t: number) {
  const s = sun(t);
  if (s.altitude > -2) return { by: "sun" as const, ...s };
  const m = moon(t);
  if (m.altitude > 2) return { by: "moon" as const, ...m };
  return { by: "none" as const, ...s };
}
