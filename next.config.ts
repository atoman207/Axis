import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // sharp is already auto-externalized by Next; keep the pin explicit for native builds.
  serverExternalPackages: ["sharp", "pg"],
  // Keep oversized static trees out of serverless function bundles (Vercel 250MB /
  // Netlify 50MB zipped). public/ is served by the CDN and must never be fs-read
  // from server code, or NFT will pull the whole 300MB+ folder into the function.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@fontsource/**/*",
      "node_modules/@fontsource-variable/**/*",
      "public/**/*",
    ],
  },
  // Admin setup-schema reads this file at runtime via process.cwd().
  outputFileTracingIncludes: {
    "/api/admin/[...path]": ["./supabase/schema.sql"],
  },
};

export default nextConfig;
