import { getSiteUrl } from "@/lib/siteUrl";

// /sitemap.xml — the stable pages. Match pages are short-lived, so they're
// left for search engines to discover through links.
export default function sitemap() {
  const base = getSiteUrl();
  return ["", "/cricket", "/football"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "always",
  }));
}
