import { FOOTBALL } from "../sports/config.js";
import {
  normalizeFootballList,
  normalizeFootballMatch,
  normalizeFootballStandings,
} from "../sports/normalizeFootball.js";
import { fetchProviderJson, ProviderError, requireApiKey } from "./fetchProvider.js";

// football-data.org v4: https://docs.football-data.org/general/v4/index.html
const BASE_URL = "https://api.football-data.org/v4";

// YYYY-MM-DD in UTC, `offsetDays` from today.
function utcDate(offsetDays) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

const LIST_QUERIES = {
  live: () => "status=LIVE",
  fixtures: () => `dateFrom=${utcDate(0)}&dateTo=${utcDate(7)}`,
  results: () => `dateFrom=${utcDate(-7)}&dateTo=${utcDate(0)}`,
};

async function request(path, revalidate) {
  const apiKey = requireApiKey("FOOTBALL_API_KEY");
  return fetchProviderJson(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey },
    revalidate,
  });
}

// `category` is "live", "fixtures" or "results". The date-range lists contain
// every status; the caller keeps only the matches that fit the category.
export async function getFootballMatches(category) {
  const { body, fetchedAt } = await request(
    `/matches?${LIST_QUERIES[category]()}`,
    FOOTBALL.revalidate[category],
  );
  if (!Array.isArray(body?.matches)) {
    throw new ProviderError("SPORTS_DATA_UNAVAILABLE", "Unexpected response");
  }
  return { matches: normalizeFootballList(body.matches), fetchedAt };
}

// League tables change only after matches finish, so an hour of caching is
// plenty: at most one call per competition per hour.
export async function getFootballStandings(competitionId, teamIds) {
  const { body, fetchedAt } = await request(
    `/competitions/${encodeURIComponent(competitionId)}/standings`,
    FOOTBALL.revalidate.standings,
  );
  return { standings: normalizeFootballStandings(body, teamIds), fetchedAt };
}

export async function getFootballMatch(matchId) {
  const { body, fetchedAt } = await request(
    `/matches/${encodeURIComponent(matchId)}`,
    FOOTBALL.revalidate.match,
  );
  return { match: normalizeFootballMatch(body), fetchedAt };
}
