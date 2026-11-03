import HeroArt from "@/components/layout/HeroArt";
import MatchBoard from "@/components/matches/MatchBoard";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      {/* The hero keeps its dark "floodlit" look in both themes. */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0e1511] px-6 py-10 text-[#edf2ea] sm:px-10 sm:py-14">
        <HeroArt className="absolute inset-0 h-full w-full" />
        <div className="relative flex max-w-xl flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c6f135]">
            Cricket · Football
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] sm:text-6xl">
            Every run.
            <br />
            Every goal.
          </h1>
          <p className="text-[#b7c2ba]">
            Live scores, fixtures and results, straight from the data. If a score isn&apos;t
            available, we say so — we never guess.
          </p>
        </div>
      </section>

      <MatchBoard showSportTabs />
    </div>
  );
}
