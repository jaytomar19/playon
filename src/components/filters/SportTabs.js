const SPORT_OPTIONS = [
  { value: "cricket", label: "Cricket" },
  { value: "football", label: "Football" },
];

export default function SportTabs({ sport, onChange }) {
  return (
    <div role="group" aria-label="Sport" className="inline-flex w-fit rounded-full border border-line bg-surface p-1">
      {SPORT_OPTIONS.map((option) => {
        const active = option.value === sport;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-1.5 font-display text-lg font-bold uppercase tracking-wide transition-colors ${
              active ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
