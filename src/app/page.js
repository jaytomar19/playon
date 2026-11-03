import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Live cricket and football scores
      </h1>
      <p className="max-w-2xl text-foreground/70">
        Score data is not connected yet. Live scores, fixtures and results will
        appear here once the sports data providers are integrated.
      </p>
      <div className="flex gap-4">
        <Link
          href="/cricket"
          className="rounded-md border border-foreground/20 px-4 py-2 font-medium hover:bg-foreground/5"
        >
          Cricket
        </Link>
        <Link
          href="/football"
          className="rounded-md border border-foreground/20 px-4 py-2 font-medium hover:bg-foreground/5"
        >
          Football
        </Link>
      </div>
    </section>
  );
}
