import { handleListRequest } from "@/lib/api/handlers";

// GET /api/cricket/results
export function GET() {
  return handleListRequest("cricket", "results");
}
