import { CRICKET } from "../sports/config.js";
import { normalizeCricketList } from "../sports/normalizeCricket.js";
import { fetchProviderJson, ProviderError, requireApiKey } from "./fetchProvider.js";

// CricketData.org (CricAPI): https://cricketdata.org/
const BASE_URL = "https://api.cricapi.com/v1";

// CricAPI reports problems (bad key, quota used up) with HTTP 200 and
// `status: "failure"`, so the body has to be checked as well.
function checkBody(body) {
  if (body?.status === "success" && body.data) return;
  const reason = String(body?.reason ?? "");
  if (/limit|hits/i.test(reason)) throw new ProviderError("RATE_LIMITED", reason);
  throw new ProviderError("SPORTS_DATA_UNAVAILABLE", reason || "Unexpected response");
}

async function request(path, revalidate) {
  const apiKey = requireApiKey("CRICKET_API_KEY");
  const separator = path.includes("?") ? "&" : "?";
  const { body, fetchedAt } = await fetchProviderJson(
    `${BASE_URL}${path}${separator}apikey=${encodeURIComponent(apiKey)}`,
    { revalidate },
  );
  checkBody(body);
  return { data: body.data, fetchedAt };
}

// The live, fixtures and results lists all come from this one call, and the
// browser asks for all three at once. While a call is in progress, later
// callers share it instead of spending more of the 100 calls/day.
let inFlight = null;

// Returns every live match plus those from 7 days before and after today.
export function getCricketScores() {
  if (!inFlight) {
    inFlight = loadCricketScores().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}

async function loadCricketScores() {
  const { data, fetchedAt } = await request("/cricScore", CRICKET.revalidate);
  if (!Array.isArray(data)) throw new ProviderError("SPORTS_DATA_UNAVAILABLE", "Unexpected response");
  return { matches: normalizeCricketList(data), fetchedAt };
}

// Full details for one match (every innings, venue, toss). Returns the raw
// provider data; the caller normalizes it with the match's team names.
export async function getCricketMatchInfo(matchId, status) {
  const revalidate = CRICKET.matchInfoRevalidate[status] ?? CRICKET.matchInfoRevalidate.default;
  return request(`/match_info?id=${encodeURIComponent(matchId)}`, revalidate);
}
