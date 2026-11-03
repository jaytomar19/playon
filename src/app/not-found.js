import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-10">
      <p className="font-display text-7xl font-bold text-accent-text">404</p>
      <h1 className="font-display text-4xl font-bold uppercase">Page not found</h1>
      <p className="text-muted">
        This page or match doesn&apos;t exist, or it&apos;s outside the dates our data covers.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90"
      >
        Back to scores
      </Link>
    </section>
  );
}
