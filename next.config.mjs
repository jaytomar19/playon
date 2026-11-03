/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache Components is deliberately NOT enabled. Its `"use cache"` memory
  // cache is not shared between serverless instances on Vercel, which would
  // waste our small API quotas. We use the classic `fetch` cache instead
  // (`next: { revalidate }`), which Vercel persists across requests.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
