// Converts football-data.org v4 Match objects into Playon's match shape.
// Field reference: https://docs.football-data.org/general/v4/match.html

const STATUS_MAP = {
  SCHEDULED: { status: "upcoming", text: "Scheduled" },
  TIMED: { status: "upcoming", text: "Scheduled" },
  IN_PLAY: { status: "live", text: "In play" },
  PAUSED: { status: "live", text: "Paused" },
  FINISHED: { status: "completed", text: "Full time" },
  AWARDED: { status: "completed", text: "Result awarded" },
  POSTPONED: { status: "postponed", text: "Postponed" },
  SUSPENDED: { status: "postponed", text: "Suspended" },
  CANCELLED: { status: "cancelled", text: "Cancelled" },
};

const DURATION_TEXT = {
  EXTRA_TIME: "After extra time",
  PENALTY_SHOOTOUT: "Decided on penalties",
};

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

// "Matchday 9", "Quarter finals" or "League stage · Matchday 4".
function describeRound(raw) {
  const matchday = Number.isFinite(raw.matchday) ? `Matchday ${raw.matchday}` : null;
  if (!raw.stage || raw.stage === "REGULAR_SEASON") return matchday;
  const stage = raw.stage.toLowerCase().replace(/_/g, " ");
  const label = stage.charAt(0).toUpperCase() + stage.slice(1);
  return matchday ? `${label} · ${matchday}` : label;
}

function describeHalfTime(score) {
  const home = numberOrNull(score?.halfTime?.home);
  const away = numberOrNull(score?.halfTime?.away);
  return home === null || away === null ? null : { home, away };
}

// Only HTTPS image links from the provider are used as club crests.
function crestOrNull(url) {
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

function normalizeTeam(raw, side, goals) {
  if (!raw || raw.id == null || !raw.name) return null;
  return {
    id: String(raw.id),
    name: raw.name,
    shortName: raw.tla || raw.shortName || null,
    logo: crestOrNull(raw.crest),
    side,
    goals: numberOrNull(goals),
  };
}

export function normalizeFootballMatch(raw) {
  if (!raw || typeof raw !== "object" || raw.id == null) return null;

  const mapped = STATUS_MAP[raw.status] ?? { status: "unknown", text: null };
  const fullTime = raw.score?.fullTime ?? {};

  const teams = [
    normalizeTeam(raw.homeTeam, "home", fullTime.home),
    normalizeTeam(raw.awayTeam, "away", fullTime.away),
  ];
  // Fixtures in knockout rounds can have undecided teams; skip those.
  if (teams.includes(null)) return null;

  return {
    id: String(raw.id),
    sport: "football",
    competition: raw.competition?.id
      ? { id: String(raw.competition.id), name: raw.competition.name }
      : null,
    teams,
    status: mapped.status,
    statusText: mapped.text,
    startTime: raw.utcDate || null,
    minute: mapped.status === "live" ? (raw.minute ?? null) : null,
    winner: raw.score?.winner ?? null,
    durationText: DURATION_TEXT[raw.score?.duration] ?? null,
    // Extra detail-page fields; each is null when the provider doesn't send it.
    details: {
      venue: typeof raw.venue === "string" && raw.venue ? raw.venue : null,
      round: describeRound(raw),
      halfTime: describeHalfTime(raw.score),
    },
    providerUpdatedAt: raw.lastUpdated || null,
  };
}

/**
 * A competition's league table from /v4/competitions/{id}/standings.
 * Picks the overall ("TOTAL") table that contains one of `teamIds` (cups with
 * groups have one table per group). Returns null when there's no table, e.g.
 * for knockout-only competitions.
 */
export function normalizeFootballStandings(raw, teamIds = []) {
  const tables = Array.isArray(raw?.standings)
    ? raw.standings.filter((block) => block.type === "TOTAL" && Array.isArray(block.table))
    : [];
  if (tables.length === 0) return null;

  const hasTeam = (block) => block.table.some((row) => teamIds.includes(String(row.team?.id)));
  const chosen = tables.find(hasTeam) ?? tables[0];

  const rows = chosen.table
    .filter((row) => row.team?.id != null && row.team?.name)
    .map((row) => ({
      position: numberOrNull(row.position),
      team: {
        id: String(row.team.id),
        name: row.team.name,
        shortName: row.team.tla || row.team.shortName || null,
        logo: crestOrNull(row.team.crest),
      },
      played: numberOrNull(row.playedGames),
      won: numberOrNull(row.won),
      draw: numberOrNull(row.draw),
      lost: numberOrNull(row.lost),
      goalDifference: numberOrNull(row.goalDifference),
      points: numberOrNull(row.points),
    }));

  if (rows.length === 0) return null;
  const group = typeof chosen.group === "string" && chosen.group.startsWith("GROUP_")
    ? `Group ${chosen.group.slice(6)}`
    : null;
  return { group, rows };
}

export function normalizeFootballList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeFootballMatch).filter(Boolean);
}
