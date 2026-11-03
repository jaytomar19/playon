"use client";

import ErrorState from "@/components/states/ErrorState";

// Error boundaries must be Client Components so they can offer a retry.
// Next.js passes `reset`, which re-renders the failed segment.
export default function Error({ reset }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-4xl font-bold uppercase">Something went wrong</h1>
      <ErrorState message="This page could not be displayed." onRetry={() => reset()} />
    </section>
  );
}
