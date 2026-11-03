import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-foreground/70">The page you are looking for does not exist.</p>
      <Link href="/" className="font-medium underline">
        Back to Playon
      </Link>
    </section>
  );
}
