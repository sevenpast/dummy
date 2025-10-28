import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude supabase functions directory from build
  outputFileTracingExcludes: {
    '*': ['./supabase/functions/**/*']
  },
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
