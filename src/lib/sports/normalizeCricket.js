import { slugify } from "../utils/slugify.js";

// Converts CricketData.org `cricScore` matches into Playon's match shape.
//
// The field names below (t1, t2, t1s, t2s, ms, series, dateTimeGMT, …) come
// from the provider's documentation pages and must be re-checked against a
// real response once an API key is available.

const STATUS_BY_MS = {
  fixture: "upcoming",
  live: "live",
  result: "completed",
};

// "India [IND]" -> { name: "India", shortName: "IND" }
function parseTeam(raw) {
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const match = raw.trim().match(/^(.*?)\s*\[(.+)\]$/);
  const name = match ? match[1] : raw.trim();
  return {
    id: slugify(name),
    name,
    shortName: match ? match[2] : null,
  };
}

// "245/6 (50)" or "180 & 95/3 (31.2)" -> innings list. Returns null when the
// text doesn't follow that pattern, so the UI falls back to the raw text.
export function parseCricketScore(text) {
  if (typeof text !== "string" || text.trim() === "") return null;

  const innings = [];
  for (const part of text.split("&")) {
    const match = part.trim().match(/^(\d+)(?:\/(\d+))?(?:\s*\((\d+(?:\.\d)?)\))?$/);
    if (!match) return null;
    innings.push({
      runs: Number(match[1]),
      // A score without "/w" means all out or not stated; we don't guess.
      wickets: match[2] === undefined ? null : Number(match[2]),
      overs: match[3] === undefined ? null : match[3],
    });
  }
  return innings;
}

// The provider sends GMT times without a timezone suffix.
function toIsoTime(value) {
  if (typeof value !== "string" || value === "") return null;
  const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function normalizeCricketMatch(raw) {
  if (!raw || typeof raw !== "object" || !raw.id) return null;

  const teams = [
    { team: parseTeam(raw.t1), scoreText: raw.t1s },
    { team: parseTeam(raw.t2), scoreText: raw.t2s },
  ].map(({ team, scoreText }) => {
    if (!team) return null;
    const text = typeof scoreText === "string" && scoreText.trim() ? scoreText.trim() : null;
    return {
      ...team,
      // Team logos are not shown: the provider's terms forbid hotlinking images.
      score: text ? { text, innings: parseCricketScore(text) } : null,
    };
  });

  if (teams.includes(null)) return null;

  const series = typeof raw.series === "string" && raw.series.trim() ? raw.series.trim() : null;

  return {
    id: String(raw.id),
    sport: "cricket",
    competition: series ? { id: slugify(series), name: series } : null,
    teams,
    status: STATUS_BY_MS[raw.ms] ?? "unknown",
    statusText: typeof raw.status === "string" && raw.status ? raw.status : null,
    startTime: toIsoTime(raw.dateTimeGMT),
    matchType: typeof raw.matchType === "string" ? raw.matchType.toUpperCase() : null,
    providerUpdatedAt: null,
  };
}

export function normalizeCricketList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeCricketMatch).filter(Boolean);
}
