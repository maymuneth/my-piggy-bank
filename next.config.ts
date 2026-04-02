import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        "@hyperlane-xyz/sdk": "./lib/empty.ts",
        "@hyperlane-xyz/registry": "./lib/empty.ts",
        "@hyperlane-xyz/utils": "./lib/empty.ts",
        "@fatsolutions/tongo-sdk": "./lib/empty.ts",
      },
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@hyperlane-xyz/sdk": false,
      "@hyperlane-xyz/registry": false,
      "@hyperlane-xyz/utils": false,
      "@fatsolutions/tongo-sdk": false,
      "fs": false,
      "net": false,
      "tls": false,
    };
    return config;
  },
};

export default nextConfig;