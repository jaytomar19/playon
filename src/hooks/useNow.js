"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 30 * 1000;

function subscribe(callback) {
  const timer = setInterval(callback, TICK_MS);
  return () => clearInterval(timer);
}

// Rounded so repeated reads within one tick return the same value.
function getNow() {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

/**
 * The current time, refreshed every 30 seconds. Returns `null` on the server
 * and during hydration, so server and browser HTML always match; time-based
 * text appears once the page is running in the browser.
 */
export function useNow() {
  return useSyncExternalStore(subscribe, getNow, () => null);
}
