"use client";

import { Star } from "lucide-react";
import { useFavourites } from "@/hooks/useFavourites";
import { favouriteKey } from "@/lib/sports/matchFilters";

export default function FavouriteButton({ sport, team }) {
  const { favourites, toggle } = useFavourites();
  const key = favouriteKey(sport, team.id);
  const active = favourites.includes(key);
  const label = active ? `Remove ${team.name} from favourites` : `Add ${team.name} to favourites`;

  return (
    <button
      type="button"
      onClick={() => toggle(key)}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      <Star
        size={16}
        className={active ? "fill-accent text-accent-text" : ""}
        strokeWidth={active ? 2.5 : 2}
      />
    </button>
  );
}
