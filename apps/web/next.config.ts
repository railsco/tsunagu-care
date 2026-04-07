import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tsunagu-care/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },
};

export default nextConfig;
