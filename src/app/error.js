"use client";

// Error boundaries must be Client Components so they can offer a retry.
// Next.js passes `reset`, which re-renders the failed segment.
export default function Error({ reset }) {
  return (
    <section role="alert" className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-foreground/70">This page could not be displayed.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md border border-foreground/20 px-4 py-2 font-medium hover:bg-foreground/5"
      >
        Try again
      </button>
    </section>
  );
}
