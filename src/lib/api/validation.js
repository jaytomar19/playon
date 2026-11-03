import { SPORTS } from "../sports/config.js";

export function isValidSport(sport) {
  return SPORTS.includes(sport);
}

// Provider IDs: football-data.org uses numbers; CricketData.org uses
// UUID-style strings. Anything else is rejected before calling a provider.
const MATCH_ID_PATTERNS = {
  football: /^\d{1,12}$/,
  cricket: /^[A-Za-z0-9-]{1,64}$/,
};

export function isValidMatchId(sport, matchId) {
  const pattern = MATCH_ID_PATTERNS[sport];
  return Boolean(pattern) && typeof matchId === "string" && pattern.test(matchId);
}
