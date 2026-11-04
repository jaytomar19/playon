import Image from "next/image";

// The club crest when the provider supplies one (football), otherwise a
// short-code tile (cricket: its provider forbids hotlinking images).
export default function TeamBadge({ team, sport, large = false, small = false }) {
  const size = large ? "h-14 w-14 text-lg" : small ? "h-6 w-6 text-[0.6rem]" : "h-9 w-9 text-xs";
  const pixels = large ? 56 : small ? 24 : 36;

  if (team.logo) {
    return (
      <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${size}`}>
        {/* `unoptimized`: crests are tiny already, and this avoids spending
            Vercel's image-optimization quota. */}
        <Image
          src={team.logo}
          alt=""
          width={pixels}
          height={pixels}
          unoptimized
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  const code = (team.shortName || team.name.slice(0, 3)).slice(0, 4).toUpperCase();
  const ring = sport === "cricket" ? "border-cricket" : "border-football";

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg border-2 bg-surface-2 font-display font-bold tracking-wide ${ring} ${size}`}
    >
      {code}
    </span>
  );
}
