import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {unoptimized: true},
  distDir: 'build'
};

export default nextConfig;
