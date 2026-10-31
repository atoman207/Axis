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
  // Keep native image tooling out of the traced server graph when possible.
  serverExternalPackages: ["sharp"],
  // Keep large files out of Netlify's ___netlify-server-handler (50MB zipped upload limit):
  // @fontsource JP packages are 50–90MB each, and public/ (300MB+) is served by the CDN,
  // never read by server code.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@fontsource/**/*",
      "node_modules/@fontsource-variable/**/*",
      "public/**/*",
    ],
  },
};

export default nextConfig;
