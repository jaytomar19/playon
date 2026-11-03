// Playon mark: a volt tile with a "play" triangle, plus the wordmark.
export default function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8">
        <rect width="32" height="32" rx="8" fill="var(--accent)" />
        <path d="M12 9.5v13l11-6.5-11-6.5z" fill="var(--accent-foreground)" />
      </svg>
      <span className="font-display text-2xl font-bold uppercase tracking-wide">Playon</span>
    </span>
  );
}
