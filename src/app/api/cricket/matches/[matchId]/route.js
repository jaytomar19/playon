import { handleMatchRequest } from "@/lib/api/handlers";

// GET /api/cricket/matches/:matchId
export function GET(request, { params }) {
  return handleMatchRequest("cricket", params);
}
