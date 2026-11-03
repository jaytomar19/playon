export const FAVOURITES_STORAGE_KEY = "playon-favourites";

// Reads the stored favourites safely. Anything missing, corrupt or of the
// wrong type becomes an empty list instead of crashing the page.
export function parseFavourites(raw) {
  if (typeof raw !== "string" || raw === "") return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((item) => typeof item === "string" && item.includes(":")))];
  } catch {
    return [];
  }
}

export function toggleFavourite(favourites, key) {
  return favourites.includes(key)
    ? favourites.filter((item) => item !== key)
    : [...favourites, key];
}
