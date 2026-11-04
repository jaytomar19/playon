import { slugify } from "../utils/slugify.js";

// Converts CricketData.org `cricScore` matches into Playon's match shape.
//
// Field names (t1, t2, t1s, t2s, ms, series, dateTimeGMT, …) were checked
// against a real response on 2026-11-04.

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
  const matchType = typeof raw.matchType === "string" && raw.matchType ? raw.matchType.toUpperCase() : null;

  return {
    id: String(raw.id),
    sport: "cricket",
    competition: series ? { id: slugify(series), name: series } : null,
    teams,
    status: STATUS_BY_MS[raw.ms] ?? "unknown",
    statusText: typeof raw.status === "string" && raw.status ? raw.status : null,
    startTime: toIsoTime(raw.dateTimeGMT),
    matchType,
    // For multi-day matches the feed sends one innings per team, so the
    // score shown may not be the full match score. Say so rather than imply it.
    scoreNote:
      matchType === "TEST" && teams.some((team) => team.score)
        ? "Only one innings per team is shown by the data feed."
        : null,
    providerUpdatedAt: null,
  };
}

// --- Match Info (detail pages only) ----------------------------------------

function ordinal(n) {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th";
  return `${n}${suffix}`;
}

// Finds which of the match's teams a provider name refers to (any case).
function findTeamName(teamNames, text) {
  const wanted = String(text ?? "").trim().toLowerCase();
  return teamNames.find((name) => name.toLowerCase() === wanted) ?? null;
}

// Labels look like "sikkim Inning 1" or "Manipur,Sikkim Inning 1"; in the
// second form the batting team is the name before the comma. If a label
// can't be matched to a team, the provider's text is kept as-is.
function describeInning(label, teamNames) {
  const match = String(label ?? "").match(/^(.*?)\s+Inning\s+(\d+)$/i);
  if (!match) return { team: null, label: label || null };
  const team = findTeamName(teamNames, match[1].split(",")[0]);
  if (!team) return { team: null, label };
  return { team, label: `${ordinal(Number(match[2]))} innings` };
}

/**
 * Extra details from the `match_info` endpoint: every innings, venue and toss.
 * `teamNames` are the names already shown on the page, used to tidy the
 * provider's lowercase or combined team labels.
 */
export function normalizeCricketMatchInfo(raw, teamNames) {
  if (!raw || typeof raw !== "object") return null;

  const innings = Array.isArray(raw.score)
    ? raw.score
        .filter((inning) => Number.isFinite(inning?.r))
        .map((inning) => ({
          ...describeInning(inning.inning, teamNames),
          runs: inning.r,
          wickets: Number.isFinite(inning.w) ? inning.w : null,
          overs: Number.isFinite(inning.o) ? String(inning.o) : null,
        }))
    : [];

  const tossTeam = raw.tossWinner ? findTeamName(teamNames, raw.tossWinner) ?? raw.tossWinner : null;
  const toss =
    tossTeam && typeof raw.tossChoice === "string" && raw.tossChoice
      ? `${tossTeam} won the toss and chose to ${raw.tossChoice.toLowerCase()}`
      : null;

  return {
    venue: typeof raw.venue === "string" && raw.venue.trim() ? raw.venue.trim() : null,
    toss,
    innings,
  };
}

export function normalizeCricketList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeCricketMatch).filter(Boolean);
}
