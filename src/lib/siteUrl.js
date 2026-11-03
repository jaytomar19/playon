// The public address of the site, used for absolute URLs in SEO files.
// On Vercel, VERCEL_PROJECT_PRODUCTION_URL is provided automatically;
// SITE_URL can override it (e.g. for a custom domain).
export function getSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
