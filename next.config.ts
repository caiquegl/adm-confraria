import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Event create/edit uploads cover + gallery via Server Actions.
  // Default 1MB limit returns an opaque 500 before Nest is called.
  // Cap at 4.5mb to stay under Vercel serverless request body limit.
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
