// Refresh policy, derived from each provider's free-plan limits.
// All values are in seconds. See DECISIONS.md for the reasoning.

export const SPORTS = ["cricket", "football"];
export const CATEGORIES = ["live", "fixtures", "results"];

export const CRICKET = {
  source: "CricketData.org",
  // One `cricScore` call covers live matches plus 7 days either side, so it
  // feeds all three categories. Free plan = 100 calls/day. Caching for
  // 20 minutes means at most 72 calls/day, leaving headroom for development.
  revalidate: 20 * 60,
  // Shown in the UI when data is older than this.
  staleAfter: 45 * 60,
  notice: "Cricket scores refresh about every 20 minutes on the free data plan.",
};

export const FOOTBALL = {
  source: "football-data.org",
  // Free plan = 10 calls/minute, no daily cap, and scores are delayed.
  revalidate: {
    live: 60,
    fixtures: 30 * 60,
    results: 10 * 60,
    match: 60,
  },
  staleAfter: {
    live: 5 * 60,
    fixtures: 2 * 60 * 60,
    results: 60 * 60,
    match: 5 * 60,
  },
  notice: "Football scores may be delayed on the free data plan.",
};

// How often the browser re-asks Playon's own API for live data. This reads
// our server cache, so it does not spend provider quota.
export const CLIENT_LIVE_REFRESH_MS = 60 * 1000;
