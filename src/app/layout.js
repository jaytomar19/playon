import { Barlow_Condensed, Geist } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getSiteUrl } from "@/lib/siteUrl";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Condensed display face for the brand, headings and scores.
const display = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Site-wide SEO defaults. Individual pages can override `title` and the
// template turns it into e.g. "Cricket | Playon".
export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Playon — Live cricket and football scores",
    template: "%s | Playon",
  },
  description:
    "Live scores, upcoming fixtures and recent results for cricket and football.",
  openGraph: {
    siteName: "Playon",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e0b" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // The theme script changes <html>'s class before React loads, so React
    // is told not to warn about that one difference.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
