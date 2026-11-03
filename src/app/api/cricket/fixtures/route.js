import { handleListRequest } from "@/lib/api/handlers";

// GET /api/cricket/fixtures
export function GET() {
  return handleListRequest("cricket", "fixtures");
}
