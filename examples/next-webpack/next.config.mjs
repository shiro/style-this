import { withStyleThis } from '@style-this/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export to avoid SSG issues with error pages
  output: undefined,
  webpack: (config) => {
    return config;
  },
};

export default withStyleThis(nextConfig);
