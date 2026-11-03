// Placeholder cards shaped like real ones, so the layout doesn't jump.
export default function LoadingState({ label, count = 3 }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex animate-pulse flex-col gap-3 rounded-xl border border-line bg-surface p-4">
            <div className="h-3 w-1/2 rounded bg-surface-2" />
            <div className="h-9 rounded bg-surface-2" />
            <div className="h-9 rounded bg-surface-2" />
            <div className="h-3 w-1/3 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
