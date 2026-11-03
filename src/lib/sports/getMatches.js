import { getCricketScores } from "../providers/cricketProvider.js";
import { getFootballMatch, getFootballMatches } from "../providers/footballProvider.js";
import { ProviderError } from "../providers/fetchProvider.js";
import { selectCategory } from "./categorize.js";
import { CRICKET, FOOTBALL } from "./config.js";

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

// Returns `{ match: null }` when the match doesn't exist or isn't available.
export async function getMatch(sport, matchId) {
  if (sport === "cricket") {
    // Details come from the same cached list as the score pages, so viewing a
    // match costs no extra API calls. Only recent and upcoming matches exist.
    const { matches, fetchedAt } = await getCricketScores();
    const match = matches.find((item) => item.id === matchId) ?? null;
    return { match, meta: buildMeta(sport, fetchedAt, "match") };
  }

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
