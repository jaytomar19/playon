import { handleMatchRequest } from "@/lib/api/handlers";

// GET /api/football/matches/:matchId
export function GET(request, { params }) {
  return handleMatchRequest("football", params);
}
