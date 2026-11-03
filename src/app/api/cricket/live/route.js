import { handleListRequest } from "@/lib/api/handlers";

// GET /api/cricket/live
export function GET() {
  return handleListRequest("cricket", "live");
}
