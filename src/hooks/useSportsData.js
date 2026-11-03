"use client";

import { useCallback, useEffect, useState } from "react";

const NETWORK_ERROR = {
  code: "NETWORK_ERROR",
  message: "Could not reach Playon. Check your connection and try again.",
};

/**
 * Loads one Playon API endpoint, e.g. "/api/football/live".
 *
 * - `status` is "loading", "success" or "error".
 * - If a later refresh fails, the last good data stays on screen and
 *   `refreshFailed` becomes true, so the UI can say the data is not current.
 * - With `refreshMs`, it re-fetches on a timer while the tab is visible.
 */
export function useSportsData(url, { refreshMs } = {}) {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    meta: null,
    error: null,
    refreshFailed: false,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let controller;

    function fail(error) {
      setState((prev) =>
        prev.data
          ? { ...prev, refreshFailed: true }
          : { status: "error", data: null, meta: null, error, refreshFailed: false },
      );
    }

    async function load() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        const body = await response.json().catch(() => null);
        if (cancelled) return;
        if (body?.success) {
          setState({ status: "success", data: body.data, meta: body.meta, error: null, refreshFailed: false });
        } else {
          fail(body?.error ?? NETWORK_ERROR);
        }
      } catch (error) {
        if (!cancelled && error.name !== "AbortError") fail(NETWORK_ERROR);
      }
    }

    load();
    const timer = refreshMs
      ? setInterval(() => {
          if (!document.hidden) load();
        }, refreshMs)
      : null;

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      controller?.abort();
    };
  }, [url, refreshMs, attempt]);

  const retry = useCallback(() => {
    setState((prev) => (prev.data ? prev : { ...prev, status: "loading", error: null }));
    setAttempt((count) => count + 1);
  }, []);

  return { ...state, retry };
}
