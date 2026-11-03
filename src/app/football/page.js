export const metadata = {
  title: "Football",
  description: "Live football scores, upcoming fixtures and recent results.",
};

export default function FootballPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Football</h1>
      <p className="text-foreground/70">Football score data is not connected yet.</p>
    </section>
  );
}
