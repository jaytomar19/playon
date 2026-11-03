import { handleListRequest } from "@/lib/api/handlers";

// GET /api/football/live
export function GET() {
  return handleListRequest("football", "live");
}
