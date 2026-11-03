import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <Logo />
        <div className="flex max-w-md flex-col gap-1 sm:text-right">
          <p>
            Cricket data from{" "}
            <a className="underline hover:text-foreground" href="https://cricketdata.org/">
              CricketData.org
            </a>
            . Football data provided by the{" "}
            <a className="underline hover:text-foreground" href="https://www.football-data.org/">
              Football-Data.org API
            </a>
            .
          </p>
          <p>Scores may be delayed. Playon only shows what its data sources report.</p>
        </div>
      </div>
    </footer>
  );
}
