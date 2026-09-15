import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {tsconfigPath:process.env.HAVEN_SITES_BUILD === '1' ? 'tsconfig.json' : 'tsconfig.next.json'},
};

export default nextConfig;
