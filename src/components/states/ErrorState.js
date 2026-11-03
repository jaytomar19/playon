import { RefreshCw, TriangleAlert } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-live/40 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-center gap-2 text-sm">
        <TriangleAlert size={18} className="shrink-0 text-live" aria-hidden="true" />
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-surface-2"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
