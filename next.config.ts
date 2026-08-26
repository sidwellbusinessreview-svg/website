import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare's build variables are not automatically available as Worker
  // runtime bindings. Compile the non-secret provider choice into the server
  // bundle so ISR routes use the same source that generated static params.
  env: {
    CONTENT_SOURCE: process.env.CONTENT_SOURCE ?? "local",
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
