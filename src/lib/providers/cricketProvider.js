import { CRICKET } from "../sports/config.js";
import { normalizeCricketList } from "../sports/normalizeCricket.js";
import { fetchProviderJson, ProviderError, requireApiKey } from "./fetchProvider.js";

// CricketData.org (CricAPI): https://cricketdata.org/
const BASE_URL = "https://api.cricapi.com/v1";

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
  const apiKey = requireApiKey("CRICKET_API_KEY");
  const url = `${BASE_URL}/cricScore?apikey=${encodeURIComponent(apiKey)}`;

  const { body, fetchedAt } = await fetchProviderJson(url, { revalidate: CRICKET.revalidate });

  // CricAPI reports problems (bad key, quota used up) with HTTP 200 and
  // `status: "failure"`, so the body has to be checked as well.
  if (body?.status !== "success" || !Array.isArray(body.data)) {
    const reason = String(body?.reason ?? "");
    if (/limit|hits/i.test(reason)) throw new ProviderError("RATE_LIMITED", reason);
    throw new ProviderError("SPORTS_DATA_UNAVAILABLE", reason || "Unexpected response");
  }

  return { matches: normalizeCricketList(body.data), fetchedAt };
}
