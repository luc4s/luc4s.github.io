import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {unoptimized: true},
  assetPrefix: './'
};

export default nextConfig;
