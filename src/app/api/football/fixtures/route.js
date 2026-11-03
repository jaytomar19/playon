import { handleListRequest } from "@/lib/api/handlers";

// GET /api/football/fixtures
export function GET() {
  return handleListRequest("football", "fixtures");
}
