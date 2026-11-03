// Shared server-side fetch for sports providers: timeouts, caching and error
// mapping live here so each provider file only deals with its own API.

const TIMEOUT_MS = 8000;

// An error whose `code` is safe to show to the browser. The original details
// stay on the server and are never sent in API responses.
export class ProviderError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
  }
}

export function requireApiKey(name) {
  const key = process.env[name];
  if (!key) throw new ProviderError("NOT_CONFIGURED", `${name} is not set`);
  return key;
}

/**
 * Fetches JSON from a provider and caches successful responses for
 * `revalidate` seconds in Next.js's data cache.
 *
 * Returns the parsed body and `fetchedAt`: the time the provider actually
 * produced the response (its `Date` header). Because cached responses keep
 * their original headers, this stays honest even when served from cache.
 */
export async function fetchProviderJson(url, { headers = {}, revalidate }) {
  let response;
  try {
    response = await fetch(url, {
      headers,
      next: { revalidate },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === "TimeoutError") throw new ProviderError("PROVIDER_TIMEOUT");
    throw new ProviderError("SPORTS_DATA_UNAVAILABLE", error.message);
  }

  if (response.status === 429) throw new ProviderError("RATE_LIMITED");
  if (response.status === 404) throw new ProviderError("NOT_FOUND");
  if (!response.ok) {
    throw new ProviderError("SPORTS_DATA_UNAVAILABLE", `HTTP ${response.status}`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ProviderError("SPORTS_DATA_UNAVAILABLE", "Invalid JSON");
  }

  const dateHeader = response.headers.get("date");
  const fetchedAt = dateHeader ? new Date(dateHeader).toISOString() : null;

  return { body, fetchedAt };
}
