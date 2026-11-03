import SportHeader from "@/components/layout/SportHeader";
import MatchBoard from "@/components/matches/MatchBoard";

export const metadata = {
  title: "Cricket",
  description: "Live cricket scores, upcoming fixtures and recent results.",
};

export default function CricketPage() {
  return (
    <div className="flex flex-col gap-8">
      <SportHeader
        sport="cricket"
        title="Cricket"
        description="Live scores, plus fixtures and results from 7 days either side of today."
      />
      <MatchBoard initialSport="cricket" />
    </div>
  );
}
