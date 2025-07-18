// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverComponentsExternalPackages: ["puppeteer-core", "puppeteer"],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "puppeteer", "lighthouse"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these server-only packages on the client
      config.externals = config.externals || [];
      config.externals.push('lighthouse', 'puppeteer', 'puppeteer-core');
    }
    return config;
  }
};

export default nextConfig;

