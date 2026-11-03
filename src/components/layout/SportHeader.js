export default function SportHeader({ sport, title, description }) {
  const bar = sport === "cricket" ? "bg-cricket" : "bg-football";
  return (
    <header className="flex flex-col gap-2">
      <span aria-hidden="true" className={`h-1.5 w-12 rounded-full ${bar}`} />
      <h1 className="font-display text-5xl font-bold uppercase">{title}</h1>
      <p className="text-muted">{description}</p>
    </header>
  );
}
