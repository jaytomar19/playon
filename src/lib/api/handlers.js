import { connection } from "next/server";
import { getMatch, getMatches } from "../sports/getMatches.js";
import { errorFromException, errorResponse, successResponse } from "./responses.js";
import { isValidMatchId } from "./validation.js";

// Shared logic for the /api/{sport}/... Route Handlers, so each route file
// stays a one-liner.

export async function handleListRequest(sport, category) {
  // Marks the route as request-time, so it isn't frozen at build time.
  // Provider responses are still cached by `fetch` (see fetchProvider.js).
  await connection();
  try {
    const { matches, meta } = await getMatches(sport, category);
    return successResponse({ sport, category, data: matches, meta });
  } catch (error) {
    return errorFromException(error);
  }
}

export async function handleMatchRequest(sport, params) {
  await connection();
  const { matchId } = await params;
  if (!isValidMatchId(sport, matchId)) return errorResponse("INVALID_PARAMETER");

  try {
    const { match, meta } = await getMatch(sport, matchId);
    if (!match) return errorResponse("MATCH_NOT_FOUND");
    return successResponse({ sport, category: "match", data: match, meta });
  } catch (error) {
    return errorFromException(error);
  }
}
