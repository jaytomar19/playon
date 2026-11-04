import { getCricketMatchInfo, getCricketScores } from "../providers/cricketProvider.js";
import { getFootballMatch, getFootballMatches } from "../providers/footballProvider.js";
import { ProviderError } from "../providers/fetchProvider.js";
import { selectCategory } from "./categorize.js";
import { CRICKET, FOOTBALL } from "./config.js";
import { normalizeCricketMatchInfo } from "./normalizeCricket.js";

// The single entry point the rest of the app uses to get sports data.
// Pages and Route Handlers call these; they never call providers directly.

function buildMeta(sport, fetchedAt, category) {
  const config = sport === "cricket" ? CRICKET : FOOTBALL;
  return {
    lastUpdated: fetchedAt,
    source: config.source,
    notice: config.notice,
    staleAfterSeconds:
      sport === "cricket" ? CRICKET.staleAfter : FOOTBALL.staleAfter[category],
  };
}

export async function getMatches(sport, category) {
  const { matches, fetchedAt } =
    sport === "cricket" ? await getCricketScores() : await getFootballMatches(category);

  return {
    matches: selectCategory(matches, category),
    meta: buildMeta(sport, fetchedAt, category),
  };
}

// The older of two ISO timestamps, so "Updated X ago" never overstates freshness.
function older(a, b) {
  if (!a || !b) return a ?? b ?? null;
  return Date.parse(a) <= Date.parse(b) ? a : b;
}

async function getCricketMatch(matchId) {
  // Only matches in the cached list (live + 7 days either side) are looked
  // up, so made-up IDs can't spend the daily quota.
  const { matches, fetchedAt } = await getCricketScores();
  const match = matches.find((item) => item.id === matchId) ?? null;
  if (!match) return { match: null, meta: buildMeta("cricket", fetchedAt, "match") };

  try {
    const info = await getCricketMatchInfo(matchId, match.status);
    const details = normalizeCricketMatchInfo(info.data, match.teams.map((team) => team.name));
    return {
      match: {
        ...match,
        details,
        // The full innings list replaces the one-innings warning.
        scoreNote: details.innings.length > 0 ? null : match.scoreNote,
      },
      meta: buildMeta("cricket", older(fetchedAt, info.fetchedAt), "match"),
    };
  } catch (error) {
    // Extra details are optional: show the basic match instead of failing.
    console.error(`[sports] cricket match_info unavailable: ${error.code ?? error.message}`);
    return {
      match: { ...match, details: null, detailsUnavailable: true },
      meta: buildMeta("cricket", fetchedAt, "match"),
    };
  }
}

// Returns `{ match: null }` when the match doesn't exist or isn't available.
export async function getMatch(sport, matchId) {
  if (sport === "cricket") return getCricketMatch(matchId);

  try {
    const { match, fetchedAt } = await getFootballMatch(matchId);
    return { match, meta: buildMeta(sport, fetchedAt, "match") };
  } catch (error) {
    if (error instanceof ProviderError && error.code === "NOT_FOUND") {
      return { match: null, meta: buildMeta(sport, null, "match") };
    }
    throw error;
  }
}
