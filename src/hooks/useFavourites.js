"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FAVOURITES_STORAGE_KEY, parseFavourites, toggleFavourite } from "@/lib/favourites";

// A tiny shared store over localStorage, so every star on the page updates
// together. `useSyncExternalStore` uses the empty server snapshot during
// hydration, then reads localStorage — avoiding hydration mismatches.

const EMPTY = [];
const listeners = new Set();
let cachedRaw;
let cachedList = EMPTY;

function readFavourites() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode, browser settings).
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = parseFavourites(raw);
  }
  return cachedList;
}

function subscribe(callback) {
  listeners.add(callback);
  // Keeps other open tabs in sync too.
  const onStorage = (event) => {
    if (event.key === FAVOURITES_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavourites() {
  const favourites = useSyncExternalStore(subscribe, readFavourites, () => EMPTY);

  const toggle = useCallback((key) => {
    const next = toggleFavourite(readFavourites(), key);
    try {
      window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      return;
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { favourites, toggle };
}
