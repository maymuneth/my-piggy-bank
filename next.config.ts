import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@hyperlane-xyz/sdk": false,
      "@hyperlane-xyz/registry": false,
      "@hyperlane-xyz/utils": false,
      "@fatsolutions/tongo-sdk": false,
      "tongo-sdk": false,
      "fs": false,
      "net": false,
      "tls": false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      "starknet": require.resolve("starknet"),
    };
    return config;
  },
};

export default nextConfig;