import Link from "next/link";

const NAV_LINKS = [
  { href: "/cricket", label: "Cricket" },
  { href: "/football", label: "Football" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Playon
        </Link>
        <nav aria-label="Sports">
          <ul className="flex gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
