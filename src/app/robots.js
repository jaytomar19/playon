import { getSiteUrl } from "@/lib/siteUrl";

// /robots.txt — allow pages, keep crawlers out of the JSON API.
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
