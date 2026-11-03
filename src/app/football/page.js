import SportHeader from "@/components/layout/SportHeader";
import MatchBoard from "@/components/matches/MatchBoard";

export const metadata = {
  title: "Football",
  description: "Live football scores, upcoming fixtures and recent results.",
};

export default function FootballPage() {
  return (
    <div className="flex flex-col gap-8">
      <SportHeader
        sport="football"
        title="Football"
        description="Live scores, fixtures and results from the 12 competitions on our data plan."
      />
      <MatchBoard initialSport="football" />
    </div>
  );
}
