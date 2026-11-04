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

// "GROUP_STAGE" -> "Group stage". Regular league games use the matchday.
function describeRound(raw) {
  if (raw.stage && raw.stage !== "REGULAR_SEASON") {
    const stage = raw.stage.toLowerCase().replace(/_/g, " ");
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }
  return Number.isFinite(raw.matchday) ? `Matchday ${raw.matchday}` : null;
}

function describeHalfTime(score) {
  const home = numberOrNull(score?.halfTime?.home);
  const away = numberOrNull(score?.halfTime?.away);
  return home === null || away === null ? null : { home, away };
}

function normalizeTeam(raw, side, goals) {
  if (!raw || raw.id == null || !raw.name) return null;
  return {
    id: String(raw.id),
    name: raw.name,
    shortName: raw.tla || raw.shortName || null,
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

export function normalizeFootballList(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeFootballMatch).filter(Boolean);
}
