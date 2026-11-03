import { ProviderError } from "../providers/fetchProvider.js";

// Every error the browser can receive. Messages are written for users and
// never include provider details, keys or stack traces.
const ERRORS = {
  INVALID_PARAMETER: { status: 400, message: "The request is not valid." },
  MATCH_NOT_FOUND: { status: 404, message: "This match could not be found." },
  RATE_LIMITED: {
    status: 429,
    message: "The score provider's request limit has been reached. Please try again later.",
  },
  NOT_CONFIGURED: {
    status: 503,
    message: "This score source has not been configured yet.",
  },
  PROVIDER_TIMEOUT: {
    status: 504,
    message: "The score provider took too long to respond.",
  },
  SPORTS_DATA_UNAVAILABLE: {
    status: 502,
    message: "Score data is temporarily unavailable.",
  },
};

const NO_STORE = { "Cache-Control": "no-store" };

export function successResponse(body) {
  return Response.json({ success: true, ...body }, { headers: NO_STORE });
}

export function errorResponse(code) {
  const error = ERRORS[code] ?? ERRORS.SPORTS_DATA_UNAVAILABLE;
  const safeCode = ERRORS[code] ? code : "SPORTS_DATA_UNAVAILABLE";
  return Response.json(
    { success: false, error: { code: safeCode, message: error.message }, meta: { lastUpdated: null } },
    { status: error.status, headers: NO_STORE },
  );
}

// Turns any thrown error into a safe response, logging the real cause on the
// server only (never the API key — it's not part of these messages).
export function errorFromException(error) {
  if (error instanceof ProviderError) {
    if (error.code !== "NOT_CONFIGURED") console.error(`[sports] ${error.code}: ${error.message}`);
    return errorResponse(error.code === "NOT_FOUND" ? "SPORTS_DATA_UNAVAILABLE" : error.code);
  }
  console.error("[sports] Unexpected error:", error);
  return errorResponse("SPORTS_DATA_UNAVAILABLE");
}

export function getErrorMessage(code) {
  return (ERRORS[code] ?? ERRORS.SPORTS_DATA_UNAVAILABLE).message;
}
