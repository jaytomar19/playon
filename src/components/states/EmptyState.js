// A successful response with nothing to show. This is not an error.
export default function EmptyState({ message }) {
  return (
    <p className="rounded-xl border border-dashed border-line px-5 py-6 text-center text-sm text-muted">
      {message}
    </p>
  );
}
