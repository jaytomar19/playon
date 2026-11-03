import { handleListRequest } from "@/lib/api/handlers";

// GET /api/football/results
export function GET() {
  return handleListRequest("football", "results");
}
