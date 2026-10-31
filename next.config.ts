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
  // @fontsource JP packages are 50–90MB each; never copy them into
  // Netlify's ___netlify-server-handler (50MB zipped upload limit).
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@fontsource/**/*",
      "node_modules/@fontsource-variable/**/*",
    ],
  },
};

export default nextConfig;
